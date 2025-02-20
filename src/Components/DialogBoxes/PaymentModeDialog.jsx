import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';

import ErrorMessage from '../ErrorMessage';

const PaymentModeDialog = ({ show, handleClose, handleConfirm }) => {
    const schema = yup.object().shape({
        cash: yup
            .number()
            .nullable()
            .min(0, 'Cash amount cannot be less than 0')
            .required("Cash amount must be at least 0"),
        transfer: yup
            .number()
            .min(0, 'Transfer amount cannot be less than 0')
            .nullable()
            .required("Transfer amount must be at least 0"),
        atm: yup
            .number()
            .nullable()
            .min(0, 'POS/ATM amount cannot be less than 0')
            .required("POS/ATM amount must be at least 0"),
    });

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			cash: 0,
			transfer: 0,
			atm: 0,
		}
	});
    
    const onSubmit = async (formData) => {
        handleConfirm(formData);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Payment Mode</Modal.Title>
            </Modal.Header>
            <Form>
                <Modal.Body>
                    <div className="d-flex flex-wrap">
                        <div className="col-6 p-2">
                            <div className="border p-3 rounded shadow-sm">
                                <label className="fw-bold">
                                    Cash
                                </label>
                                <Form.Control type="number" placeholder="Enter Amount" id="cash" {...register("cash")} />
                                <ErrorMessage source={errors.cash} />
                            </div>
                        </div>
                        <div className="col-6 p-2">
                            <div className="border p-3 rounded shadow-sm">
                                <label className="fw-bold">
                                    Transfer
                                </label>
                                <Form.Control type="number" placeholder="Enter Amount" id="transfer" {...register("transfer")} />
                                <ErrorMessage source={errors.transfer} />
                            </div>
                        </div>
                        <div className="col-6 p-2">
                            <div className="border p-3 rounded shadow-sm">
                                <label className="fw-bold">
                                    POS/ATM
                                </label>
                                <Form.Control type="number" placeholder="Enter Amount" id="atm" {...register("atm")}/>
                                <ErrorMessage source={errors.atm} />
                            </div>
                        </div>
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

export default PaymentModeDialog;