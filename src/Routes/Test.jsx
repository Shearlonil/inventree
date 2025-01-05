import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form, Button } from "react-bootstrap";
import Select from "react-select";
import ErrorMessage from "../Components/ErrorMessage";

const customStyles = {
	control: (provided) => ({
		...provided,
		backgroundColor: "#ffffff",
		borderColor: "#cecec8ca",
		padding: "10px 0px",
		minHeight: "48px",
	}),
};

const schema = yup.object().shape({
	customer: yup
		.object()
		.shape({
			value: yup.string().required("Please select a customer."),
			label: yup.string(),
		})
		.nullable()
		.required("Please select a customer."),
	paymentModes: yup
		.array()
		.of(
			yup.object().shape({
				selected: yup.boolean(),
				amount: yup
					.number()
					// .transform((value, originalValue) =>
					// 	originalValue === "" ? undefined : value
					// ) // Transform empty strings to undefined
					// .nullable(),
					.min(1, "Amount must be a positive number."),
				// .when("selected", {
				// 	is: false,
				// 	then: yup.number().min(1, "Enter an amount greater than zero."),
				// }),
				// .when("selected", {
				// 	is: true,
				// 	then: yup
				// 		.number()
				// 		.min(1, "Enter an amount greater than zero.")
				// 		.required("Amount is required."),
				// 	otherwise: yup.number().nullable(),
				// }),
			})
		)
		.test(
			"at-least-one-payment",
			"At least one payment mode must be selected with a valid amount.",
			(paymentModes) =>
				paymentModes.some((mode) => mode.selected && mode.amount > 0)
		),
});

const CashierDetails = () => {
	const customerOptions = [
		{ value: "john_doe", label: "John Doe" },
		{ value: "jane_doe", label: "Jane Doe" },
		{ value: "mike_smith", label: "Mike Smith" },
	];

	const {
		register,
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			customer: null,
			paymentModes: [
				{ mode: "Cash", amount: 0, selected: false },
				{ mode: "Transfer", amount: 0, selected: false },
				{ mode: "POS/ATM", amount: 0, selected: false },
				{ mode: "Wallet", amount: 0, selected: false },
			],
		},
	});

	const { fields } = useFieldArray({
		control,
		name: "paymentModes",
	});

	const onSubmit = (data) => {
		console.log("Form submitted:", data);
		alert("Payment successful!");
	};

	const watchPaymentModes = watch("paymentModes");

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="container bg-light border rounded-4 shadow-sm p-3">
				<h3 className="display-5 fw-bold">Customer Details</h3>

				<div className="row mx-auto">
					{/* Customer Section */}
					<div className="col-12 col-md-6 bg-success text-white p-4 d-flex flex-column align-items-center mb-3">
						<div className="text-center mb-4">
							<h4>John Doe</h4>
						</div>
					</div>

					{/* Payment Section */}
					<div className="col-12 col-md-5 mb-4">
						<div className="mb-4">
							<Select
								styles={customStyles}
								placeholder="Select Customer..."
								options={customerOptions}
								onChange={(option) => setValue("customer", option)}
							/>
							{errors.customer && (
								<div className="text-danger mt-2">
									{errors.customer.message}
								</div>
							)}
						</div>

						<h3 className="mb-3">Payment Mode</h3>
						<div className="row payment-mode-cards mx-auto">
							{fields.map((field, index) => (
								<div key={field.id} className="col-6 p-2">
									<div className="border p-3 rounded shadow-sm">
										<Form.Check
											type="checkbox"
											label={field.mode}
											{...register(`paymentModes.${index}.selected`)}
										/>
										<Form.Control
											type="number"
											placeholder="Enter Amount"
											{...register(`paymentModes.${index}.amount`)}
											disabled={!watchPaymentModes[index]?.selected}
										/>
										<p className="text-danger">Error here</p>
									</div>
								</div>
							))}
						</div>
						{errors.paymentModes && (
							<div className="text-danger mt-3">
								{errors.paymentModes.message}
							</div>
						)}
					</div>
				</div>

				<div className="d-flex flex-column flex-sm-row gap-2 justify-content-center align-items-center my-2 p-2">
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
		</form>
	);
};

export default CashierDetails;
