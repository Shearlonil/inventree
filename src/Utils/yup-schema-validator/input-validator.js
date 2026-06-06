import * as yup from "yup";

let email_regx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const numberMiscParamSchema = yup.number().typeError("Number is required").required("number is required");

// https://stackoverflow.com/questions/64440963/positive-numbers-only-formik-yup-schema
export const positiveNumberMiscParamSchema = yup.number().typeError("Number is required").required("Number is required").test('Is positive?', 'ERROR: The number must be greater than 0!', 
    (value) => value > 0
);
export const zeroOrGtParamSchema = yup.number().typeError("Number is required").required("Number is required").test('Is positive?', 'ERROR: The number must be greater than or equal to 0!', 
    (value) => value >= 0
);

export const emailParamSchema = yup.string().matches(email_regx, 'A valid email format example@mail.com is required');