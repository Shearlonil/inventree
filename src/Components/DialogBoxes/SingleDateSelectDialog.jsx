import { Button, Form, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import ErrorMessage from '../ErrorMessage';
import { yupResolver } from '@hookform/resolvers/yup';
import Datetime from 'react-datetime';
import { object, date } from "yup";

const SingleDateSelectDialog = ({ show, handleClose, handleConfirm, message }) => {

	const schema = object().shape({
        startDate: date(),
	});

	const {
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

    const onSubmit = async (data) => {
        if (data.startDate) {            
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

export default SingleDateSelectDialog;