import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ErrorMessage from '../ErrorMessage';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const InputDialog = ({ show, handleClose, handleConfirm, message }) => {
    const schema = yup.object().shape({
        input_value: yup.string().required("Please enter a value")
    });

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});
    
    const onSubmit = async (formData) => {
        handleConfirm(formData.input_value);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{message}</Modal.Title>
            </Modal.Header>
            <Form>
                <Modal.Body>
                    <div className="d-flex flex-column">
                        <Form.Control type="text" placeholder="Enter value" {...register("input_value")} />
                        <ErrorMessage source={errors.input_value} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit(onSubmit)}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default InputDialog;