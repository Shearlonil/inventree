import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { BiMinus, BiPlus } from "react-icons/bi";
import { MdAdd, MdRemove } from "react-icons/md";
import {  HiUser } from "react-icons/hi2";
import { IoAddSharp } from "react-icons/io5";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import numeral from "numeral";

import { product_selection_schema, invoice_disc_schema, customer_selection_schema } from "../../Utils/yup-schema-validator/transactions-schema";
import ErrorMessage from "../../Components/ErrorMessage";
import SVG from "../../assets/Svg";
import genericController from "../../Controllers/generic-controller";
import { useAuth } from "../../app-context/auth-user-context";
import handleErrMsg from "../../Utils/error-handler";
import { TransactionItem } from "../../Entities/TransactionItem";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import { ThreeDotLoading } from "../../Components/react-loading-indicators/Indicator";
import transactionsController from "../../Controllers/transactions-controller";
import printerController from "../../Controllers/printer-controller";
import { useNumericCodeScanner } from "../../Utils/useNumericCodeScanner";

const MonoTransaction = () => {
	const onCodeScan = (code) => {
		//	find item from option list in drop down
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

	const {
		register: customerSelectionRegister,
		handleSubmit: handleCompleteTransactionSubmit,
		control: customerSelectionControl,
		setValue: customerSelectionSetValue,
		reset: customerSelectionReset,
		formState: { errors: customerSelectionErrors },
	} = useForm({
		resolver: yupResolver(customer_selection_schema),
		defaultValues: {
			customer: null,
			cash: 0,
			transfer: 0,
			atm: 0,
			print_receipt: true,
		},
	});
	
	const [networkRequest, setNetworkRequest] = useState(false);
		
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState("");
	const [entityToEdit, setEntityToEdit] = useState(null);
	//  for items
	const [transactionItems, setTransactionItems] = useState([]);
	const [itemOptions, setItemOptions] = useState([]);
	const [itemsLoading, setItemsLoading] = useState(true);

	//  for customers
	const [customerOptions, setCustomerOptions] = useState([]);
	const [customersLoading, setCustomersLoading] = useState(true);
	const [customerName, setCustomerName] = useState('');
	const [customerDiscount, setCustomerDiscount] = useState(0);
	const [customerPhone, setCustomerPhone] = useState('');
	const [customerCardNo, setCustomerCardNo] = useState('');
	const [customerPaymentInfo, setCustomerPaymentInfo] = useState(null);	//	for holding customer info and payment methods

	//	for controlling the increment and decrement buttons while updating cart
	const [updating, setUpdating] = useState(false);
	const [unitPrice, setUnitPrice] = useState(0);
	const [pkgPrice, setPkgPrice] = useState(0);
	
	const [invoiceDisc, setInvoiceDisc] = useState(0);	//	invoice discount value entered into text field
	const [calculatedInvoiceDisc, setCalculatedInvoiceDisc] = useState(0);
	const [invoiceDiscType, setInvoiceDiscType] = useState("n");
	const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

	useEffect( () => {
		initialize();
	}, []);

	const initialize = async () => {
		try {
            //  find active customers and items with sales prices
            const urls = [ '/api/items/transactions/mono', '/api/customers/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: itemsRequest, 1: customersRequest } = response;

            //	check if the request to fetch items doesn't fail before setting values to display
            if(itemsRequest){
				setItemOptions(itemsRequest.data.map(item => ({label: item.itemName, value: item})));
                setItemsLoading(false);
            }

            //	check if the request to fetch customers doesn't fail before setting values to display
            if(customersRequest){
				setCustomerOptions(customersRequest.data.map( customer => ({label: customer.name, value: customer})));
				setCustomersLoading(false);
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
		setInvoiceDiscType(data.invoice_disc_type);
		setInvoiceDisc(data.invoice_disc);
		updateTransactionAmount();
	}

	const resetPage = () => {
		setTransactionItems([]);
		removeInvoiceDisc();

        productSelectionReset();

		customerSelectionReset();

		setCustomerName('');
		setCustomerDiscount("0");
		setCustomerPhone('');
		setCustomerCardNo('');
        setUnitPrice(0);
        setPkgPrice(0);
		setTotalTransactionAmount(0);

		setCustomerPaymentInfo(null);
	}

	const removeInvoiceDisc = () => {
		setInvoiceDiscType('n');
		setInvoiceDisc(0);
		invoiceDiscReset();
		setCalculatedInvoiceDisc(0);
		setTotalTransactionAmount(numeral(calcSubTotalAmount(transactionItems)).subtract(0).value());
	}

	const onSubmit = (data) => {
		//	detect if item already exists in the list
		const found = transactionItems.find(i => i.id === data.product.value.id);
		if(found){
			increment(found, data.qty);
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

    //  Handle customer selection change
    const handleCustomerChange = (selectedCustomer) => {
		setCustomerName(selectedCustomer.label);
		setCustomerDiscount(selectedCustomer.value.ledger.discount === null ? "0" : selectedCustomer.value.ledger.discount);
		setCustomerPhone(selectedCustomer.value.phoneNo);
		setCustomerCardNo(selectedCustomer.value.loyaltyCardNo === null ? '0': selectedCustomer.value.loyaltyCardNo);
    };

	const increment = (data, qty) => {
		setUpdating(true);
		data.qty += qty;
		updateTransactionAmount();
		setUpdating(false);
	};
  
	const decrement = (data, qty) => {
		setUpdating(true);
		if (data.qty > 1) {
			data.qty -= qty;
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

	const handleSaveTransaction = (data) => {
		if (transactionItems.length > 0) {
			setCustomerPaymentInfo(data);
			setDisplayMsg(`Save Transaction?`);
			setConfirmDialogEvtName('saveTransaction');
			setShowConfirmModal(true);
		}
	};

    const handleCloseModal = () => {
		setEntityToEdit(null);
        setShowConfirmModal(false);
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
				resetPage();
				setShowConfirmModal(false);
				break;
			case 'saveTransaction':
				const dtoReceipt = setUpReceiptDTO();
				setShowConfirmModal(false);
				await commitTransaction(dtoReceipt);
				break;
		}
	};

    const commitTransaction = async (dtoReceipt) => {
		try {
			setNetworkRequest(true);
			const response = await transactionsController.monoTransaction(dtoReceipt);
			
            // const startDate = new Date();
            // startDate.setHours(0, 0, 0);
            // const endDate = new Date();
            // endDate.setHours(0, 0, 0);
			// dtoReceipt.transactionDate =  startDate.toISOString();
			// dtoReceipt.customerName = 'Customer';

			resetPage();
			if(dtoReceipt.printReceipt){
				await printerController.print(response.data);
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return commitTransaction(dtoReceipt);
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
		const invoice_disc = calcInvoiceDisc(invoiceDisc, invoiceDiscType);
		setCalculatedInvoiceDisc(invoice_disc);
		const total = numeral(calcSubTotalAmount(transactionItems)).subtract(invoice_disc).value();
		setTotalTransactionAmount(total);
		customerSelectionSetValue('cash', total);
	}

	const setUpReceiptDTO = () => {
		const paymentModes = [];
		if(customerPaymentInfo.atm){
			paymentModes.push({
				type: 'POS/DEBIT-CARD',
				amount: customerPaymentInfo.atm
			})
		}
		if(customerPaymentInfo.transfer){
			paymentModes.push({
				type: 'TRANSFER',
				amount: customerPaymentInfo.transfer
			})
		}
		if(customerPaymentInfo.cash){
			paymentModes.push({
				type: 'CASH',
				amount: customerPaymentInfo.cash
			})
		}

		//	if none of the above, then wallet/ledger/credit-sales payment mode
		if(paymentModes.length === 0){
			paymentModes.push({
				type: 'WALLET',
				amount: totalTransactionAmount
			})
		}
		const dtoInvoice = {
			id: 0,
			outpostID: 1,	//	for now default to the default outpost
			invoiceDiscount: calculatedInvoiceDisc,
			dtoSalesRecords: transactionItems,
		};

		return {
			id: 0,
			customerId: customerPaymentInfo.customer.value.id,
			ledgerDiscount: customerPaymentInfo.customer.value.ledger.discount,
			dtoInvoice,
			paymentModes,
			printReceipt: customerPaymentInfo.print_receipt,
		}
	}

	return (
		<div className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Transactions</span>
						<img src={SVG.counter_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Perform unified transactions with items in all sections,
                    generating both invoice and receipt on the fly.
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
											onClick={() => increment(item, 1)}
											className={`btn btn-outline-dark py-1 px-2 rounded-circle ${
											updating ? "disabled" : ""
											}`}
										>
											<MdAdd />
										</span>
										<span className="ms-2 me-2">{qty}</span>
										<button
											onClick={() => decrement(item, 1)}
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
								<span className="text-success ms-2">{numeral(calculatedInvoiceDisc).format('₦0,0.00')}</span>
							</p>
						</div>
					</div>
				</div>
			</Form>
			{/*  */}
			<div className="container bg-light border rounded-4 shadow-sm  p-4">
				<h3 className="display-5 fw-bold mb-2">Customer Details</h3>
				<div className="row mx-auto">
					{/* Customer Profile Section */}
					<div className="col-12 col-md-6 bg-success text-white p-4 d-flex flex-column align-items-center mb-3">
						<div className="text-center mb-4">
							<HiUser size={80} className="mb-3" />
							<p>Customer Name: </p>
							<h4>{customerName}</h4>
						</div>

						{/* Wallet Info */}
						<div className="mb-3 text-center">
							<p>
								Discount: <span className="text-warning h3">{customerDiscount}%</span>
							</p>
							<p className="">
								Phone No:{" "}
								<span className="text-warning h5">{customerPhone}</span>
							</p>
							<p className="">
								Card No:{" "}
								<span className="text-warning h5">{customerCardNo}</span>
							</p>

							{/* <label
								className="d-flex gap-2 text-light"
								htmlFor="deduct_wallet_discount_from_payment"
							>
								<Form.Check
									type="checkbox"
									value="yes"
									className="shadow-sm p-0 m-0"
									id="deduct_wallet_discount_from_payment"
									name="deduct_wallet_discount_from_payment"
								/>
								deduct wallet discount from payment
							</label> */}
						</div>
					</div>

					{/* Payment Section */}
					<div className="col-12 col-md-5 mb-4">
						<div className="mb-4">
							<Controller
								name="customer"
								control={customerSelectionControl}
								render={({ field: { onChange, value } }) => (
									<Select
										required
										name="customer"
										placeholder="Select Customer..."
										className="shadow-sm"
										isLoading={customersLoading}
										options={customerOptions}
										value={value}
										onChange={(val) => {
											onChange(val);
											handleCustomerChange(val);
										}}
									/>
								)}
							/>
							<ErrorMessage source={customerSelectionErrors.customer} />
						</div>
						<h3 className="mb-3">Payment Mode</h3>
						<div className="row payment-mode-cards mx-auto">
							<div className="col-6 p-2">
								<div className="border p-3 rounded shadow-sm">
									<label className="fw-bold">
										Cash
									</label>
									<Form.Control type="number" placeholder="Enter Amount" id="cash" {...customerSelectionRegister("cash")} />
									<ErrorMessage source={customerSelectionErrors.cash} />
								</div>
							</div>
							<div className="col-6 p-2">
								<div className="border p-3 rounded shadow-sm">
									<label className="fw-bold">
										Transfer
									</label>
									<Form.Control type="number" placeholder="Enter Amount" id="transfer" {...customerSelectionRegister("transfer")} />
									<ErrorMessage source={customerSelectionErrors.transfer} />
								</div>
							</div>
							<div className="col-6 p-2">
								<div className="border p-3 rounded shadow-sm">
									<label className="fw-bold">
										POS/ATM
									</label>
									<Form.Control type="number" placeholder="Enter Amount" id="atm" {...customerSelectionRegister("atm")}/>
									<ErrorMessage source={customerSelectionErrors.atm} />
								</div>
							</div>
						</div>
						<div className="mt-2">
							<label className="d-flex gap-2" htmlFor="print_receipt">
								<Form.Check
									type="checkbox"
									value="print"
									className="shadow-sm p-0 m-0"
									id="print_receipt"
									name="print_receipt"
									{...customerSelectionRegister("print_receipt")}
								/>
								Print Receipt
							</label>
						</div>
					</div>
				</div>
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
							onClick={handleCompleteTransactionSubmit(handleSaveTransaction)}
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
		</div>
	);
};

export default MonoTransaction;
