import React from 'react'
import { Button, Form } from "react-bootstrap";
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";

import ErrorMessage from '../ErrorMessage';
import { schema } from '../../Utils/yup-schema-validator/user-form-schema';
import { ThreeDotLoading } from '../react-loading-indicators/Indicator';
import User from '../../Entities/User';

const accountTypeOptions = [
    { id: 1, name: "SalesAss", label: "Sales Assistant", value: 3 },
    { id: 2, name: "Supervisor", label: "Supervisor", value: 2 },
    { id: 3, name: "Admin", label: "Admin", value: 1 },
];

const UserForm = (props) => {
	const { fnCreate, networkRequest }  = props;
    
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            fname: "",
            lname: "",
            phone_no: "",
            email: "",
            gender: "",
            level: null,
            username: "",
            pw: "",
            confirm_pw: "",
        },
    });
    
    const onSubmit = async (formData) => {
        const user = new User();
        user.username = formData.username;
        user.firstName = formData.fname;
        user.lastName = formData.lname;
        user.sex = formData.gender;
        user.phoneNo = formData.phone_no;
        user.email = formData.email;
        user.password = formData.password;
        user.level = formData.level.value;

        await fnCreate(user, reset);
    };

    //  Reset form on button click
    const handleReset = () => {
        reset();  //  Clears the form
    };

    return (
        <Form className="d-flex flex-column gap-3">
            <h4>User ID:</h4>

            {/* First Name */}
            <div>
                <label className="fw-bold">First Name:</label>
                <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="First Name"
                    {...register("fname")}
                />
                <ErrorMessage source={errors.fname} />
            </div>

            {/* Last Name */}
            <div>
                <label className="fw-bold">Last Name:</label>
                <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Last Name"
                    {...register("lname")}
                />
                <ErrorMessage source={errors.lname} />
            </div>

            {/* Phone Number */}
            <div>
                <label className="fw-bold">Phone Number:</label>
                <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="Phone Number"
                    {...register("phone_no")}
                />
                <ErrorMessage source={errors.phone_no} />
            </div>

            {/* Email */}
            <div>
                <label className="fw-bold">E-mail:</label>
                <input
                    type="email"
                    className="form-control mb-2 shadow-sm"
                    placeholder="example@gmail.com"
                    {...register("email")}
                />
                <ErrorMessage source={errors.email} />
            </div>

            {/* Gender */}
            <div>
                <div className="d-flex gap-3">
                    <Form.Check
                        type="radio"
                        label="Male"
                        value="M"
                        {...register("gender")}
                        name="gender"
                    />
                    <Form.Check
                        type="radio"
                        label="Female"
                        value="F"
                        {...register("gender")}
                        name="gender"
                    />
                </div>
                <ErrorMessage source={errors.gender} />
            </div>

            {/* Account Type Selection */}
            <div>
                <label className="fw-bold">Level:</label>
                <Controller
                    name="level"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <Select
							required
							name="level"
                            placeholder="Select Level..."
                            className="text-dark"
                            options={accountTypeOptions}
							onChange={(val) => onChange(val)}
							value={value}
                        />
                    )}
                />
                <ErrorMessage source={errors.level} />
            </div>

            {/* Username */}
            <div>
                <label className="fw-bold">User Name:</label>
                <input
                    type="text"
                    className="form-control shadow-sm"
                    placeholder="User Name"
                    {...register("username")}
                />
                <ErrorMessage source={errors.username} />
            </div>

            {/* Password */}
            <div>
                <label className="fw-bold">Password:</label>
                <input
                    type="password"
                    className="form-control shadow-sm"
                    placeholder="Password"
                    {...register("password")}
                />
                <ErrorMessage source={errors.password} />
            </div>

            {/* Confirm Password */}
            <div>
                <label className="fw-bold">Confirm Password:</label>
                <input
                    type="password"
                    className="form-control shadow-sm"
                    placeholder="Confirm Password"
                    {...register("confirm_password")}
                />
                <ErrorMessage source={errors.confirm_password} />
            </div>

            <div className='d-flex justify-content-center gap-3'>
                <Button variant="danger" onClick={handleReset} disabled={networkRequest} className='w-50'>
                    Reset
                </Button>
                <Button variant="success" onClick={handleSubmit(onSubmit)} className='w-50'>
                    { (networkRequest) && <ThreeDotLoading color="white" size="small" /> }
                    { (!networkRequest) && `Save` }
                </Button>
            </div>
        </Form>
    )
}

export default UserForm;