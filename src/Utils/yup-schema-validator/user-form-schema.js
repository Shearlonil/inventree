import * as yup from "yup";

export const schema = yup.object().shape({
    fname: yup.string().required("First Name is required"),
    lname: yup.string().required("Last Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone_no: yup
        .string()
        .matches(/^\d{11}$/, "Phone number must be 11 digits")
        .required("Phone Number is required"),
    gender: yup.string().oneOf(["M", "F"], "Please select a gender").required(),
    level: yup.object().required("Account Type is required"),
    username: yup.string().min(4, "Username must be at least 4 characters").required(),
    password: yup.string().min(6, "Password must be at least 6 characters").required(),
    confirm_password: yup
        .string()
        .oneOf([yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
});

export const profile_update_schema = yup.object().shape({
    fname: yup.string().required("First Name is required"),
    lname: yup.string().required("Last Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone_no: yup
        .string()
        .matches(/^\d{11}$/, "Phone number must be 11 digits")
        .required("Phone Number is required"),
    gender: yup.string().oneOf(["M", "F"], "Please select a gender").required(),
    username: yup.string().min(4, "Username must be at least 4 characters").required(),
});
