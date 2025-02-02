import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import ErrorMessage from '../ErrorMessage';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const DropDownDialog = ({ show, handleClose, handleConfirm, options, message }) => {
    const schema = yup.object().shape({
        select: yup.object().required("Select an option from the drop down")
    });

	const {
		handleSubmit,
		control,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});
    
    const onSubmit = async (formData) => {
        handleConfirm(formData.select.value);
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
                        <Controller
                            name="select"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    required
                                    name="select"
                                    placeholder="Select..."
                                    className="text-dark w-100"
                                    options={options}
                                    onChange={(val) => onChange(val)}
                                    value={value}
                                />
                            )}
                        />

                        <ErrorMessage source={errors.select} />
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

export default DropDownDialog;