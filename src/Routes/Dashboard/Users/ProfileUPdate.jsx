import React, { useEffect, useState } from "react";
import { Button, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import logo from "../../../assets/Img/logo.png";
import handleErrMsg from "../../../Utils/error-handler";
import ErrorMessage from "../../../Components/ErrorMessage";
import { useAuth } from "../../../app-context/auth-user-context";
import ConfirmDialog from "../../../Components/DialogBoxes/ConfirmDialog";
import { ThreeDotLoading } from "../../../Components/react-loading-indicators/Indicator";
import userController from "../../../Controllers/user-controller";
import { profile_update_schema } from '../../../Utils/yup-schema-validator/user-form-schema';

const ProfileUpdate = () => {
    const navigate = useNavigate();
    const { username } = useParams();
            
    const { handleRefresh, logout, authUser, updateJWT } = useAuth();
    const user = authUser();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(profile_update_schema),
        defaultValues: {
            fname: user.firstName,
            lname: user.lastName,
            phone_no: user.phoneNo,
            email: user.email,
            gender: user.sex,
            username: user.username,
        }
    });

    const [networkRequest, setNetworkRequest] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [displayMsg, setDisplayMsg] = useState("");
    const [formData, setFormData] = useState({});
    const [profile, setProfile] = useState(null);
    
    useEffect( () => {
        initialize();
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            const response = await userController.findByUsername(username);

            if (response && response.data) {
                setValue('phone_no', response.data.phoneNo);
                setValue('email', response.data.email);
                setProfile(response.data);
            }
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return initialize();
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
	};

    const handleOpenModal = () => {
        setDisplayMsg(`Update Profile?`);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleConfirmAction = async () => {
        setShowModal(false);
        setNetworkRequest(true);
        try {
            const response = await userController.updateProfile(formData);
            updateJWT(response);
            setNetworkRequest(false);
            toast.info("Profile update successful");
            navigate("/dashboard");
        } catch (error) {
            // Incase of 408 Timeout error (Token Expiration), perform refresh
            try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return handleConfirmAction();
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
            setNetworkRequest(false);
        }
    };

    const onSubmit = (data) => {
        //  attach a dummy password and level fields coz of UserDTO validation in the backend
        setFormData({
            password: '123456',
            level: 0,
            email: data.email,
            firstName: data.fname,
            lastName: data.lname,
            sex: data.gender,
            phoneNo: data.phone_no,
            username: data.username,
        });
        handleOpenModal();
    };

    //  Reset form on button click
    const handleReset = () => {
        setValue('fname', profile.firstName);
        setValue('lname', profile.lastName);
        setValue('phone_no', profile.phoneNo);
        setValue('email', profile.email);
        setValue('gender', profile.sex);
        setValue('username', profile.username);
    };

    return (
        <div className="justify-content-center d-flex flex-column" style={{minHeight: '70vh'}} >
            <div className="container py-md-3 py-3">
                <div className="text-center">
                    <img className="mb-2" src={logo} alt="" height="200" width={'50%'} />
                    <h2 className="fw-bold">
                        Update{" "}
                        <span className="text-primary" style={{ fontFamily: "Abril Fatface" }} >
                        Profile
                        </span>
                    </h2>
                </div>
                <Form className="d-flex justify-content-center">
                    <div className="bg-light p-4 rounded-4 border border-2">
                        <Row style={{ width: "20rem" }}>
                            {/* First Name */}
                            <Form.Group className="my-2 my-sm-3" controlId="fname">
                                <label className="fw-bold">First Name:</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    placeholder="First Name"
                                    {...register("fname")}
                                />
                                <ErrorMessage source={errors.fname} />
                            </Form.Group>

                            {/* Last Name */}
                            <Form.Group className="my-2 my-sm-3" controlId="lname">
                                <label className="fw-bold">Last Name:</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    placeholder="Last Name"
                                    {...register("lname")}
                                />
                                <ErrorMessage source={errors.lname} />
                            </Form.Group>

                            {/* Phone Number */}
                            <Form.Group className="my-2 my-sm-3" controlId="phone_no">
                                <label className="fw-bold">Phone Number:</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    placeholder="Phone Number"
                                    {...register("phone_no")}
                                />
                                <ErrorMessage source={errors.phone_no} />
                            </Form.Group>

                            {/* Email */}
                            <Form.Group className="my-2 my-sm-3" controlId="email">
                                <label className="fw-bold">E-mail:</label>
                                <input
                                    type="email"
                                    className="form-control mb-2 shadow-sm"
                                    placeholder="example@gmail.com"
                                    {...register("email")}
                                />
                                <ErrorMessage source={errors.email} />
                            </Form.Group>

                            {/* Gender */}
                            <Form.Group className="my-2 my-sm-3" controlId="gender">
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
                            </Form.Group>

                            {/* Username */}
                            <Form.Group className="my-2 my-sm-3" controlId="username">
                                <label className="fw-bold">User Name:</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    placeholder="User Name"
                                    {...register("username")}
                                />
                                <ErrorMessage source={errors.username} />
                            </Form.Group>

                            <div className='d-flex justify-content-center gap-3 my-2 my-sm-3'>
                                <Button variant="danger" onClick={handleReset} disabled={networkRequest} className='w-50'>
                                    Reset
                                </Button>
                                <Button variant="success" onClick={handleSubmit(onSubmit)} className='w-50'>
                                    { (networkRequest) && <ThreeDotLoading color="white" size="small" /> }
                                    { (!networkRequest) && `Save` }
                                </Button>
                            </div>
                        </Row>
                    </div>
                </Form>
            </div>
            <ConfirmDialog
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmAction}
                message={displayMsg}
            />
        </div>
    );
};

export default ProfileUpdate;