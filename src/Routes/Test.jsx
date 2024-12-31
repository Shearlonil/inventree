import React from "react";
import { Button, Form, Table } from "react-bootstrap";
import { HiUser } from "react-icons/hi2";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import "../Components/Styles/test.css";
import ReactMenu from "../Components/ReactMenu";

const customStyles = {
	control: (provided) => ({
		...provided,
		backgroundColor: "#ffffff",
		borderColor: "#cecec8ca",
		padding: "10px 0px",
		minHeight: "48px",
	}),
};

const CashierDetails = () => {
	const customerOptions = [
		{ value: "john_doe", label: "John Doe" },
		{ value: "jane_doe", label: "Jane Doe" },
		{ value: "mike_smith", label: "Mike Smith" },
	];

	// Yup schema for validation
	const schema = Yup.object().shape({
		customer: Yup.object().required("Customer selection is required"),
		paymentModes: Yup.array()
			.of(
				Yup.object().shape({
					mode: Yup.string().required(),
					amount: Yup.number()
						.nullable()
						.positive("Amount must be positive")
						.required("Amount is required for the selected payment mode"),
				})
			)
			.min(1, "At least one payment mode must be selected with a valid amount"),
	});

	// React Hook Form setup
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			paymentModes: [
				{ mode: "Cash", amount: null },
				{ mode: "Transfer", amount: null },
				{ mode: "POS/ATM", amount: null },
				{ mode: "Wallet", amount: null },
			],
		},
	});

	const onSubmit = (data) => {
		console.log("Form Submitted:", data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="container bg-light border rounded-4 shadow-sm  p-3">
				<h3 className="display-5 fw-bold">Customer Details</h3>

				<div className="row mx-auto">
					{/* Customer Profile Section */}
					<div className="col-12 col-md-6 bg-success text-white p-4 d-flex flex-column align-items-center mb-3">
						<div className="text-center mb-4">
							<HiUser size={80} className="mb-3" />
							<p>Customer Name: </p>
							<h4>John Doe</h4>
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
										options={customerOptions}
									/>
								)}
							/>
							{errors.customer && (
								<div className="invalid-feedback d-block">
									{errors.customer.message}
								</div>
							)}
						</div>

						<h3 className="mb-3">Payment Mode</h3>
						<div className="row payment-mode-cards mx-auto">
							{["Cash", "Transfer", "POS/ATM", "Wallet"].map((mode, index) => (
								<div key={index} className="col-6 p-2">
									<div className="border p-3 rounded shadow-sm">
										<Controller
											name={`paymentModes.${index}.amount`}
											control={control}
											render={({ field }) => (
												<>
													<Form.Check
														type="checkbox"
														label={mode}
														{...field}
														className="fw-bold"
													/>
													<Form.Control
														{...field}
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
											)}
										/>
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
						<Button
							type="button"
							variant="danger"
							className="btn-lg"
							style={{ width: "270px" }}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="success"
							className="btn-lg"
							style={{ width: "270px" }}
						>
							OK
						</Button>
					</div>
				</div>

				<div className="table-container">
					<Table id="myTable" className="table-bordered table-striped">
						<thead>
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
								<tr key={index}>
									<td>{index + 1}</td>
									<td>Huggies Pant Size 3 and 4 Jumbo</td>
									<td>2.00</td>
									<td>1050.00</td>
									<td>
										<ReactMenu />
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</div>

				<div className="detached-section">
					<h3 className="display-5 fw-bold">Customer Details</h3>
					<div className="row mx-auto">
						{/* Customer Profile Section */}
						<div className="col-12 col-md-6 bg-success text-white p-4 d-flex flex-column align-items-center mb-3">
							{/* Content */}
						</div>

						{/* Payment Section */}
						<div className="col-12 col-md-5">{/* Content */}</div>
					</div>
				</div>
				{/*  */}
			</div>
		</form>
	);
};

export default CashierDetails;
