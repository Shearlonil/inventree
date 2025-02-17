import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import SVG from '../assets/Svg';
import ErrorMessage from '../Components/ErrorMessage';
import { ThreeDotLoading } from '../Components/react-loading-indicators/Indicator';
import { useAuth } from '../app-context/auth-user-context';
import OffcanvasMenu from '../Components/OffcanvasMenu';
import DropDownDialog from '../Components/DialogBoxes/DropDownDialog';

const LedgerDisplay = () => {
    const navigate = useNavigate();
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();

	const schema = object().shape(
		{
			startDate: date(),
			endDate: date().min(ref("startDate"), "please update start date"),
		}
	);

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

	const dispensaryOffCanvasMenu = [
		{ label: "Select Ledger", onClickParams: {evtName: 'selectLedger'} },
		{ label: "Rename Ledger", onClickParams: {evtName: 'renameLedger'} },
		{ label: "Activate Ledger", onClickParams: {evtName: 'activateLedger'} },
		{ label: "Delete Ledger", onClickParams: {evtName: 'deleteLedger'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
	];
      
    const [networkRequest, setNetworkRequest] = useState(false);
        
    const [displayMsg, setDisplayMsg] = useState("");
    const [dropDownMsg, setDropDownMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState("");
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    
    //  for tracts
    const [ledgerOptions, setLedgerOptions] = useState([]);
    const [ledgersLoading, setLedgerssLoading] = useState(true);
                
    useEffect( () => {
        if(user.hasAuth('FINANCE')){
        }else {
            toast.error("Account doesn't support viewing this page. Please contanct your supervisor");
            navigate('/404');
        }
    }, []);

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'deleteLedger':
                break;
            case 'selectLedger':
                setDropDownMsg("Select Ledger")
                setShowDropDownModal(true);
                break;
            case 'renameLedger':
                break;
            case 'pdfExport':
                break;
            case 'activateLedger':
                break;
            case 'moveLedger':
                break;
        }
	}

    const handleCloseModal = () => {
        setShowConfirmModal(false);
        setShowDropDownModal(false);
    };

	const handleLedgerSelected = async (ledger) => {
    }

    return (
        <div className='container my-4'>
            {/* <h3 className="mb-4"><span>Ledger Summary</span></h3> */}
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
				<div>
					<OffcanvasMenu menuItems={dispensaryOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Accounting Ledgers</span>
						<img src={SVG.dispensary_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    View ledger properties, ledger transactions within specified date, Edit and Change Ledger status on the fly.
                    Please Note, this page requires FINANCE PERMISSION
                </span>
			</div>
            <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle my-4">
                <div className="row g-4"> {/* Adds gap between sections */}
                    {[
                        { label: "Name", value: "ELBE PHARMA LTD (LEKAN) ELBE PHARMA LTD (LEKAN) ELBE PHARMA LTD (LEKAN)" },
                        { label: "Creator", value: "pharmQAY" },
                        { label: "Date", value: "10-08-2022 09:35:32" },
                        { label: "Parent", value: "VENDORS" },
                        { label: "Status", value: "Active" }
                    ].map((item, index) => (
                        <div key={index} className="col-12 col-md-6">
                            <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                <span className="fw-bold text-md-end h5 me-2">{item.label}:</span>
                                <span>{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div
                className="border py-4 px-5 bg-white-subtle rounded-4"
                style={{ boxShadow: "black 3px 2px 5px" }}
            >
                <Row className="align-items-center">
                    <Col sm lg="4" className="mt-3 mt-md-0">
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
                    </Col>
                    <Col sm lg="4" className="mt-3 mt-md-0">
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
                    </Col>
                    <Col sm lg="3" className="align-self-end text-center mt-3">
                        <Button className="w-100" onClick={handleSubmit(onsubmit)} disabled={networkRequest}>
                            { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                            { (!networkRequest) && `Search` }
                        </Button>
                    </Col>
                </Row>
            </div>
            {/* <div className="bg-info-subtle shadow my-4 p-3 rounded-4">
                <h3 className="fw-bold h5">Date Range:</h3> <br />
                <div className=' d-flex flex-column flex-md-row gap-3 justify-content-center'>
                    <div className='p-3 rounded-4 w-100 bg-light'>
                        <p><span className='fw-bold'>Start</span>: Tue Nov 12:00:00:00 CAT 2024</p>
                    </div>
                    <div className='p-3 rounded-4 w-100 bg-light'>
                        <p><span className='fw-bold'>End</span>: Tue Nov 12:00:00:00 CAT 2024</p>
                    </div>
                </div>
            </div> */}
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "700px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow">
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th>First Name</th>
                                <th>Last</th>
                                <th>Phone No.:</th>
                                <th>Gender</th>
                                <th>Role</th>
                                <th>Username</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* <p>No content in table</p> */}
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr className='' key={index}>
                                    <td>Joy</td>
                                    <td>Samuel</td>
                                    <td>7012345678</td>
                                    <td>F</td>
                                    <td>Sales Assistant</td>
                                    <td>Joy</td>
                                    <td className='text-center'>
                                        <span className='fw-bold'>Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className='container my-3 p-3'>
                        <div className='d-flex flex-wrap gap-3 justify-content-between align-items-center mx-auto'>
                            <div className="">
                                <p className='fw-bold h5 text-success'>Balance:</p>
                                <h5><span>$680000</span></h5>
                            </div>
                            <div className="">
                                <p className='fw-bold h5 text-danger'>Dr.:</p>
                                <h5><span>$680000</span></h5>
                            </div>
                            <div className="">
                                <p className='fw-bold h5 text-warning'>Cr.:</p>
                                <h5><span>$680000</span></h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={handleLedgerSelected}
                message={dropDownMsg}
                optionsLoading={ledgersLoading}
                options={ledgerOptions}
            />
        </div>
    );
};

export default LedgerDisplay;
