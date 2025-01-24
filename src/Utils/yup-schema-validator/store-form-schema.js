import * as yup from "yup";

const schema = yup.object().shape({
	section: yup.string().required("Select a section"),
	item_name: yup.string().required("Item name required!"),
	total_qty: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	package_unit: yup
		.string()
		.required("Select a packaging option"),
	qty_per_pkg: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	unit_stock: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	unit_sales: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	package_stock: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	package_sales: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	vendor: yup
		.string()
		.required("Vendor is required"),
	purchase_mode: yup
		.string()
		.required("Purchase Mode is required"),
	amount_paid: yup
		.number()
		.required("Amount Paid is required"),
});

export { schema };
