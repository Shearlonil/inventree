import React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { CgUserAdd } from 'react-icons/cg';
import { CiEdit } from 'react-icons/ci';
import { IoWalletOutline } from 'react-icons/io5';
import { Table } from 'react-bootstrap';
import * as yup from 'yup';

const schema = yup.object().shape({
    customer_name: yup.string().required("Customer name is required"),
    phone_no: yup.string()
        .matches(/^\d{10,11}$/, "Invalid phone number")
        .required("Phone number is required"),
    address: yup.string().required("Address is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
});

const CustomerWindows = () => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data) => {
        console.log(data);
        setValue("customer_name", "");
        setValue("phone_no", "");
        setValue("address", "");
        setValue("email", "");
    };

    return (
        <div>
            <div className="text-center my-5">
                <h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
                    <span className="me-4">Add New Customer</span>
                    <CgUserAdd className="text-danger" size={30} />
                </h2>
            </div>

            <div className="container row mx-auto my-3 p-3 rounded bg-light shadow border">
                <h4 className="mb-3">Customer ID:-</h4>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Customer Name:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Customer Name"
                        {...register("customer_name")}
                    />
                    <small className="text-danger">{errors.customer_name?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Phone Number:</p>
                    <input
                        type="tel"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Phone Number"
                        {...register("phone_no")}
                    />
                    <small className="text-danger">{errors.phone_no?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Address:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Address here"
                        {...register("address")}
                    />
                    <small className="text-danger">{errors.address?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">E-mail:</p>
                    <input
                        type="email"
                        className="form-control mb-2 shadow-sm"
                        placeholder="example@gmail.com"
                        {...register("email")}
                    />
                    <small className="text-danger">{errors.email?.message}</small>
                </div>

                <div className="d-flex gap-3">
                    <button type="reset" className="btn btn-outline-danger ms-auto">
                        <span className="d-flex gap-2 align-items-center px-4">
                            <span className="fs-5">Reset</span>
                        </span>
                    </button>

                    <button className="btn btn-outline-success" onClick={handleSubmit(onSubmit)}>
                        <span className="d-flex gap-2 align-items-center px-4">
                            <span className="fs-5">Save</span>
                        </span>
                    </button>
                </div>
            </div>

            <div className="container mt-4 p-3 shadow-sm border border-2 rounded-1">
                <div className="border bg-light my-3">
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th>Customer Name</th>
                                <th>Status</th>
                                <th>Phone No.:</th>
                                <th>Address</th>
                                <th>E-mail</th>
                                <th>Card No.</th>
                                <th>Update</th>
                                <th>Wallet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr key={index}>
                                    <td>Mrs Oseni Yemisi</td>
                                    <td>Active</td>
                                    <td>7012345678</td>
                                    <td>Quarry</td>
                                    <td>yemibiodun32@yahoo.com</td>
                                    <td>84</td>
                                    <td className='text-center text-secondary'>
                                        <CiEdit size={30} />
                                    </td>
                                    <td className='text-center text-success'>
                                        <IoWalletOutline size={30} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default CustomerWindows;
