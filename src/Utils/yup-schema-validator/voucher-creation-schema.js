import * as yup from "yup";

const schema = yup.object().shape({
	customer_name: yup.string().required("Select a customer"),
	description: yup.string().required("Input a description"),
	amount: yup.string().required("Input an amount"),
	mode: yup
		.string()
		.required("Select an option")
		.oneOf(["card_no", "name"], "Invalid method selected"),
});

export { schema };
