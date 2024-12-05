import React from "react";
import { Form, Table } from "react-bootstrap";
import { BiSearch, BiWallet, BiWalletAlt } from "react-icons/bi";
import { BsWallet2, BsWalletFill } from "react-icons/bs";
import { CiWallet } from "react-icons/ci";
import { HiMiniWallet } from "react-icons/hi2";
import { IoWalletOutline } from "react-icons/io5";
import { RiWallet2Fill } from "react-icons/ri";

const CashierWindow = () => {
	return (
		<>
			<div className="container bg-secondary-subtle rounded-2 my-3 py-4">
				<h2 className="mb-3">Cashier</h2>
				<div className="row px-3 mb-3">
					<div className="col-12 col-md-3 my-2">
						<label
							htmlFor="exampleFormControlInput1"
							className="form-label fw-bold"
						>
							Invoice:
						</label>
					</div>
					<div className="col-12 col-md-6 my-2">
						<input
							type="number"
							className="form-control"
							id="invoiceInput"
							placeholder="Invoice Number"
						/>
					</div>
					<div className="col-12 col-md-3 my-2">
						<button className="btn btn-primary rounded-pill d-flex align-items-center gap-1">
							<BiSearch />
							<span>Search</span>
						</button>
					</div>
				</div>

				<div className="table-responsive">
					<Table
						className="border border-secondary rounded-2"
						striped
						hover
						responsive
					>
						<thead>
							<tr>
								<th>#</th>
								<th>Product Name</th>
								<th>Quantity</th>
								<th>Amount</th>
							</tr>
						</thead>
						<tbody>
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

				<div className="text-center my-2">
					<h2>
						Total (N): <span className="text-danger">9560.00</span>
					</h2>
					<h5>
						Discount (N): <span className="text-success">0.00</span>
					</h5>
				</div>
			</div>
			<div className="container">
				<div className="border border-primary rounded-3 p-3">
					<h3 className="text-primary">Customer Details</h3>
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
							<p className="text-center">
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
									id="deduct_wallet_discount_from_payment"
									name="deduct_wallet_discount_from_payment"
								/>
								deduct wallet discount from payment
							</label>
						</div>
					</div>

					<div className="row mb-2">
						<div className="col-12 col-sm-4"></div>
						<div className="col-12 col-sm-8"></div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CashierWindow;