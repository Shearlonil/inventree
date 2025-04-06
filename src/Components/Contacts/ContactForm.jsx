import React, { useEffect, useState } from 'react'
import { Modal, Button, Form } from "react-bootstrap";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import ErrorMessage from '../ErrorMessage';
import { schema } from '../../Utils/yup-schema-validator/contact-schema';
import { ThreeDotLoading } from '../react-loading-indicators/Indicator';
import { Contact } from '../../Entities/Contact';

const ContactForm = (props) => {
	const { data, fnUpdate, show, networkRequest, handleClose }  = props;
            
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    
    useEffect( () => {
        if(data){
            setValue("name", data.name);
            setValue("phone_no", data.phoneNo);
            setValue("address", data.address);
            setValue("email", data.email);
        }
    }, [data]);
    
    const onSubmit = async (formData) => {
        const edited = new Contact(data);
        edited.name = formData.name;
        edited.phoneNo = formData.phone_no,
        edited.address = formData.address,
        edited.email = formData.email,
        
        fnUpdate(edited);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Update Contact</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="d-flex flex-column gap-3">
                    {/* Name */}
                    <div>
                        <label className="fw-bold">Name:</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            placeholder="Name"
                            {...register("name")}
                        />
                        <ErrorMessage source={errors.name} />
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
        
                    {/* Phone No */}
                    <div>
                        <label className="fw-bold">Address:</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            placeholder="Address"
                            {...register("address")}
                        />
                        <ErrorMessage source={errors.address} />
                    </div>

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
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose} disabled={networkRequest}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit(onSubmit)}>
                    { (networkRequest) && <ThreeDotLoading color="white" size="small" /> }
                    { (!networkRequest) && `Save` }
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ContactForm;