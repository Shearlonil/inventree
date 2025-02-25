import React, { useState } from "react";
import { Button, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/Img/logo.png";
import handleErrMsg from "../../../Utils/error-handler";
import ErrorMessage from "../../../Components/ErrorMessage";
import { useAuth } from "../../../app-context/auth-user-context";
import ConfirmDialog from "../../../Components/DialogBoxes/ConfirmDialog";
import { ThreeDotLoading } from "../../../Components/react-loading-indicators/Indicator";
import userController from "../../../Controllers/user-controller";

const ChangePassword = () => {
    const navigate = useNavigate();

    const { handleRefresh, logout } = useAuth();

    const schema = yup.object().shape({
        current_pw: yup
            .string()
            .min(6, "Password must be a minimum of 6 characters")
            .required("Password is required!"),
        new_pw: yup
            .string()
            .min(6, "New password must be a minimum of 6 characters")
            .required("Password is required!"),
        confirm_new_pw: yup
            .string()
            .oneOf([yup.ref("new_pw"), null], "Passwords must match")
            .required("Confirm Password is required"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const [networkRequest, setNetworkRequest] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [displayMsg, setDisplayMsg] = useState("");
    const [formData, setFormData] = useState({});

    const handleOpenModal = () => {
        setDisplayMsg(`Set new Password?`);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleConfirmAction = async () => {
        setShowModal(false);
        setNetworkRequest(true);
        try {
            await userController.updatePassword(formData.new_pw, formData.confirm_new_pw, formData.current_pw);
            setNetworkRequest(false);
            toast.info("Password update successful");
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
        setFormData(data);
        handleOpenModal();
    };

    return (
        <div className="justify-content-center d-flex flex-column" style={{minHeight: '70vh'}} >
            <div className="container py-md-3 py-3">
                <div className="text-center">
                    <img className="mb-2" src={logo} alt="" height="200" width={'50%'} />
                    <h2 className="fw-bold">
                        Change{" "}
                        <span className="text-primary" style={{ fontFamily: "Abril Fatface" }} >
                        Password
                        </span>
                    </h2>
                </div>
                <Form className="d-flex justify-content-center">
                    <div className="bg-light p-4 rounded-4 border border-2">
                        <Row style={{ width: "20rem" }}>
                            <Form.Group className="my-2 my-sm-3" controlId="current_pw">
                                <Form.Label>Current Password</Form.Label>
                                <Form.Control
                                    className="w-100"
                                    required
                                    size="lg"
                                    type="password"
                                    placeholder="Password..."
                                    {...register("current_pw")}
                                />
                                <ErrorMessage source={errors.current_pw} />
                            </Form.Group>

                            <Form.Group className="my-2 my-sm-3" controlId="new_pw">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    className="w-100"
                                    required
                                    size="lg"
                                    type="password"
                                    placeholder="Password..."
                                    {...register("new_pw")}
                                />
                                <ErrorMessage source={errors.new_pw} />
                            </Form.Group>

                            <Form.Group className="my-2 my-sm-3" controlId="confirm_new_pw">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control
                                    className="w-100"
                                    type="password"
                                    size="lg"
                                    placeholder="Confirm Password..."
                                    {...register("confirm_new_pw")}
                                />
                                <ErrorMessage source={errors.confirm_new_pw} />
                            </Form.Group>
                        </Row>
                        <div className="text-center">
                            <Button
                                variant="success"
                                type="submit"
                                onClick={handleSubmit(onSubmit)}
                                disabled={networkRequest}
                            >
                                {networkRequest && <ThreeDotLoading color={"#ffffff"} />}
                                {!networkRequest && "Update Password"}
                            </Button>
                        </div>
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

export default ChangePassword;
