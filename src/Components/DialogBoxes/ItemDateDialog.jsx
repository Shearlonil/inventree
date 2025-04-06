import React from 'react'
import { Button, Form, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import ErrorMessage from '../ErrorMessage';
import { yupResolver } from '@hookform/resolvers/yup';
import "react-datetime/css/react-datetime.css";
import Datetime from 'react-datetime';
import { object, date, ref } from "yup";

const DateDialog = ({ show, handleClose, handleConfirm, options, optionsLoading = false, message }) => {

	const schema = object().shape({
        startDate: date(),
        endDate: date().min(ref("startDate"), "please update start date"),
        select: yup.object().required("Select an option from the drop down"),
	});

	const {
		handleSubmit,
		control,
		setValue,
		watch,
        register,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const startDate = watch("startDate");
    
    const onSubmit = async (data) => {
        if (data.startDate && data.endDate) {
            data.startDate.setHours(0);
            data.startDate.setMinutes(0);
            data.startDate.setSeconds(0);
            
            data.endDate.setHours(23);
            data.endDate.setMinutes(59);
            data.endDate.setSeconds(59);
            
            handleConfirm(data);
            handleClose();
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{message}</Modal.Title>
            </Modal.Header>
            <Form>
                <Modal.Body>
                    <div className="d-flex flex-column gap-3">
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
                                        isLoading={optionsLoading}
                                        onChange={(val) => onChange(val)}
                                        value={value}
                                    />
                                )}
                            />

                            <ErrorMessage source={errors.select} />
                        </div>
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
                                        placeholder: "Choose start date",
                                        className: "form-control",
                                        readOnly: true, // Optional: makes input read-only
                                    }}
                                    onChange={(date) => {
                                        setValue("endDate", date.toDate());
                                        field.onChange(date ? date.toDate() : null);
                                    }}
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
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <Datetime
                                    {...field}
                                    timeFormat={false}
                                    closeOnSelect={true}
                                    dateFormat="DD/MM/YYYY"
                                    inputProps={{
                                        placeholder: "Choose end date",
                                        className: "form-control",
                                        readOnly: true, // Optional: makes input read-only
                                    }}
                                    onChange={(date) =>
                                        field.onChange(date ? date.toDate() : null)
                                    }
                                    isValidDate={(current) => {
                                        // Ensure end date is after start date
                                        return (
                                        !startDate || current.isSameOrAfter(startDate, "day")
                                        );
                                    }}
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
                        <ErrorMessage source={errors.endDate} />
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

export default DateDialog;