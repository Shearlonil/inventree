import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { CiEdit } from 'react-icons/ci';
import { IoWalletOutline } from 'react-icons/io5';
import { Table } from 'react-bootstrap';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { useAuth } from '../../app-context/auth-user-context';

const schema = yup.object().shape({
    vendor_name: yup.string().required("Vendor name is required"),
    phone_no: yup.string()
        .matches(/^\d{10,11}$/, "Invalid phone number")
        .required("Phone number is required"),
    address: yup.string().required("Address is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
});

const VendorsWindow = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    
    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

    const vendorsOffCanvasMenu = [
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Search By Card", onClickParams: {evtName: 'searchByCardNo'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
    ];
                
    useEffect( () => {
        if(user.hasAuth('CONTACTS_WINDOWS')){
        }else {
            toast.error("Account doesn't support viewing this page. Please contanct your supervisor");
            navigate('/404');
        }
    }, []);

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByName':
				setShowInputModal(true);
                break;
            case 'searchByCardNo':
				setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
            case 'trash':
                break;
        }
	}

    const onSubmit = (data) => {
        console.log(data);
        setValue("vendor_name", "");
        setValue("phone_no", "");
        setValue("address", "");
        setValue("email", "");
    };

    return (
        <div className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={vendorsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Vendors</span>
                        <img src={SVG.vendor_one_filled_white} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Vendors are your liabilities.
                    Add new, edit/update, search for Vendors.
                </span>
            </div>

            <div className="container row mx-auto my-3 p-3 rounded bg-light shadow border">
                <h4 className="mb-4 text-primary">Vendor ID:-</h4>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Vendor Name:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Vendor Name"
                        {...register("vendor_name")}
                    />
                    <small className="text-danger">{errors.vendor_name?.message}</small>
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
                                <th>Vendor Name</th>
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

export default VendorsWindow;