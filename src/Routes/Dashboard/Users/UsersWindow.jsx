import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { CgMenuLeft, CgUserAdd } from "react-icons/cg";

import ConfirmDialog from "../../../Components/DialogBoxes/ConfirmDialog";
import DropDownDialog from "../../../Components/DialogBoxes/DropDownDialog";
import { schema } from '../../../Utils/yup-schema-validator/user-window-schema';
import ErrorMessage from "../../../Components/ErrorMessage";
import OffcanvasMenu from "../../../Components/OffcanvasMenu";

const products = [
    { id: 1, name: "Pharmacy", label: "Pharmacy" },
    { id: 2, name: "Hotel", label: "Hotel" },
    { id: 3, name: "SuperMarket", label: "SuperMarket" },
];
const myStyle = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    cursor: "pointer",
    zIndex: 999,
}
const UsersWindow = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
            gender: "",
            product_name: null,
            username: "",
            pw: "",
            confirm_pw: "",
        },
    });

    const usersOffCanvasMenu = [
        { label: "Search By Username", onClickParams: {evtName: 'searchByUsername'} },
        { label: "Search By First Name", onClickParams: {evtName: 'searchByFirstName'} },
        { label: "Sort By Username", onClickParams: {evtName: 'sortByUsername'} },
        { label: "Sort By First Name", onClickParams: {evtName: 'sortByFirstName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
    ];

    const onSubmit = (data) => {
        console.log(data);
    };
    // Reset form on button click
    const handleReset = () => {
        reset();  //  Clears the form
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByUsername':
                // setDisplayMsg("Enter Customer Name");
				// setConfirmDialogEvtName(onclickParams.evtName);
				// setShowInputModal(true);
                break;
            case 'searchByFirstName':
                // setDisplayMsg("Enter Customer Card No.");
				// setConfirmDialogEvtName(onclickParams.evtName);
                // setShowInputModal(true);
                break;
            case 'trash':
                // navigate('/contacts/customers/trash');
                break;
            case 'showAll':
                setFilteredCustomers(customers);
                setTotalItemsCount(customers.length);
                break;
            case 'sortByUsername':
                // filteredCustomers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                // if(currentPage === 1){
                //     setPagedData(filteredCustomers.slice(0, 0 + pageSize));
                // }
                // setCurrentPage(1);
                break;
            case 'sortByFirstName':
                // filteredCustomers.sort((a, b) => a.loyaltyCardNo - b.loyaltyCardNo);
                // if(currentPage === 1){
                //     setPagedData(filteredCustomers.slice(0, 0 + pageSize));
                // }
                // setCurrentPage(1);
                break;
        }
	}

    const formComp = () => (
        <>
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

            {/* Gender */}
            <div className="d-flex gap-3">
                <Form.Check
                    type="radio"
                    label="Male"
                    value="male"
                    {...register("gender")}
                    name="gender"
                />
                <Form.Check
                    type="radio"
                    label="Female"
                    value="female"
                    {...register("gender")}
                    name="gender"
                />
            </div>

            {/* Product Selection */}
            <div>
                <label className="fw-bold">Product:</label>
                <Controller
                    name="product_name"
                    control={control}
                    render={({ field }) => (
                        <Select
                            placeholder="Select..."
                            className="text-dark"
                            options={products}
                            {...field}
                        />
                    )}
                />
                <ErrorMessage source={errors.product_name} />
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

            {/* Buttons */}
            <div className="d-flex gap-3">
                <button className="btn btn-outline-danger btn-lg ms-auto" type="button" onClick={handleReset}>
                    Reset
                </button>
                <button
                    className="btn btn-outline-success btn-lg"
                    onClick={handleSubmit(onSubmit)}
                >
                    Save
                </button>
            </div>
        </>
    );

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="container-fluid mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={usersOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Users</span>
                        <CgUserAdd className="text-white" size={40} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Add new, edit/update, delete and search for users. Update user permissions/authorities on the fly
                </span>
            </div>

            <div className="row justify-content-center">
                {/* Form Section */}

                <div
                    className="d-none d-md-block col-12 col-md-4 p-4 d-flex flex-column gap-3 bg-light shadow border rounded overflow-auto"

                >
                    {formComp()}
                </div>

                {/* Table Section */}
                <div className="col-12 col-md-7 p-3 shadow-sm border border-2 rounded-3 ms-1 overflow-md-auto" style={{ minHeight: "700px" }}>
                    <div className="border border rounded-3 p-1 bg-light my-3">
                        <Table id="myTable" className="rounded-2" striped hover responsive>
                            <thead>
                                <tr className="shadow-sm">
                                    <th>First Name</th>
                                    <th>Last</th>
                                    <th>Phone No.:</th>
                                    <th>Gender</th>
                                    <th>Role</th>
                                    <th>Username</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* <p>No content in table</p> */}
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <tr className='' key={index}>
                                        <td>Joy</td>
                                        <td>Samuel</td>
                                        <td>7012345678</td>
                                        <td>F</td>
                                        <td>Sales Assistant</td>
                                        <td>Joy</td>
                                        <td className='text-center'>
                                            <span className='fw-bold'>Active</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            {/*  */}
            <div className="d-md-none" style={myStyle}>
                <div variant="dark"
                    style={{ boxShadow: '4px 4px 4px #9E9E9E', maxWidth: '50px' }}
                    className="m-2 p-2 rounded bg-success text-white rounded-5 d-flex justify-content-center" onClick={handleShow}>
                    <CgMenuLeft size={"30px"} />
                </div>

            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>{formComp()}</Modal.Body>
            </Modal>
        </div>
    );
};

export default UsersWindow;
