import React, { useEffect } from 'react'
import { Form, Table } from "react-bootstrap";
import Select from "react-select";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import ErrorMessage from '../ErrorMessage';
import { LedgerTransaction } from '../../Entities/LedgerTransaction';
import numeral from 'numeral';

const VchCreationForm = (props) => {
	const { data, fnAdd, ledgerOptions, networkRequest }  = props;
        
    const schema = yup.object().shape({
        ledger: yup.object().required("Select a ledger"),
        description: yup.string().required("Input a description"),
        amount: yup.number().positive("Amount must be positive").required("Amount is required"),
        mode: yup.string().required("Select an option").oneOf(["dr", "cr"], "Invalid mode selected"),
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useForm({ 
        resolver: yupResolver(schema),
		defaultValues: {
			ledger: null,
			amount: 0,
			mode: null,
		},
    });
    
    useEffect( () => {
        if(data){
            const ledgerOption = ledgerOptions.find(option => option.value.id === data.ledgerId);
            setValue("ledger", ledgerOption);
            setValue("description", data.description);
            setValue("amount", Math.max(numeral(data.crAmount).value(), numeral(data.drAmount).value()));
            setValue("mode", numeral(data.crAmount).value() > 0 ? 'cr' : 'dr');
        }
    }, []);

	const onSubmit = (formData) => {
        if(data){
            //  update mode
            data.ledgerId = formData.ledger.value.id;
            data.ledgerName = formData.ledger.value.name;
            data.description = formData.description;
            if(formData.mode.toLowerCase() === 'dr'){
                data.drAmount = formData.amount;
            }else {
                data.crAmount = formData.amount;
            }
            fnAdd(data);
        }else {
            const transaction = new LedgerTransaction();
            transaction.ledgerId = formData.ledger.value.id;
            transaction.ledgerName = formData.ledger.value.name;
            transaction.description = formData.description;
            if(formData.mode.toLowerCase() === 'dr'){
                transaction.drAmount = formData.amount;
            }else {
                transaction.crAmount = formData.amount;
            }
            fnAdd(transaction);
        }
        reset();
	};

    return (
        <div className="d-flex flex-column gap-4">
            <span className="d-flex flex-column">
                <Form.Label className="fw-bold">Select ledger</Form.Label>
                <Controller
                    name="ledger"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <Select
                            required
                            name="ledger"
                            placeholder="Select..."
                            className="text-dark "
                            options={ledgerOptions}
                            isLoading={networkRequest}
                            onChange={(val) => onChange(val)}
                            value={value}
                        />
                    )}
                />

                <ErrorMessage source={errors.ledger} />
            </span>

            <span className="d-flex flex-column">
                <Form.Label className="fw-bold">Enter Description</Form.Label>
                <Form.Control
                    required
                    id="invoiceInput"
                    type="text"
                    placeholder="Description"
                    {...register("description")}
                />
                <ErrorMessage source={errors.description} />
            </span>

            <span className="d-flex flex-column">
                <Form.Label className="fw-bold">Enter Amount</Form.Label>
                <Form.Control
                    required
                    id="invoiceInput"
                    type="number"
                    placeholder="Amount"
                    {...register("amount")}
                />
                <ErrorMessage source={errors.amount} />
            </span>
            
            <Form.Group className="my-2">
                <div className="pe-3">
                    <div className="d-flex gap-5">
                        <Form.Check
                            className="py-3"
                            name="mode"
                            type="radio"
                            label="Debit"
                            value="dr"
                            {...register("mode")}
                        />
                        <Form.Check
                            className="py-3"
                            name="mode"
                            type="radio"
                            label="Credit"
                            value="cr"
                            {...register("mode")}
                        />
                    </div>
                    <ErrorMessage source={errors.mode} />
                </div>
            </Form.Group>
            <button
                className="btn btn-success rounded-1"
                onClick={handleSubmit(onSubmit)}
            >
                Next
            </button>
        </div>
    )
}

export default VchCreationForm;