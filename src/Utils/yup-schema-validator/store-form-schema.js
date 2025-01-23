import * as yup from "yup";
import { packagingOptions } from "../../../data";

const schema = yup.object().shape({
	store: yup.string().required("Select a store"),
	item_name: yup.string().required("Item name required!"),
	total_qty: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	package_unit: yup
		.object()
		.required("Select an option")
		.oneOf(packagingOptions, "Invalid selection"),
	qty_package: yup
		.number()
		.positive("Amount must be positive")
		.required("Amount is required"),
	tot_qty: yup
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
});

export { schema };
