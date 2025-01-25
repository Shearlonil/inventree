import React from "react";
import {  Form, Table } from "react-bootstrap";
import { BiSearch } from "react-icons/bi";
import {  HiUser } from "react-icons/hi2";
import "../Components/Styles/CashierWindow.css";
import Select from "react-select";
import { FaCashRegister } from "react-icons/fa";
import ReactMenu from "../Components/ReactMenu";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../Utils/yup-schema-validator/store-schema";
import { customerName, reactMenuItems } from "../../data";

const CashierWindow = () => {
	const customStyles = {
		control: (provided, state) => ({
			...provided,
			backgroundColor: "#ffffff",
			borderColor: "#cecec8ca",
			borderRadius: "2px",
			padding: "10px 0px",
			boxShadow: state.isFocused
				? "0 0 0 0.25rem rgba(0, 123, 255, 0.25)"
				: "none",
			// "&:hover": {
			// 	borderColor: "transparent",
			// },
			"&:focus": {
				boxShadow: "0 0 0 0.25rem rgba(0, 123, 255, 0.25)",
			},
			width: "100%",
			// height: "48px", // Match Bootstrap's default form control height
			minHeight: "48px", // Ensures the minimum height is 38px
		}),
		dropdownIndicator: (provided) => ({
			...provided,
			color: "rgba(0, 123, 255, 0.75)", // customize color of the dropdown arrow
		}),
	};

	// React Hook Form setup
	const {
		handleSubmit,
		register,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			paymentModes: [
				{ mode: "Cash", amount: 0 },
				{ mode: "Transfer", amount: 0 },
				{ mode: "POS/ATM", amount: 0 },
				{ mode: "Wallet", amount: 0 },
			],
		},
	});

	const onSubmit = (data) => {
		console.log("Form Submitted:", data);
	};

	return (
		<>
			<div className="text-center mt-5">
				<h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
					<span className="me-4">Cashier</span>
					<FaCashRegister className="text-success" size={"30px"} />
				</h2>
			</div>
			<div
				className="container bg-light rounded-4 border shadow-sm my-5 py-4"
				style={{ width: "100%", maxWidth: "1200px" }}
			>
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
							id="invoiceInput"
							placeholder="Invoice Number"
						/>
					</div>
					<div className="col-12 col-md-3 my-2">
						<button className="btn btn-lg btn-outline-dark rounded-3 d-flex align-items-center justify-content-center gap-1 w-100 text-center">
							<BiSearch />
							<span>Search</span>
						</button>
					</div>
				</div>

				<div className="table-responsive mb-4">
					<Table
						id="myTable"
						className="table-bordered table-striped shadow-sm"
					>
						<thead className="my-1">
							<tr>
								<th>#</th>
								<th>Product Name</th>
								<th>Quantity</th>
								<th>Amount</th>
								<th>Options</th>
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 10 }).map((_, index) => (
								<tr className="shadow" key={index}>
									<td>{index + 1}</td>
									<td>Huggies Pant Size 3 and 4 Jumbo</td>
									<td>2.00</td>
									<td>1050.00</td>
									<td>
										<ReactMenu menuItems={reactMenuItems} />
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</div>

				<div className="text-center my-2">
					<h2>
						Total (N): <span className="text-danger">9560.00</span>
					</h2>
					<h5>
						Discount (N): <span className="text-success">0.00</span>
					</h5>
				</div>
			</div>
			{/*  */}
			<div
				className="container bg-light border rounded-4 shadow-sm  p-3"
				style={{ width: "100%", maxWidth: "1200px" }}
			>
				<h3 className="display-5 fw-bold">Customer Details</h3>

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
							<Controller
								name="customer"
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										styles={customStyles}
										placeholder="Select Customer..."
										className={errors.customer ? "is-invalid" : ""}
										options={customerName}
									/>
								)}
							/>
							{errors.customer && (
								<div className="invalid-feedback d-block">
									{errors.customer.message}
								</div>
							)}
						</div>
						{/*  */}
						<h3 className="mb-3">Payment Mode</h3>
						<div className="row payment-mode-cards mx-auto">
							{["Cash", "Transfer", "POS/ATM", "Wallet"].map((mode, index) => (
								<div key={index} className="col-6 p-2">
									<div className="border p-3 rounded shadow-sm">
										<>
											<Form.Check
												className="py-3"
												name="paymentMethod"
												type="checkbox"
												label={mode}
												value={mode}
												{...register("paymentMethod")}
											/>
											<Form.Control
												type="number"
												placeholder="Enter Amount"
												className={
													errors.paymentModes?.[index]?.amount
														? "is-invalid"
														: ""
												}
											/>
											{errors.paymentModes?.[index]?.amount && (
												<div className="invalid-feedback">
													{errors.paymentModes[index].amount.message}
												</div>
											)}
										</>
									</div>
								</div>
							))}
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
							onClick={handleSubmit(onSubmit)}
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

export default CashierWindow;
