import React, { useEffect, useState } from 'react'
import { Modal, Button, Form } from "react-bootstrap";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import ErrorMessage from '../ErrorMessage';
import { editFormSchema } from '../../Utils/yup-schema-validator/dispensary-schema';
import { ThreeDotLoading } from '../react-loading-indicators/Indicator';

const DispensaryForm = (props) => {
	const { data, fnUpdate, show, networkRequest, handleClose }  = props;
            
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(editFormSchema),
    });
    
    useEffect( () => {
        if(data){
            setValue("quantity_val", data.qty);
            setValue("dispense_qty_type", data.qtyType);
        }
    }, [data]);
    
    const onSubmit = async (formData) => {
        const edited = {...data};
        edited.qty = formData.quantity_val;
        edited.qtyType = formData.dispense_qty_type;
        fnUpdate(edited);
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{data?.itemName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="d-flex flex-column gap-2">
                    <div className="col-12 mb-3">
                        <p className="h5 mb-2">Quantity:</p>
                        <input
                            type="number"
                            className="form-control mb-2"
                            placeholder="0"
                            {...register("quantity_val")}
                        />
                        <ErrorMessage source={errors.quantity_val} />
    
                        <div className="d-flex gap-3">
                            <Form.Check
                                type="radio"
                                label="Unit"
                                value="Unit"
                                {...register("dispense_qty_type")}
                                name="dispense_qty_type"
                            />
                            <Form.Check
                                type="radio"
                                label="Pkg"
                                value="Pkg"
                                {...register("dispense_qty_type")}
                                name="dispense_qty_type"
                            />
                        </div>
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

export default DispensaryForm;