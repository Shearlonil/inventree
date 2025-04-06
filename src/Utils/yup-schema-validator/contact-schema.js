import * as yup from "yup";

const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    phone_no: yup.string()
        .matches(/^\d{10,11}$/, "Invalid phone number")
        .required("Phone number is required"),
    address: yup.string().required("Address is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
});

export { schema };