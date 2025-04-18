import React, { useEffect, useState } from 'react'
import { Form } from "react-bootstrap";
import { BiMinus, BiPlus } from "react-icons/bi";
import { MdAdd, MdRemove } from "react-icons/md";
import { IoAddSharp } from "react-icons/io5";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import numeral from "numeral";
import { useNavigate } from 'react-router-dom';

import { product_selection_schema, invoice_disc_schema } from "../../Utils/yup-schema-validator/transactions-schema";
import ErrorMessage from "../../Components/ErrorMessage";
import SVG from "../../assets/Svg";
import { useAuth } from "../../app-context/auth-user-context";
import handleErrMsg from "../../Utils/error-handler";
import { TransactionItem } from "../../Entities/TransactionItem";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import { ThreeDotLoading } from "../../Components/react-loading-indicators/Indicator";
import transactionsController from "../../Controllers/transactions-controller";
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import tractController from '../../Controllers/tract-controller';
import { useNumericCodeScanner } from '../../Utils/useNumericCodeScanner';

const SectionTransaction = () => {

	const onCodeScan = (code) => {
		//	detect if item already exists in the list
		const found = itemOptions.find(i => i.value.code === code);
		if(found){
			//	is list item > 0 ?. if yes check if item exists in the list to update qty
			if(transactionItems.length > 0){
				const listItem = transactionItems.find(i => i.id == found.value.id);
				if(listItem){
					increment(listItem, 1);
					return;
				}else {
					createItemFromBarcodeScan(found);
				}
			}else {
				//	not in the list, create new item
				if(found){
					createItemFromBarcodeScan(found);
					return;
				}else {
					toast.error(`No item found with code ${code}`);
				}
			}
		}else {
			toast.error(`No item found with code ${code}`);
		}
		
	}
	
	const createItemFromBarcodeScan = (found) => {
		const item = new TransactionItem();
		item.id = found.value.id;
		item.name = found.value.itemName;
		item.unitSalesPrice = found.value.salesPrice.unitSalesPrice;
		item.pkgSalesPrice = found.value.salesPrice.packSalesPrice;
		item.qtyType = 'Unit';
		item.qty = 1;
		item.discount = 0;
		//	soldOutPrice is original item price (pack or unit) less discount
		item.itemSoldOutPrice = found.value.salesPrice.unitSalesPrice;
		transactionItems.push(item);
		setTransactionItems(transactionItems);
		updateTransactionAmount();
		
		//	reset fields for next input
		productSelectionReset();
		setUnitPrice(0);
		setPkgPrice(0);
	}

	const navigate = useNavigate();
	useNumericCodeScanner(onCodeScan);
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();

	const {
		register: productSelectionRegister,
		handleSubmit: handleProductSelectionSubmit,
		control: productSelectionControl,
		setValue: productSelectionSetValue,
		reset: productSelectionReset,
		formState: { errors: productSelectionErrors },
	} = useForm({
		resolver: yupResolver(product_selection_schema),
		defaultValues: {
			product: null,
			qty: 0,
			item_disc: 0,
            qty_type: "Unit", 
            item_disc_type: 'n'
		},
	});

	const {
		register: invoiceDiscRegister,
		handleSubmit: handleInvoiceDiscSubmit,
		setValue: invoiceDiscSetValue,
		reset: invoiceDiscReset,
		formState: { errors: invoiceDiscErrors },
	} = useForm({
		resolver: yupResolver(invoice_disc_schema),
		defaultValues: {
			invoice_disc: 0,
            invoice_disc_type: 'n'
		},
	});
	
	const [networkRequest, setNetworkRequest] = useState(false);
		
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState("");
	const [entityToEdit, setEntityToEdit] = useState(null);
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [dropDownMsg, setDropDownMsg] = useState("");
    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
	//  for items
	const [transactionItems, setTransactionItems] = useState([]);
	const [itemOptions, setItemOptions] = useState([]);
	const [itemsLoading, setItemsLoading] = useState(true);
    
    //  for tracts
    const [tractOptions, setTractOptions] = useState([]);
	const [tractsLoading, setTractsLoading] = useState(true);

	//	for controlling the increment and decrement buttons while updating cart
	const [updating, setUpdating] = useState(false);
	const [unitPrice, setUnitPrice] = useState(0);
	const [pkgPrice, setPkgPrice] = useState(0);
	
	const [invoiceProps, setInvoiceProps] = useState({
		invoiceId: 0,
		invoiceDisc: 0,
		calculatedInvoiceDisc: 0,
		invoiceDiscType: 'n'
	});

	const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

    const tractTransactionOffCanvasMenu = [
        { label: "Search Invoice", onClickParams: {evtName: 'invoiceSearch'} },
        { label: "Select Section", onClickParams: {evtName: 'sectionSelect'} },
    ];

	useEffect( () => {
		initialize();
	}, []);

	const initialize = async () => {
		try {
            const tractsRequest = await tractController.fetchAllActive();

            //	check if the request to fetch items doesn't fail before setting values to display
            if(tractsRequest){
				setTractOptions(tractsRequest.data.map( tract => ({label: tract.name, value: tract}) ))
                setTractsLoading(false);
            }
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return initialize();
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
	};

	const addInvoiceDisc = (data) => {
		invoiceProps.invoiceDiscType = data.invoice_disc_type;
		invoiceProps.invoiceDisc = data.invoice_disc;
		updateTransactionAmount();
	}

	const resetPage = () => {
		setTransactionItems([]);
		setInvoiceProps({
			invoiceId: 0,
			invoiceDisc: 0,
			calculatedInvoiceDisc: 0,
			invoiceDiscType: 'n'
		});
		removeInvoiceDisc();

        productSelectionReset();

        setUnitPrice(0);
        setPkgPrice(0);
		setTotalTransactionAmount(0);
	}

	const removeInvoiceDisc = () => {
		setInvoiceProps({
			invoiceId: 0,
			invoiceDisc: 0,
			calculatedInvoiceDisc: 0,
			invoiceDiscType: 'n'
		});
		invoiceDiscReset();
		setTotalTransactionAmount(numeral(calcSubTotalAmount(transactionItems)).subtract(0).value());
	}

	const onSubmit = (data) => {
		//	detect if item already exists in the list
		const indexPos = transactionItems.findIndex(i => i.id == data.product.value.id);
		if(indexPos > -1){
			toast.error('Item already added to list, consider updating quantity');
			return;
		}
		const item = new TransactionItem(data);
		item.discount = 0;
		if(data.item_disc > 0){
			if(user.hasAuth('ITEM_DISCOUNT')){
				item.discount = data.item_disc_type === "perc" 
				? numeral(data.item_disc).divide(100).multiply(data.qty_type.toLowerCase() === "unit" ? item.unitSalesPrice : item.pkgSalesPrice).value() 
				: data.item_disc;
			}else {
				toast.error("Account doesn't support discount feature. Please contact your supervisor");
				return;
			}
		}
		//	soldOutPrice is original item price (pack or unit) less discount
		item.itemSoldOutPrice = data.qty_type.toLowerCase() === "unit" 
			? numeral(item.unitSalesPrice).subtract(item.discount).value()
			: numeral(item.pkgSalesPrice).subtract(item.discount).value();
		transactionItems.push(item);
		setTransactionItems(transactionItems);
		updateTransactionAmount();
		
		//	reset fields for next input
		productSelectionReset();
        setUnitPrice(0);
        setPkgPrice(0);
	};

    //  Handle item selection change
    const handleProductChange = (selectedItem) => {
        // Set prices to display
        setUnitPrice(selectedItem.value.salesPrice.unitSalesPrice);
        setPkgPrice(selectedItem.value.salesPrice.packSalesPrice);
    };

	const increment = (data) => {
		setUpdating(true);
		data.qty++;
		updateTransactionAmount();
		setUpdating(false);
	};
  
	const decrement = (data) => {
		setUpdating(true);
		if (data.qty > 1) {
			data.qty--;
			updateTransactionAmount();
		}
		setUpdating(false);
	};

	const handleRemoveConfirmation = (data) => {
		if (data) {
			setEntityToEdit(data);
			setDisplayMsg(`Remove item ${data.name} from the list?`);
			setConfirmDialogEvtName('removeItem');
			setShowConfirmModal(true);
		}
	};

	const handleCancelTransaction = () => {
		if (transactionItems.length > 0) {
			setDisplayMsg(`Discard Transaction?`);
			setConfirmDialogEvtName('cancelTransaction');
			setShowConfirmModal(true);
		}
	};

	const handleGenerateInvoice = (data) => {
		if (transactionItems.length > 0) {
			setDisplayMsg(`Generate Invoice?`);
			setConfirmDialogEvtName('generateInvoice');
			setShowConfirmModal(true);
		}
	};

    const handleCloseModal = () => {
		setEntityToEdit(null);
        setShowConfirmModal(false);
        setShowDropDownModal(false);
		setShowInputModal(false);
    };

	const idSearch = async (id) => {
		try {
			/*	text returned from input dialog is always a string but we can use a couple of techniques to convert it to a valid number
				Technique 1: use the unary plus operator which is what i've adopted below
				Technique 2: multiply by a number. 
				etc	*/
			if(!+id){
				toast.error('Please enter a valid number');
				return;
			}
			setNetworkRequest(true);
			resetPage();
	
			const response = await transactionsController.findInvoiceForReceipt(id);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data && response.data.length > 0) {
				/*	truncating transactionItems to remove previous items as react state update is unpredictable	*/
				transactionItems.length = 0;
				invoiceProps.invoiceId = response.data[0].invoice_id;
				invoiceProps.calculatedInvoiceDisc = response.data[0].disc_value ? response.data[0].disc_value : 0;
				invoiceProps.invoiceDisc = response.data[0].disc_value ? response.data[0].disc_value : 0;
				setInvoiceProps(invoiceProps);

				const arr = response.data.map(salesRec => {
					const item = new TransactionItem();
					item.name = salesRec.item_name;
					item.qty = salesRec.qty;
					item.itemSoldOutPrice = salesRec.price;
					item.id = salesRec.item_id;
					item.qtyType = salesRec.qty_type;
					item.discount = salesRec.item_discount ? salesRec.item_discount : 0;
					item.unitSalesPrice = salesRec.unit_sales;
					item.pkgSalesPrice = salesRec.pack_sales;
					/*	temporarily pushing to transactionItems to cause an immediate reset of transactionAmount as react state update is unpredictable	*/
					transactionItems.push(item);

					return item;
				});
				setTransactionItems(arr);
				updateTransactionAmount();
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return idSearch(id);
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
			setNetworkRequest(false);
		}
	}

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'invoiceSearch':
				setShowInputModal(true);
                break;
            case 'sectionSelect':
				setConfirmDialogEvtName(onclickParams.evtName);
                setShowDropDownModal(true);
                break;
        }
	}

    const fetchTractItems = async (tract) => {
        try {
			setNetworkRequest(true);
            const itemsRequest = await transactionsController.fetchTractItems(tract.id);
    
            //	check if the request to fetch items doesn't fail before setting values to display
            if(itemsRequest){
                setItemOptions(itemsRequest.data.map(item => ({label: item.itemName, value: item})));
                setItemsLoading(false);
            }
    
            setItemOptions(itemsRequest.data.map(item => ({label: item.itemName, value: item})));
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return fetchTractItems(tract);
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
			setNetworkRequest(false);
		}
    };
	
	const handleConfirmOK = async () => {
		switch (confirmDialogEvtName) {
			case 'removeItem':
				//	find index position of deleted item in items arr
				const indexPos = transactionItems.findIndex(i => i.id == entityToEdit.id);
				if(indexPos > -1){
					//	cut out deleted item found at index position
					transactionItems.splice(indexPos, 1);
					updateTransactionAmount();
					setTransactionItems([...transactionItems]);
					setShowConfirmModal(false);
				}
				break;
			case 'cancelTransaction':
				if (invoiceProps.invoiceId > 0) {
					await cancelTransaction();
				}else {
					resetPage();
					setShowConfirmModal(false);
				}
				break;
			case 'generateInvoice':
				const dtoInvoice = setUpInvoiceDTO();
				setShowConfirmModal(false);
				await generateInvoice(dtoInvoice);
				break;
		}
	};

    const generateInvoice = async (dtoInvoice) => {
		try {
			setNetworkRequest(true);
			const response = await transactionsController.generateInvoice(dtoInvoice);
			resetPage();
            // display message
            toast.info(`Invoice id: ${response.data.id}`, { autoClose: false });
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return generateInvoice(dtoInvoice);
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
    };

    const cancelTransaction = async () => {
		try {
			setNetworkRequest(true);
			setShowConfirmModal(false);
			const response = await transactionsController.cancelInvoice(invoiceProps.invoiceId);
			resetPage();
            // display message
            toast.info(`Transaction cancelled successfully`);
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return cancelTransaction();
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
    };

	//	helper function to calculate sub total of items selected (from total amount of items added)
	const calcSubTotalAmount = (itemsList = []) => {
		return itemsList.reduce( (accumulator, currentVal) => numeral(currentVal.totalAmount).add(accumulator).value(), 0);
	}

	//	helper function to calculate invoice discount using sub total of all items and invoice discount value + discount type
	const calcInvoiceDisc = (invoice_disc, invoice_disc_type) => {
		return invoice_disc_type === 'perc' 
			? numeral(calcSubTotalAmount(transactionItems)).multiply(numeral(invoice_disc).divide(100).value()).value()
			: numeral(invoice_disc).value();
	}

	//	helper function to calculate and update total transaction amount using invoice discount and sub total
	const updateTransactionAmount = () => {
		const invoice_disc = calcInvoiceDisc(invoiceProps.invoiceDisc, invoiceProps.invoiceDiscType);
		invoiceProps.calculatedInvoiceDisc = invoice_disc;
		setInvoiceProps(invoiceProps);
		const total = numeral(calcSubTotalAmount(transactionItems)).subtract(invoice_disc).value();
		setTotalTransactionAmount(total);
	}

	const setUpInvoiceDTO = () => {
		return {
			id: invoiceProps.invoiceId,
			outpostID: 1,	//	for now default to the default outpost
			invoiceDiscount: invoiceProps.calculatedInvoiceDisc,
			dtoSalesRecords: transactionItems,
		};
	}

    return (
		<div className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={tractTransactionOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Section Transactions</span>
						<img src={SVG.counter_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Perform section transactions with items in a specified section.
                    To begin with, please select a section.
                </span>
			</div>
			<div className="container my-3 p-3 rounded bg-light shadow">
				<div className="row mt-4 mb-3">
					<div className="col-4 text-end">
						<p className="h5">Product:</p>
					</div>
					<div className="col-8 d-flex flex-column gap-3">
						<Controller
							name="product"
							control={productSelectionControl}
							render={({ field: { onChange, value } }) => (
								<Select
									required
									name="product"
									placeholder="Select..."
									className="text-dark col-12 col-md-6"
                                	isLoading={itemsLoading}
									options={itemOptions}
									value={value}
									onChange={(val) => {
										onChange(val);
										handleProductChange(val);
									}}
								/>
							)}
						/>
						<ErrorMessage source={productSelectionErrors.product} />

						<div className="d-flex gap-3">
							<p>
								Unit (₦): <span className="text-danger fw-bold">{unitPrice}</span>
							</p>
							<p>
								Package (₦): <span className="text-danger fw-bold">{pkgPrice}</span>
							</p>
						</div>
					</div>
				</div>
				<div className="row mb-3">
					<div className="col-4 text-end">
						<p className="h5">Quantity:</p>
					</div>
					<div className="col-8">
						<div className="row">
							<div className="col-12 col-md-6 mb-2">
								<input
									type="number"
									className="form-control"
									id="quantity_value"
									placeholder="0"
									{...productSelectionRegister("qty")}
								/>
								<ErrorMessage source={productSelectionErrors.qty} />
							</div>
							<div className="col-12">
								<div className="d-flex gap-3">
									<Form.Check
										type="radio"
										label="Unit"
										value="Unit"
										name="qty_type"
										{...productSelectionRegister("qty_type")}
									/>
									<Form.Check
										type="radio"
										label="Pkg"
										value="Pkg"
										{...productSelectionRegister("qty_type")}
										name="qty_type"
									/>
								</div>
								<ErrorMessage source={productSelectionErrors.qty_type} />
							</div>
						</div>
					</div>
				</div>

				<div className="row mb-3">
					<div className="col-4 text-end">
						<p className="h5">Discount:</p>
					</div>
					<div className="col-8">
						<div className="row">
							<div className="col-12 col-md-6 mb-2">
								<input
									type="number"
									className="form-control"
									id="quantity_value"
									placeholder="0"
									{...productSelectionRegister("item_disc")}
								/>
								<ErrorMessage source={productSelectionErrors.item_disc} />
							</div>
							<div className="col-12">
								<div className="d-flex gap-3">
									<Form.Check
										type="radio"
										label="N"
										value="n"
										name="item_disc_type"
										{...productSelectionRegister("item_disc_type")}
									/>
									<Form.Check
										type="radio"
										label="%"
										value="perc"
										{...productSelectionRegister("item_disc_type")}
										name="item_disc_type"
									/>
								</div>
								<ErrorMessage source={productSelectionErrors.item_disc_type} />
							</div>
						</div>
					</div>
				</div>

				<div className="d-flex">
					<button
						className="btn btn-outline-dark mx-auto"
						onClick={handleProductSelectionSubmit(onSubmit)}
					>
						<span className="d-flex gap-2 align-items-center px-4">
							<IoAddSharp size={"25"} />
							<span className="fs-5">Add</span>
						</span>
					</button>
				</div>
			</div>

			<div className="container mt-4 p-3 shadow-sm border border-2 rounded-1">
				<div className="border bg-light my-3">

					{/* only display in md. Never display in mobile view */}
					<div className="d-none d-md-block mt-4">
						<div className="row mb-2">
						<div className="col-md-6 col-12 fw-bold ps-4">Product</div>
						<div className="col-md-2 col-4 fw-bold">Qty</div>
						<div className="col-md-2 col-4 fw-bold">Unit Price (₦)</div>
						<div className="col-md-2 col-4 fw-bold">Total Price (₦)</div>
						</div>
					</div>
					<hr />

					{transactionItems.length > 0 && (
						transactionItems.map((item) => {
							const { id, name, qtyType, itemSoldOutPrice, discount, qty, totalAmount } = item;
							return (
								<div key={id}>
									<div className="row mt-4">
										<div className="col-md-6 col-12">
										<div className="d-flex">
											<div className="ms-3">
												<p className="fw-bold mb-2">{name}</p>
												<p>discount: <span className="text-primary fw-bold">{discount}</span></p>
												<p>Type: <span className="text-primary fw-bold">{qtyType}</span></p>
												<button
													className={`btn btn-sm btn-outline-danger px-3 rounded-pill mt-2`}
													onClick={() => handleRemoveConfirmation(item)}
												>
													remove
												</button>
											</div>
										</div>
										</div>

										{/* ONLY DISPLAY ON MOBILE VIEW. FROM md upward never show */}
										<div className="row d-md-none mb-2 mt-2">
										<div className="col-md-2 col-4 ps-4">Qty</div>
										<div className="col-md-2 col-4">Unit Price (₦)</div>
										<div className="col-md-2 col-4">Total Price (₦)</div>
										</div>

										<div className="col-md-2 col-4">
										<span
											onClick={() => increment(item)}
											className={`btn btn-outline-dark py-1 px-2 rounded-circle ${
											updating ? "disabled" : ""
											}`}
										>
											<MdAdd />
										</span>
										<span className="ms-2 me-2">{qty}</span>
										<button
											onClick={() => decrement(item)}
											className={`btn btn-outline-danger py-1 px-2 rounded-circle ${
											updating ? "disabled" : ""
											}`}
										>
											<MdRemove />
										</button>
										</div>
										<div className="col-md-2 col-4">{numeral(itemSoldOutPrice).format('0,0.00')}</div>
										<div className="col-md-2 col-4 fw-bold">
											{totalAmount}
										</div>
									</div>
									<hr />
								</div>
							);
						})
					)}
				</div>
			</div>
			{/*  */}
			<Form className="container my-5 py-3 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-5">
				<h2 className="mb-2">
					Total (N): <span className="text-danger">{numeral(totalTransactionAmount).format('₦0,0.00')}</span>
				</h2>
				<div className="border rounded shadow p-3 my-2">
					<h5>Add Invoice Discount</h5>
					<div className="row">
						<div className="col-12 col-md-4 d-flex flex-column">
							<input
								type="number"
								className="form-control"
								id="invoice_disc"
								placeholder="0"
								{...invoiceDiscRegister("invoice_disc")}
							/>
							<ErrorMessage source={invoiceDiscErrors.invoice_disc} />
						</div>
						<div className="col-12 col-md-4 text-center my-2 me-1">
							<div className="d-flex gap-4 align-items-center">
								<Form.Check
									type="radio"
									label="₦"
									value="n"
									name="invoice_disc_type"
									{...invoiceDiscRegister("invoice_disc_type")}
								/>
								<Form.Check
									type="radio"
									label="%"
									value="perc"
									name="invoice_disc_type"
									{...invoiceDiscRegister("invoice_disc_type")}
								/>
								<div className="btn btn-lg btn-success fw-bold p-2 px-2 d-flex align-items-center justify-content-center" 
									onClick={handleInvoiceDiscSubmit(addInvoiceDisc)}>
									<BiPlus />
								</div>
								<div className="btn btn-lg btn-danger fw-bold p-2 px-2 d-flex align-items-center justify-content-center"
									onClick={() => removeInvoiceDisc()}>
									<BiMinus />
								</div>
							</div>
						</div>
						<div className="col-12 col-md-4 my-2">
							<p className="h4">
								(N):
								<span className="text-success ms-2">{numeral(invoiceProps.calculatedInvoiceDisc).format('₦0,0.00')}</span>
							</p>
						</div>
					</div>
				</div>
			</Form>
			{/*  */}
			<div className="container bg-light border rounded-4 shadow-sm  p-4">
				<div className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-center my-2 p-2">
					<div className="d-flex flex-column flex-sm-row gap-3">
						<button
							className={`btn btn-lg btn-danger rounded-3 ${networkRequest ? 'disabled' : ''}`}
							style={{ width: "270px" }}
							onClick={() => handleCancelTransaction()}
						>
							Cancel
						</button>
						<button
							className={`btn btn-lg btn-success rounded-3 ${networkRequest ? 'disabled' : ''}`}
							style={{ width: "270px" }}
							onClick={() => handleGenerateInvoice()}
						>
							{ (networkRequest) && <ThreeDotLoading color="white" size="small" /> }
							{ (!networkRequest) && `OK` }
						</button>
					</div>
				</div>
			</div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={fetchTractItems}
                message={dropDownMsg}
                optionsLoading={tractsLoading}
                options={tractOptions}
            />
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={idSearch}
                message={displayMsg}
            />
		</div>
    )
}

export default SectionTransaction;