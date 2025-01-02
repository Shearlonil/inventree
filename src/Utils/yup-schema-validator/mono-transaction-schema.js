import * as yup from "yup";

const schema = yup.object().shape({
	customer_name: yup.string().required("Select a customer"),
	// amount: yup.string().required("Input an amount"),
	discount_amount: yup
		.number()
		.nullable()
		.positive("Amount must be positive")
		.required("Amount is required for the selected payment mode"),

	quantity_amount: yup
		.number()
		.nullable()
		.positive("Amount must be positive")
		.required("Amount is required for the selected payment mode"),

	quantity_type: yup
		.string()
		.required("Select an option")
		.oneOf(["pack", "unit"], "Invalid method selected"),
	discount: yup
		.string()
		.required("Select an option")
		.oneOf(["n", "perc"], "Invalid method selected"),
});

export { schema };
