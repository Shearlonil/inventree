import * as yup from "yup";

const schema = yup.object().shape({
    product: yup.object().required("Select a product"),

    quantity_val: yup
        .number()
        .nullable()
        .positive("Quantity must be positive")
        .required("Dispense Quantity is required"),
    dispense_qty_type: yup
        .string()
        .required("Select an option")
        .oneOf(["pkg", "unit"], "Invalid quantity type selected"),

    store_qty: yup
        .number()
        .nullable()
        .positive("Quantity must be positive")
        .required("Store quantity required for the selected payment mode"),
    store_qty_type: yup
        .string()
        .required("Select an option")
        .oneOf(["unit", "pkg"], "Invalid quantity type selected"),
});

export { schema };
