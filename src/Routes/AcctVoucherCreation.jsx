import React from "react";
import { Form, Table } from "react-bootstrap";
import Select from "react-select";

const AcctVoucherCreation = () => {
	const selectOption = [
		{ value: "Mr. Farouk", label: "Mr. Farouk" },
		{ value: "mrs", label: "Mrs" },
		{ value: "miss", label: "Miss" },
		{ value: "ms", label: "Ms" },
		{ value: "others", label: "Others" },
	];

	return (
		<>
			<h3 className="text-center my-3 fw-bold">Request Voucher</h3>
			<div className="container">
				<div className="row p-3 rounded-2 my-3 py-4 border shadow">
					<div className="col-12 col-md-4 my-3">
						<div className="d-flex flex-column gap-3">
							<Select
								required
								placeholder="Select..."
								className="shadow-sm"
								options={selectOption}
								onChange={""}
							/>
							<p>
								Current Bal:{" "}
								<span className="text-danger fw-bold fs-5">-68.75</span>
							</p>
							<input
								type="text"
								className="form-control"
								id="invoiceInput"
								placeholder="Description"
							/>
							<input
								type="number"
								className="form-control"
								id="invoiceInput"
								placeholder="Amount"
							/>
							<Form.Group className="my-2">
								<div className="pe-3">
									<label className="fw-bold mb-2">Mode</label>
									<div className="d-flex gap-5">
										<Form.Check
											type="radio"
											label="Name"
											value="name"
											name="search_param"
											// checked={field.value === "babysitting"}
											// onChange={(e) => field.onChange(e.target.value)}
										/>
										<Form.Check
											type="radio"
											label="Card NO."
											value="card_no"
											name="search_param"
											// checked={field.value === "childminding"}
											// onChange={(e) => field.onChange(e.target.value)}
										/>
									</div>
									{/* <ErrorMessage source={errors.request_service} /> */}
								</div>
							</Form.Group>
							<button className="btn btn-success rounded-1">Next</button>
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
								<p>No content in table</p>
								{/* {Array.from({ length: 10 }).map((_, index) => (
									<tr key={index}>
										<td>1</td>
										<td>Huggies Pant Size 3 and 4 Jumbo</td>
										<td>2.00</td>
										<td>1050.00</td>
									</tr>
								))} */}
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
						className="btn btn-danger rounded-pill py-1"
						style={{ width: "7em" }}
					>
						Cancel
					</button>
					<button
						className="btn btn-success rounded-pill py-1"
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
