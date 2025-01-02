import * as Yup from "yup";

// Yup schema for validation
const schema = Yup.object().shape({
	customer: Yup.object().required("Customer selection is required"),
	paymentModes: Yup.array()
		.of(
			Yup.object().shape({
				mode: Yup.string().required(),
				amount: Yup.number()
					.positive("Amount must be positive")
					.required("Amount is required for the selected payment mode"),
			})
		)
		.min(1, "At least one payment mode must be selected with a valid amount"),
});

export { schema };
