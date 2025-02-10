import * as yup from "yup";

const product_selection_schema = yup.object().shape({
	product: yup.object().required("Select a product"),
	item_disc: yup
		.number()
		.nullable()
		.min(0, 'Item Discount cannot be less than 0')
		.required("Item Discount is required for the selected payment mode"),

	qty: yup
		.number()
		.positive('Quantity cannot be less than 1')
		.nullable()
		.required("Amount is required for the selected payment mode"),

	qty_type: yup
		.string()
		.required("Select an option")
		.oneOf(["pkg", "unit"], "Invalid method selected"),
	item_disc_type: yup
		.string()
		.required("Select an option")
		.oneOf(["n", "perc"], "Invalid method selected"),
});

const cashier_schema = yup.object().shape({
	customer_name: yup.string().required("Select a customer"),
	item_disc: yup
		.number()
		.nullable()
		.min(0, 'Item Discount cannot be less than 0')
		.required("Item Discount is required for the selected payment mode"),

	qty: yup
		.number()
		.min(0, 'Quantity cannot be less than 0')
		.nullable()
		.required("Amount is required for the selected payment mode"),

	qty_type: yup
		.string()
		.required("Select an option")
		.oneOf(["pkg", "unit"], "Invalid method selected"),
	item_disc_type: yup
		.string()
		.required("Select an option")
		.oneOf(["n", "perc"], "Invalid method selected"),
});

export { product_selection_schema, cashier_schema };
