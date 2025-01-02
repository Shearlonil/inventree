import React from "react";
import { Form, Table } from "react-bootstrap";
import { BiMinus, BiPlus } from "react-icons/bi";
import { GrTransaction } from "react-icons/gr";
import {  HiUser } from "react-icons/hi2";
import { IoAddSharp } from "react-icons/io5";
import Select from "react-select";
import { customerName, selectOption } from "../../data";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { schema } from "../Utils/yup-schema-validator/mono-transaction-schema";
import ErrorMessage from "../Components/ErrorMessage";

const MonoTransaction = () => {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			discount_amount: 0,
		},
	});

	const onSubmit = (data) => {
		console.log(data);
	};
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

	return (
		<>
			<div className="text-center my-5">
				<h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
					<span className="me-4">Transactions</span>
					<GrTransaction className="text-danger" size={"30px"} />
				</h2>
			</div>
			<div className="container my-3 p-3 rounded bg-light shadow">
				<div className="row mt-4 mb-3">
					<div className="col-4 text-end">
						<p className="h5">Product:</p>
					</div>
					<div className="col-8 d-flex flex-column gap-3">
						<Controller
							name="customer_name"
							control={control}
							render={({ field: { onChange } }) => (
								<Select
									required
									name="customer_name"
									placeholder="Select..."
									className="text-dark col-12 col-md-6"
									options={selectOption}
									onChange={(val) => onChange(val.value)}
								/>
							)}
						/>

						<ErrorMessage source={errors.customer_name} />

						<div className="d-flex gap-3">
							<p>
								Unit (N): <span className="text-info fw-bold">{"0"}</span>
							</p>
							<p>
								Package (N): <span className="text-info fw-bold">{"0"}</span>
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
									{...register("quantity_amount")}
								/>
								<ErrorMessage source={errors.quantity_amount} />
							</div>
							<div className="col-12">
								<div className="d-flex gap-3">
									<Form.Check
										type="radio"
										label="Unit"
										value="unit"
										name="quantity_type"
										{...register("quantity_type")}
									/>
									<Form.Check
										type="radio"
										label="Pack"
										value="pack"
										{...register("quantity_type")}
										name="quantity_type"
									/>
								</div>
								<ErrorMessage source={errors.quantity_type} />
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
									{...register("discount_amount")}
								/>
								<ErrorMessage source={errors.discount_amount} />
							</div>
							<div className="col-12">
								<div className="d-flex gap-3">
									<Form.Check
										type="radio"
										label="N"
										value="n"
										name="discount"
										{...register("discount")}
									/>
									<Form.Check
										type="radio"
										label="%"
										value="perc"
										{...register("discount")}
										name="discount"
									/>
								</div>
								<ErrorMessage source={errors.discount} />
							</div>
						</div>
					</div>
				</div>

				<div className="d-flex">
					<button
						className="btn btn-outline-dark mx-auto"
						onClick={handleSubmit(onSubmit)}
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
					<Table id="myTable" className="rounded-2" striped hover responsive>
						<thead>
							<tr className="shadow-sm">
								<th>Product Name</th>
								<th>Quantity</th>
								<th>Type</th>
								<th>Price (x1)</th>
								<th>Discount</th>
								<th>Amount</th>
							</tr>
						</thead>
						<tbody>
							{/* <p>No content in table</p> */}
							{Array.from({ length: 10 }).map((_, index) => (
								<tr key={index}>
									<td>CALAMINE LOTION</td>
									<td>1</td>
									<td>Unit</td>
									<td>1050.00</td>
									<td>0.00</td>
									<td>1050.00</td>
								</tr>
							))}
						</tbody>
					</Table>
				</div>
			</div>
			{/*  */}
			<div className="container my-5 py-3 d-flex flex-column flex-lg-row justify-content-center align-items-center gap-5">
				<h2 className="mb-2">
					Total (N): <span className="text-danger">9560.00</span>
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
								<span className="text-success">456.00</span>
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
								styles={customStyles}
								placeholder="Select Customer..."
								className="shadow-sm"
								options={customerName}
								onChange={""}
							/>
						</div>
						<h3 className="mb-3">Payment Mode</h3>
						<div className="row payment-mode-cards mx-auto">
							{["Cash", "Transfer", "POS/ATM", "Wallet"].map((mode, index) => (
								<div key={index} className="col-6 p-2">
									<div className="border p-3 rounded shadow-sm">
										<Form.Check
											type="checkbox"
											label={mode}
											className="fw-bold"
										/>
										<Form.Control type="number" placeholder="Enter Amount" />
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
