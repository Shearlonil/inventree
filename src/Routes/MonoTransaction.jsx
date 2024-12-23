import React from "react";
import { Form, Table } from "react-bootstrap";
import { CgAdd } from "react-icons/cg";
import { IoAddSharp } from "react-icons/io5";
import Select from "react-select";

const MonoTransaction = () => {
	const selectOption = [
		{ value: "Mr. Farouk", label: "Mr. Farouk" },
		{ value: "mrs", label: "Mrs" },
		{ value: "miss", label: "Miss" },
		{ value: "ms", label: "Ms" },
		{ value: "others", label: "Others" },
	];

	return (
		<>
			<div className="container my-3 p-3 rounded bg-light shadow">
				<div className="row mt-4 mb-3">
					<div className="col-4 text-end">
						<p className="h5">Product Name:</p>
					</div>
					<div className="col-8 d-flex flex-column gap-3">
						<Select
							required
							placeholder="Select..."
							className="shadow-sm"
							options={selectOption}
							onChange={""}
						/>
						<div className="d-flex gap-5">
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
					<div className="col-8 d-flex flex-column flex-sm-row gap-3 align-items-center">
						<input
							type="number"
							className="form-control"
							id="quantity_value"
							placeholder="0"
							style={{ width: "160px" }}
						/>

						<Form.Check
							type="radio"
							label="Unit"
							value="unit"
							name="quan	tity_type"
							// checked={field.value === "babysitting"}
							// onChange={(e) => field.onChange(e.target.value)}
						/>
						<Form.Check
							type="radio"
							label="Pack"
							value="pack"
							name="quantity_type"
							// checked={field.value === "babysitting"}
							// onChange={(e) => field.onChange(e.target.value)}
						/>
					</div>
				</div>

				<div className="row mb-3">
					<div className="col-4 text-end">
						<p className="h5">Discount:</p>
					</div>
					<div className="col-8 d-flex flex-column flex-sm-row gap-3 align-items-center">
						<input
							type="number"
							className="form-control"
							id="dicount_amount"
							placeholder="0"
							style={{ width: "160px" }}
						/>

						<Form.Check
							type="radio"
							label="N"
							value="unit"
							name="discount"
							// checked={field.value === "babysitting"}
							// onChange={(e) => field.onChange(e.target.value)}
						/>
						<Form.Check
							type="radio"
							label="%"
							value="perc"
							name="quantity_type"
							// checked={field.value === "babysitting"}
							// onChange={(e) => field.onChange(e.target.value)}
						/>
					</div>
				</div>
				<div className="d-flex">
					<div className="btn btn-success ms-auto">
						<span className="d-flex gap-2 align-items-center">
							<IoAddSharp size={"25"} />
							<span className="fs-5">Add</span>
						</span>
					</div>
				</div>
			</div>

			<div className="container mt-4 p-3 shadow-sm border border-2 border-primary rounded-1">
				<div className="border bg-light my-3">
					<Table className="rounded-2" striped hover responsive>
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
		</>
	);
};

export default MonoTransaction;
