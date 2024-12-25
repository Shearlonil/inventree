import React from "react";
import { Form, Table } from "react-bootstrap";
import { BiMinus, BiPlus } from "react-icons/bi";
import { CgAdd } from "react-icons/cg";
import { HiMiniWallet } from "react-icons/hi2";
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
			{/*  */}
			<div className="container my-4 text-center">
				<h2 className="mb-2">
					Total (N): <span className="text-danger">9560.00</span>
				</h2>
				<div className="d-flex justify-content-center align-items-center gap-4">
					<input
						type="number"
						className="form-control"
						id="discount_value"
						placeholder="0"
						style={{ width: "160px" }}
					/>

					<Form.Check type="radio" label="N" value="unit" name="invoice_disc" />
					<Form.Check type="radio" label="%" value="perc" name="invoice_disc" />
					<div className="btn btn-success fw-bold p-2 px-2 d-flex align-items-center justify-content-center">
						<BiPlus />
					</div>
					<div className="btn btn-danger fw-bold p-2 px-2 d-flex align-items-center justify-content-center">
						<BiMinus />
					</div>
				</div>
			</div>
			{/*  */}
			<div className="container">
				<div className="border bg-secondary-subtle p-3 rounded-4">
					<div className="row">
						<div className="col-7 border border-2 border-primary rounded-2">
							<h3 className="text-primary mt-3">Customer Details</h3>
							<div
								className="d-flex flex-column gap-4"
								style={{ minHeight: "300px" }}
							>
								<div className="row mb-2 align-items-center">
									<div className="col-12 col-sm-4">
										<p className="text-sm-end h5">Search By:</p>
									</div>
									<div className="col-12 col-sm-8">
										<Form.Group className="my-2">
											<div className="pe-3">
												<div className="d-flex gap-5">
													<Form.Check
														type="radio"
														label="Name"
														value="name"
														name="search_param"
													/>
													<Form.Check
														type="radio"
														label="Card NO."
														value="card_no"
														name="search_param"
													/>
												</div>
											</div>
										</Form.Group>
									</div>
								</div>

								<div className="row mb-2">
									<div className="col-4">
										<p className="text-sm-end h5">Full Name:</p>
									</div>
									<div className="col-8">
										<p className="text-success fw-bold">Customer</p>
									</div>
								</div>

								<div className="row mb-2">
									<div className="col-4">
										<p className=" text-end">
											<HiMiniWallet size={25} />
										</p>
									</div>
									<div className="col-8 d-flex flex-column gap-3">
										<div className="d-flex gap-5">
											<p className="text-danger">1100.00</p>
											<p>
												Disount {"(%)"}: <span className="text-success">0</span>
											</p>
										</div>
										<label
											className="d-flex gap-2 text-success fw-bold"
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
							</div>
						</div>

						{/*  */}
						<div className="col-5">
							<div className="row mb-2">
								<div className="col-12 col-sm-4">
									<p className="text-sm-end h5">Payment Mode:</p>
								</div>
								<div className="col-12 col-sm-8">
									<div className="d-flex gap-3 flex-wrap mt-2">
										<div className="d-flex flex-column gap-3">
											<label
												className="d-flex gap-2 fw-bold"
												htmlFor="payment_mode_cash"
											>
												<Form.Check
													type="checkbox"
													value="yes"
													className="shadow-sm p-0 m-0"
													id="payment_mode_cash"
													name="payment_mode_cash"
												/>
												Cash
											</label>
											<input
												type="number"
												className="form-control"
												id="payment_mode_cash_amount"
												placeholder="0"
											/>
										</div>
										<div className="d-flex flex-column gap-3">
											<label
												className="d-flex gap-2 fw-bold"
												htmlFor="payment_mode_transfer"
											>
												<Form.Check
													type="checkbox"
													value="yes"
													className="shadow-sm p-0 m-0"
													id="payment_mode_transfer"
													name="payment_mode_transfer"
												/>
												Transfer
											</label>
											<input
												type="number"
												className="form-control"
												id="payment_mode_transfer_amount"
												placeholder="0"
											/>
										</div>
										<div className="d-flex flex-column gap-3">
											<label
												className="d-flex gap-2 fw-bold"
												htmlFor="payment_mode_pos_atm"
											>
												<Form.Check
													type="checkbox"
													value="yes"
													className="shadow-sm p-0 m-0"
													id="payment_mode_pos_atm"
													name="payment_mode_pos_atm"
												/>
												POS/ATM
											</label>
											<input
												type="number"
												className="form-control"
												id="payment_mode_pos_atm_amount"
												placeholder="0"
											/>
										</div>

										<div className="d-flex flex-column gap-3">
											<label
												className="d-flex gap-2 fw-bold"
												htmlFor="payment_mode_wallet"
											>
												<Form.Check
													type="checkbox"
													value="yes"
													className="shadow-sm p-0 m-0"
													id="payment_mode_wallet"
													name="payment_mode_wallet"
												/>
												Wallet
											</label>
											<input
												type="number"
												className="form-control"
												id="payment_mode_wallet_amount"
												placeholder="0"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
						{/*  */}
					</div>
					<div className="d-flex justify-content-between align-items-center p-3">
						<div>
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
						<div className="d-flex gap-3">
							<button
								className="btn btn-danger rounded-pill"
								style={{ width: "160px" }}
							>
								Cancel
							</button>
							<button
								className="btn btn-success rounded-pill"
								style={{ width: "160px" }}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default MonoTransaction;
