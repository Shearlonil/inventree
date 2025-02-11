import * as yup from "yup";

const product_selection_schema = yup.object().shape({
	product: yup.object().required("Select a product"),
	item_disc: yup
		.number()
		.nullable()
		.min(0, 'Item Discount cannot be less than 0')
		.required("Item Discount must be at least 0"),
	qty: yup
		.number()
		.positive('Quantity cannot be less than 1')
		.nullable()
		.required("Quantity is required"),

	qty_type: yup
		.string()
		.required("Select an option")
		.oneOf(["pkg", "unit"], "Invalid method selected"),
	item_disc_type: yup
		.string()
		.required("Select an option")
		.oneOf(["n", "perc"], "Invalid method selected"),
});

const invoice_disc_schema = yup.object().shape({
	invoice_disc: yup
		.number()
		.nullable()
		.min(1, 'Invoice Discount cannot be less than 0')
		.required("Invoice Discount must be at least 0"),
	invoice_disc_type: yup
		.string()
		.required("Select an option")
		.oneOf(["n", "perc"], "Invalid method selected"),
});

const customer_selection_schema = yup.object().shape({
	customer: yup.object().required("Select a customer"),
	cash: yup
		.number()
		.nullable()
		.min(0, 'Cash amount cannot be less than 0')
		.required("Cash amount must be at least 0"),
	transfer: yup
		.number()
		.min(0, 'Transfer amount cannot be less than 0')
		.nullable()
		.required("Transfer amount must be at least 0"),
	atm: yup
		.number()
		.nullable()
		.min(0, 'POS/ATM amount cannot be less than 0')
		.required("POS/ATM amount must be at least 0"),
});

export { product_selection_schema, customer_selection_schema, invoice_disc_schema };
