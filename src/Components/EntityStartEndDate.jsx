import { Button, Col, Form, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Datetime from 'react-datetime';
import Select from 'react-select';

import { ThreeDotLoading } from './react-loading-indicators/Indicator';
import ErrorMessage from './ErrorMessage';

const EntityStartEndDateSearch = (props) => {
    const { fnSearch, networkRequest, entityOptions, entityLoading, entityString='Product' }  = props;

    const schema = object().shape({
        entity: object().required("Select one"),
        startDate: date(),
        endDate: date().min(ref("startDate"), "please update start date"),
    });
    
    const {
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema)
    });
    const startDate = watch("startDate");
    
    const onSubmit = (data) => {
        if (data.startDate && data.endDate && data.entity) {
            fnSearch(data);
        }
    };

    return (
        <div className="container row mx-auto my-3 p-4 rounded-4" style={{ boxShadow: "black 3px 2px 5px" }}>
            <Col className="col-md-3 col-12">
                <Form.Label className="fw-bold">Select {entityString}</Form.Label>
                <Controller
                    name="entity"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <Select
                            required
                            name="entity"
                            placeholder="Select..."
                            className="text-dark col-12"
                            isLoading={entityLoading}
                            options={entityOptions}
                            value={value}
                            onChange={ (val) => onChange(val) }
                        />
                    )}
                />
                <ErrorMessage source={errors.entity} />
            </Col>
            <div className="col-md-3 col-12 mb-3">
                <Form.Label className="fw-bold">Start Date</Form.Label>
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
                            value={field.value ? new Date(field.value) :  null}
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
            <div className="col-md-3 col-12 mb-3">
                <Form.Label className="fw-bold">End Date</Form.Label>
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
                            value={field.value ? new Date(field.value) :  null}
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
            <div className="col-md-3 col-12 mt-4">
                <Button className="w-100 mt-2" onClick={handleSubmit(onSubmit)} disabled={networkRequest}>
                    { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                    { (!networkRequest) && `Search` }
                </Button>
            </div>
        </div>
    )
}

export default EntityStartEndDateSearch;