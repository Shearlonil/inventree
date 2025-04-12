import React, { useEffect, useState } from "react";
import {  Form } from "react-bootstrap";
import { BiSearch } from "react-icons/bi";
import {  HiUser } from "react-icons/hi2";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import numeral from "numeral";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import SVG from "../../assets/Svg";
import { customer_selection_schema, cashier_invoice_search_schema } from "../../Utils/yup-schema-validator/transactions-schema";
import ErrorMessage from "../../Components/ErrorMessage";
import { ThreeDotLoading } from "../../Components/react-loading-indicators/Indicator";
import genericController from "../../Controllers/generic-controller";
import handleErrMsg from "../../Utils/error-handler";
import { useAuth } from "../../app-context/auth-user-context";
import { TransactionItem } from "../../Entities/TransactionItem";
import transactionsController from "../../Controllers/transactions-controller";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";

const CashierWindow = () => {
	const navigate = useNavigate();
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();

	const {
		register: customerSelectionRegister,
		handleSubmit: handleCompleteTransactionSubmit,
		control: customerSelectionControl,
		reset: customerSelectionReset,
		setValue,
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

	const {
		register: invoiceSearchRegister,
		handleSubmit: handleIdSearch,
		reset: invoiceSearchReset,
		formState: { errors: invoiceSearchErrors },
	} = useForm({
		resolver: yupResolver(cashier_invoice_search_schema),
		defaultValues: {
			invoice_id: 0,
		},
	});
	
	const [networkRequest, setNetworkRequest] = useState(false);
		
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState("");
	const [transactionItems, setTransactionItems] = useState([]);
	
	//  for customers
	const [customerOptions, setCustomerOptions] = useState([]);
	const [customersLoading, setCustomersLoading] = useState(true);
	const [customerName, setCustomerName] = useState('');
	const [customerDiscount, setCustomerDiscount] = useState(0);
	const [customerPhone, setCustomerPhone] = useState('');
	const [customerCardNo, setCustomerCardNo] = useState('');
	const [customerPaymentInfo, setCustomerPaymentInfo] = useState(null);	//	for holding customer info and payment methods
		
	const [invoiceProps, setInvoiceProps] = useState({
		invoiceId: 0,
		invoiceDisc: 0,
	});
	
	const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

	useEffect( () => {
		initialize();
	}, []);

	const initialize = async () => {
		try {
            //  find active customers and items with sales prices
            const urls = [ '/api/customers/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: customersRequest } = response;

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
	
	const idSearch = async (data) => {
		try {
			/*	text returned from input dialog is always a string but we can use a couple of techniques to convert it to a valid number
				Technique 1: use the unary plus operator which is what i've adopted below
				Technique 2: multiply by a number. 
				etc	*/
			const id = data.invoice_id;
			if(!+id){
				toast.error('Please enter a valid number');
				return;
			}
			setNetworkRequest(true);
	
			const response = await transactionsController.findInvoiceForReceipt(id);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data && response.data.length > 0) {
				/*	truncating transactionItems to remove previous items as react state update is unpredictable	*/
				transactionItems.length = 0;
				invoiceProps.invoiceId = response.data[0].invoice_id;
				invoiceProps.invoiceDisc = response.data[0].disc_value ? response.data[0].disc_value : 0;
				setInvoiceProps(invoiceProps);

				const arr = response.data.map(salesRec => {
					const item = new TransactionItem();
					item.name = salesRec.item_name;
					item.qty = salesRec.qty;
					item.itemSoldOutPrice = salesRec.price;
					item.id = salesRec.item_id;
					item.qtyType = salesRec.qty_type;
					item.discount = numeral(salesRec.qty_type === 'Pkg' ? salesRec.pack_sales : salesRec.unit_sales).subtract(salesRec.price).value();
					item.unitSalesPrice = salesRec.unit_sales;
					item.pkgSalesPrice = salesRec.pack_sales;
					/*	temporarily pushing to transactionItems to cause an immediate reset of transactionAmount as react state update is unpredictable	*/
					transactionItems.push(item);

					return item;
				});
				const itemAmount = arr.reduce( (accumulator, currentVal) => numeral(currentVal.totalAmount).add(accumulator).value(), 0);
				const tempTotalTransactionAmount = numeral(itemAmount).subtract(invoiceProps.invoiceDisc).value();
				setTotalTransactionAmount(tempTotalTransactionAmount);
				setValue('cash', tempTotalTransactionAmount);
				setTransactionItems(arr);
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return idSearch(data);
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

    const handleCloseModal = () => {
        setShowConfirmModal(false);
    };

    //  Handle customer selection change
    const handleCustomerChange = (selectedCustomer) => {
		setCustomerName(selectedCustomer.label);
		setCustomerDiscount(selectedCustomer.value.ledger.discount === null ? "0" : selectedCustomer.value.ledger.discount);
		setCustomerPhone(selectedCustomer.value.phoneNo);
		setCustomerCardNo(selectedCustomer.value.loyaltyCardNo === null ? '0': selectedCustomer.value.loyaltyCardNo);
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
	
	const handleConfirmOK = async () => {
		switch (confirmDialogEvtName) {
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
			const response = await transactionsController.generateReceipt(dtoReceipt);
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

	const resetPage = () => {
		setTransactionItems([]);
		setInvoiceProps({
			invoiceId: 0,
			invoiceDisc: 0,
		});

		customerSelectionReset();

		invoiceSearchReset();

		setTotalTransactionAmount(0);
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
			id: invoiceProps.invoiceId,
			outpostID: 1,	//	for now default to the default outpost
			invoiceDiscount: invoiceProps.invoiceDisc,
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
			<div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 mt-3 text-white align-items-center" >
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Cashier</span>
						<img src={SVG.counter_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Search invoices and generate receipts.
                </span>
			</div>
			<div className="container bg-light rounded-4 border shadow-sm my-3 py-4" >
				<div className="row px-3 mb-3">
					<div className="col-12 col-md-3 my-2">
						<label htmlFor="exampleFormControlInput1" className="form-label h3">
							Invoice Number:
						</label>
					</div>
					<div className="col-12 col-md-6 my-2">
						<input
							type="number"
							className="form-control form-control-lg shadow-sm"
							id="invoice_id"
							placeholder="Invoice Number"
							{...invoiceSearchRegister('invoice_id')}
						/>
						<ErrorMessage source={invoiceSearchErrors.invoice_id} />
					</div>
					<div className="col-12 col-md-3 my-2">
						<button className="btn btn-lg btn-outline-dark rounded-3 d-flex align-items-center justify-content-center gap-1 w-100 text-center"
							onClick={handleIdSearch(idSearch)}>
							<BiSearch />
							<span>Search</span>
						</button>
					</div>
				</div>

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
										<span className="ms-2 me-2">{qty}</span>
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

				<div className="text-center my-2">
					<h2>
						Total (₦): <span className="text-danger">{numeral(totalTransactionAmount).format('₦0,0.00')}</span>
					</h2>
					<h5 className="mt-4">
						Discount (₦): <span className="text-success">{numeral(invoiceProps.invoiceDisc).format('₦0,0.00')}</span>
					</h5>
				</div>
			</div>
			{/*  */}
			<div className="container bg-light border rounded-4 shadow-sm mt-4 p-3" >
				<h3 className="display-5 fw-bold">Customer Details</h3>

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
									value="yes"
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

export default CashierWindow;
