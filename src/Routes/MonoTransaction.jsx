import React, { useEffect, useState } from "react";
import { Form, Table } from "react-bootstrap";
import { BiMinus, BiPlus } from "react-icons/bi";
import { MdAdd, MdRemove } from "react-icons/md";
import {  HiUser } from "react-icons/hi2";
import { IoAddSharp } from "react-icons/io5";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import numeral from "numeral";

import { product_selection_schema } from "../Utils/yup-schema-validator/transactions-schema";
import ErrorMessage from "../Components/ErrorMessage";
import SVG from "../assets/Svg";
import genericController from "../Controllers/generic-controller";
import { useAuth } from "../app-context/auth-user-context";
import handleErrMsg from "../Utils/error-handler";
import { TransactionItem } from "../Entities/TransactionItem";

const MonoTransaction = () => {
		
	const { handleRefresh, logout } = useAuth();

	const {
		register: productSelectionRegister,
		handleSubmit: handleProductSelectionSubmit,
		control,
		formState: { errors: productSelectionErrors },
	} = useForm({
		resolver: yupResolver(product_selection_schema),
		defaultValues: {
			qty: 0,
			item_disc: 0,
            qty_type: "unit", 
            item_disc_type: 'n'
		},
	});
	
	const [networkRequest, setNetworkRequest] = useState(false);
		
	const [displayMsg, setDisplayMsg] = useState("");
	const [dropDownMsg, setDropDownMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState("");
	const [showDropDownModal, setShowDropDownModal] = useState(false);
	//  for items
	const [items, setItems] = useState([]);
	const [transactionItems, setTransactionItems] = useState([]);
	const [itemOptions, setItemOptions] = useState([]);
	const [itemsLoading, setItemsLoading] = useState(true);

	//  for customers
	const [customerOptions, setCustomerOptions] = useState([]);
	const [customersLoading, setCustomersLoading] = useState(true);

	//	for controlling the increment and decrement buttons while updating cart
	const [updating, setUpdating] = useState(false);
	const [unitPrice, setUnitPrice] = useState(0);
	const [pkgPrice, setPkgPrice] = useState(0);
	const [invoiceDisc, setInvoiceDisc] = useState(0);
	const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
				
	useEffect( () => {
		initialize();
	}, []);

	const initialize = async () => {
		try {
            //  find active customers and items with sales prices
            const urls = [ '/api/items/dispensary/active', '/api/customers/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: itemsRequest, 1: customersRequest } = response;

            //	check if the request to fetch items doesn't fail before setting values to display
            if(itemsRequest){
				setItems(itemsRequest.data)
				setItemOptions(itemsRequest.data.map(item => ({label: item.itemName, value: item})));
                setItemsLoading(false);
            }

            //	check if the request to fetch customers doesn't fail before setting values to display
            if(customersRequest){
				setCustomerOptions(customersRequest.data.map( customer => ({label: customer.customerName, value: customer.id})));
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

	const onSubmit = (data) => {
		const item = new TransactionItem(data);
		setTransactionItems([...transactionItems, item]);
		console.log(data);
	};

    //  Handle item selection change
    const handleProductChange = (selectedItem) => {
        // Set prices to display
        setUnitPrice(selectedItem.value.unitSalesPrice);
        setPkgPrice(selectedItem.value.pkgSalesPrice);
    };

	const increment = async (data) => {
		data.qty++;
		//  find item if already exist in cart then update qty else add new to cart
		const found = transactionItems.find((i) => i.id == data.id);
		found.qty = data.qty;
		const items = [...transactionItems];
		// setTotal(
		// 	transactionItems.reduce(
		// 		(accumulator, currentVal) =>
		// 		numeral(currentVal.qty)
		// 			.multiply(currentVal.salesPrice)
		// 			.add(accumulator)
		// 			.value(),
		// 		0
		// 	)
		// );
		setTransactionItems(items);
	};
  
	const decrement = async (data) => {
		if (data.qty > 1) {
			data.qty--;
			setTotal(
				items.reduce(
					(accumulator, currentVal) =>
						numeral(currentVal.qty)
						.multiply(currentVal.salesPrice)
						.add(accumulator)
						.value(),
					0
				)
			);
		}
	};

	const handleRemoveConfirmation = (data) => {
	  if (data) {
		setDisplayMsg(`Remove item ${data.title} from your cart?`);
		setShowConfirmModal(true);
	  }
	};

	return (
		<>
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
							control={control}
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
								Unit (N): <span className="text-danger fw-bold">{unitPrice}</span>
							</p>
							<p>
								Package (N): <span className="text-danger fw-bold">{pkgPrice}</span>
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
										value="unit"
										name="qty_type"
										{...productSelectionRegister("qty_type")}
									/>
									<Form.Check
										type="radio"
										label="Pkg"
										value="pkg"
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
						<div className="col-md-2 col-4 fw-bold">Unit Price</div>
						<div className="col-md-2 col-4 fw-bold">Total Price</div>
						</div>
					</div>
					<hr />

					{transactionItems.length > 0 && (
						transactionItems.map((item) => {
							const { id, name, qtyType, itemSoldOutPrice, itemDiscount, qty } = item;
							return (
								<div key={qty * id}>
									<div className="row mt-4">
										<div className="col-md-6 col-12">
										<div className="d-flex">
											<div className="ms-3">
											<p className="fw-bold mb-2">{name}</p>
											<button
												className={`btn btn-sm btn-outline-danger px-3 rounded-pill`}
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
										<div className="col-md-2 col-4">{itemSoldOutPrice}</div>
										<div className="col-md-2 col-4 fw-bold">
											{numeral(item.qty)
												// .multiply(item.itemSoldOutPrice)
												.format("0,0.00")}
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
			<div className="container my-5 py-3 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-5">
				<h2 className="mb-2">
					Total (N): <span className="text-danger">{totalTransactionAmount}</span>
				</h2>
				<div className="border rounded shadow p-3 my-2">
					<h5>Add Invoice Discount</h5>
					<div className="row">
						<div className="col-12 col-md-4">
							<input
								type="number"
								className="form-control"
								id="discount_value"
								placeholder="0"
							/>
						</div>
						<div className="col-12 col-md-5 text-center my-2">
							<div className="d-flex gap-4 align-items-center">
								<Form.Check
									type="radio"
									label="N"
									value="unit"
									name="invoice_disc"
								/>
								<Form.Check
									type="radio"
									label="%"
									value="perc"
									name="invoice_disc"
								/>
								<div className="btn btn-lg btn-success fw-bold p-2 px-2 d-flex align-items-center justify-content-center">
									<BiPlus />
								</div>
								<div className="btn btn-lg btn-danger fw-bold p-2 px-2 d-flex align-items-center justify-content-center">
									<BiMinus />
								</div>
							</div>
						</div>
						<div className="col-12 col-md-3 my-2">
							<p className="h4">
								(N):
								<span className="text-success">{invoiceDisc}</span>
							</p>
						</div>
					</div>
				</div>
			</div>
			{/*  */}
			<div className="container bg-light border rounded-4 shadow-sm  p-4">
				<h3 className="display-5 fw-bold mb-2">Customer Details</h3>
				<div className="row mx-auto">
					{/* Customer Profile Section */}
					<div className="col-12 col-md-6 bg-success text-white p-4 d-flex flex-column align-items-center mb-3">
						<div className="text-center mb-4">
							<HiUser size={80} className="mb-3" />
							<p>Customer Name: </p>
							<h4>John Doe</h4>
						</div>

						{/* Wallet Info */}
						<div className="mb-3 text-center">
							<p className="fw-bold">
								Wallet Balance:{" "}
								<span className="text-warning h3">₦1100.00</span>
							</p>
							<p>
								Discount: <span className="text-warning h3">0%</span>
							</p>

							<label
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
							</label>
						</div>
					</div>

					{/* Payment Section */}
					<div className="col-12 col-md-5 mb-4">
						<div className="mb-4">
							<Select
								required
								// styles={customStyles}
								placeholder="Select Customer..."
								className="shadow-sm"
								options={customerOptions}
								isLoading={customersLoading}
								onChange={""}
							/>
						</div>
						<h3 className="mb-3">Payment Mode</h3>
						<div className="row payment-mode-cards mx-auto">
							<div className="col-6 p-2">
								<div className="border p-3 rounded shadow-sm">
									<label className="fw-bold">
										Cash
									</label>
									<Form.Control type="number" placeholder="Enter Amount" />
									<ErrorMessage source={productSelectionErrors.qty} />
								</div>
							</div>
							<div className="col-6 p-2">
								<div className="border p-3 rounded shadow-sm">
									<label className="fw-bold">
										Transfer
									</label>
									<Form.Control type="number" placeholder="Enter Amount" />
									<ErrorMessage source={productSelectionErrors.qty} />
								</div>
							</div>
							<div className="col-6 p-2">
								<div className="border p-3 rounded shadow-sm">
									<label className="fw-bold">
										POS/ATM
									</label>
									<Form.Control type="number" placeholder="Enter Amount" />
									<ErrorMessage source={productSelectionErrors.qty} />
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
								/>
								Print Receipt
							</label>
						</div>
					</div>
				</div>
				<div className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-center my-2 p-2">
					<div className="d-flex flex-column flex-sm-row gap-3">
						<button
							className="btn btn-lg btn-danger rounded-3"
							style={{ width: "270px" }}
						>
							Cancel
						</button>
						<button
							className="btn btn-lg btn-success rounded-3"
							style={{ width: "270px" }}
						>
							OK
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MonoTransaction;
