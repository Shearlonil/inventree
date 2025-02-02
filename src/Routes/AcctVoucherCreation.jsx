import React from "react";
import { Form, Table } from "react-bootstrap";
import Select from "react-select";
import OffcanvasMenu from "../Components/OffcanvasMenu";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

import { schema } from "../Utils/yup-schema-validator/voucher-creation-schema";
import { FaReceipt } from "react-icons/fa";
import ErrorMessage from "../Components/ErrorMessage";

const AcctVoucherCreation = () => {
	const selectOption = [
		{ value: "Mr. Farouk", label: "Mr. Farouk" },
		{ value: "mrs", label: "Mrs" },
		{ value: "miss", label: "Miss" },
		{ value: "ms", label: "Ms" },
		{ value: "others", label: "Others" },
	];

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({ resolver: yupResolver(schema) });

	const onSubmit = (data) => {
		console.log(data);
	};
	return (
		<>
			<OffcanvasMenu />
			<div className="text-center my-5">
				<h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
					<span className="me-4">Voucher</span>
					<FaReceipt className="text-success" size={"30px"} />
				</h2>
			</div>
			<div className="container">
				<div className="row p-3 rounded-2 my-3 py-4 border shadow">
					<div className="col-12 col-md-4 my-3">
						<div className="d-flex flex-column gap-3">
							<Controller
								name="customer_name"
								control={control}
								render={({ field: { onChange } }) => (
									<Select
										required
										name="customer_name"
										placeholder="Select..."
										className="text-dark "
										options={selectOption}
										onChange={(val) => onChange(val.value)}
									/>
								)}
							/>

							<ErrorMessage source={errors.customer_name} />
							<p>
								Current Bal:{" "}
								<span className="text-danger fw-bold fs-5">-68.75</span>
							</p>
							<Form.Control
								required
								id="invoiceInput"
								type="text"
								placeholder="Description"
								{...register("description")}
							/>
							<ErrorMessage source={errors.description} />
							<Form.Control
								required
								id="invoiceInput"
								type="number"
								placeholder="Amount"
								{...register("amount")}
							/>
							<ErrorMessage source={errors.amount} />
							<Form.Group className="my-2">
								<div className="pe-3">
									<label className="fw-bold mb-2">Mode</label>
									<div className="d-flex gap-5">
										<Form.Check
											className="py-3"
											name="mode"
											type="radio"
											label="Name"
											value="name"
											{...register("mode")}
										/>
										<Form.Check
											className="py-3"
											name="mode"
											type="radio"
											label="Card NO."
											value="card_no"
											{...register("mode")}
										/>
									</div>
									<ErrorMessage source={errors.mode} />
								</div>
							</Form.Group>
							<button
								className="btn btn-success rounded-1"
								onClick={handleSubmit(onSubmit)}
							>
								Next
							</button>
						</div>
					</div>
					<div className="col-12 col-md-8 border bg-light my-3">
						<Table id="myTable" className="rounded-2" striped hover responsive>
							<thead>
								<tr className="shadow-sm">
									<th>Ledger</th>
									<th>Particulars</th>
									<th>Debit</th>
									<th>Credit</th>
								</tr>
							</thead>
							<tbody>
								{/* <p>No content in table</p> */}
								{Array.from({ length: 10 }).map((_, index) => (
									<tr key={index}>
										<td>1</td>
										<td>Huggies Pant Size 3 and 4 Jumbo</td>
										<td>2.00</td>
										<td>1050.00</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>
				</div>
				<div className="d-flex flex-end justify-content-end gap-5 p-3">
					<div className="text-center">
						<p className="fw-bold">Total Debit</p>
						<h5>0.00</h5>
					</div>
					<div className="text-center">
						<p className="fw-bold">Total Debit</p>
						<h5>0.00</h5>
					</div>
				</div>
				<div className="d-flex flex-end justify-content-end gap-3">
					<button
						className="btn btn-danger rounded-3 py-1"
						style={{ width: "7em" }}
					>
						Cancel
					</button>
					<button
						className="btn btn-success rounded-3 py-1"
						style={{ width: "7em" }}
					>
						Ok
					</button>
				</div>
			</div>
		</>
	);
};

export default AcctVoucherCreation;
