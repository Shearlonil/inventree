import * as yup from "yup";

const qtyTransfer = yup.object().shape({
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

const qtyAdjustment = yup.object().shape({
    source_product: yup.object().required("Select source product"),

    quantity_val: yup
        .number()
        .nullable()
        .min(0, 'Quantity cannot be less than 0')
        .required("Quantity is required"),
});

export { qtyTransfer, qtyAdjustment };
