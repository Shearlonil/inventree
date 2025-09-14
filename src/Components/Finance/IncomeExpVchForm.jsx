import React, { useEffect } from 'react'
import { Form } from "react-bootstrap";
import Select from "react-select";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Datetime from 'react-datetime';
import numeral from 'numeral';
import { isAfter } from "date-fns";
import { toast } from 'react-toastify';

import { LedgerTransaction } from '../../Entities/LedgerTransaction';
import ErrorMessage from '../ErrorMessage';
import { ThreeDotLoading } from '../react-loading-indicators/Indicator';

const IncomeExpVchForm = (props) => {
    const { data, fnSave, ledgerOptions, networkRequest, mode }  = props;
        
    const schema = yup.object().shape({
        ledger: yup.object().required("Select a ledger"),
        description: yup.string().required("Input a description"),
        amount: yup.number().positive("Amount must be greater than 0").required("Amount is required"),
        startDate: yup.date(),
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
            description: '',
            startDate: new Date(),
        },
    });
    
    useEffect( () => {
        /*  added the refresh function in useEffect hook to eliminate possiblity of receiving an infinite loop.
            The refresh method is called from the parent component to refresh fields.
            ref:
            https://stackoverflow.com/questions/68642060/trigger-child-function-from-parent-component-using-react-hooks
            https://stackoverflow.com/questions/37949981/call-child-method-from-parent
        */
        refresh();
        if(data){
            const ledgerOption = ledgerOptions.find(option => option.value.id === data.ledgerId);
            setValue("ledger", ledgerOption);
            setValue("description", data.description);
            setValue("amount", Math.max(numeral(data.crAmount).value(), numeral(data.drAmount).value()));
            setValue("startDate", data.dtoDateTime);
        }else {
            setValue("startDate", new Date());
        }
    }, [props.refresh]);

    const onSubmit = (formData) => {
        //  if future date detected, throw error
        if(isAfter(formData.startDate, new Date())){
            toast.error("Future date detected");
            return;
        }
        const transaction = new LedgerTransaction();
        transaction.ledgerId = formData.ledger.value.id;
        transaction.ledgerName = formData.ledger.value.name;
        transaction.description = formData.description;
        transaction.date = formData.startDate;
        transaction.dtoDateTime = formData.startDate;
        if(mode === 1){
            //  Expenses always debited. Hence, cr for cash
            transaction.drAmount = formData.amount;
        }else {
            //  Income always credited. Hence, dr for cash
            transaction.crAmount = formData.amount;
        }
        if(data){
            //  update mode
            transaction.id = data.id;
            transaction.ledgerVchId = data.ledgerVchId;
        }
        fnSave(transaction);
    };

    const refresh = () => {
        reset();
        setValue("startDate", new Date());
    }

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
                <Form.Label className="fw-bold">Date</Form.Label>
                <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                        <Datetime
                            {...field}
                            timeFormat={false}
                            closeOnSelect={true}
                            dateFormat="DD/MM/YYYY"
                            inputProps={{
                                placeholder: "Choose date",
                                className: "form-control",
                                readOnly: true, // Optional: makes input read-only
                            }}
                            value={field.value ? new Date(field.value) :  null}
                            onChange={(date) => field.onChange(date ? date.toDate() : null) }
                            /*	react-hook-form is unable to reset the value in the Datetime component because of the below bug.
                                refs:
                                    *	https://stackoverflow.com/questions/46053202/how-to-clear-the-value-entered-in-react-datetime
                                    *	https://stackoverflow.com/questions/69536272/reactjs-clear-date-input-after-clicking-clear-button
                                there's clearly a rendering bug in component if you try to pass a null or empty value in controlled component mode: 
                                the internal input still got the former value entered with the calendar (uncontrolled ?) despite the fact that that.state.value
                                or field.value is null : I've been able to "patch" it with the renderInput prop :*/
                            renderInput={(props) => {
                                return <input {...props} value={field.value ? props.value : ''} />
                            }}
                        />
                    )}
                />
                <ErrorMessage source={errors.startDate} />
            </Form.Group>
            <button className="btn btn-success rounded-1" onClick={handleSubmit(onSubmit)} disabled={networkRequest}>
                { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                { (!networkRequest) && data === undefined ? "Save" : "Update"}
            </button>
        </div>
    )
}

export default IncomeExpVchForm;