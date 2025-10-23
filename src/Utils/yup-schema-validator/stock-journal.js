import * as yup from "yup";

const schema = yup.object().shape({
    source_product: yup.object().required("Select source product"),
    dest_product: yup.object().required("Select destination product"),

    quantity_val: yup
        .number()
        .nullable()
        .positive("Quantity must be positive")
        .required("Transfer Quantity is required"),
    transfer_to: yup
        .string()
        .required("Select an option")
        .oneOf(["store", "sales"], "Invalid destination selected"),
});

export { schema };
