import * as yup from "yup";

const schema = yup.object().shape({
	section: yup.object().required("Select a section"),
	item_name: yup.string().required("Item name required!"),
	total_qty: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	qty_type: yup.object().required("Select a packaging option"),
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
	pkg_stock_price: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	pkg_sales_price: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	vendor: yup.object().required("Vendor is required"),
	amount_paid: yup
		.number()
		.required("Amount Paid is required"),
});

export { schema };
