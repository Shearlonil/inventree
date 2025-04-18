import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { toast } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'

import SVG from '../../../assets/Svg';
import ErrorMessage from '../../../Components/ErrorMessage';
import { ThreeDotLoading } from '../../../Components/react-loading-indicators/Indicator';
import { useAuth } from '../../../app-context/auth-user-context';
import OffcanvasMenu from '../../../Components/OffcanvasMenu';
import DropDownDialog from '../../../Components/DialogBoxes/DropDownDialog';
import handleErrMsg from '../../../Utils/error-handler';
import genericController from '../../../Controllers/generic-controller';
import ledgerController from '../../../Controllers/ledger-controller';
import { Ledger } from '../../../Entities/Ledger';
import InputDialog from '../../../Components/DialogBoxes/InputDialog';
import { LedgerTransaction } from '../../../Entities/LedgerTransaction';
import ConfirmDialog from '../../../Components/DialogBoxes/ConfirmDialog';
import ToggleSwitch from '../../../Components/ToggleSwitch';

const LedgerDisplay = () => {
    const navigate = useNavigate();
    const { id } = useParams();
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();

	const schema = object().shape({
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

	const ledgerOffCanvasMenu = [
		// { label: "Select Ledger", onClickParams: {evtName: 'selectLedger'} },
		{ label: "Rename Ledger", onClickParams: {evtName: 'renameLedger'} },
		{ label: "Delete Ledger", onClickParams: {evtName: 'deleteLedger'} },
		{ label: "Remove Discount", onClickParams: {evtName: 'removeDiscount'} },
		{ label: "Adjust Discount", onClickParams: {evtName: 'adjustDiscount'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
		{ label: "Export to Excel", onClickParams: {evtName: 'xlsExport'} },
	];
      
    const [networkRequest, setNetworkRequest] = useState(false);
        
    const [showInputModal, setShowInputModal] = useState(false);
    const [displayMsg, setDisplayMsg] = useState("");
    const [dropDownMsg, setDropDownMsg] = useState("");
    const [inputStr, setInputStr] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState("");
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    
    const [ledger, setLedger] = useState({});
    const [ledgerParent, setLedgerParent] = useState({});
    const [transactions, setTransactions] = useState([]);

    //  for ledgers
    const [ledgerOptions, setLedgerOptions] = useState([]);
    const [ledgersLoading, setLedgersLoading] = useState(true);

    const [filename, setFilename] = useState("");
                
    useEffect( () => {
        if(user.hasAuth('FINANCE')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);
    
    const initialize = async () => {
        try {
            setNetworkRequest(true);
            const urls = [ `/api/ledgers/find/${id}`, `/api/ledgers/find/${id}/parent`, '/api/ledgers/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: ledgerRequest, 1: ledgerParentRequest, 2: activeLedgersRequest } = response;

            if (activeLedgersRequest && activeLedgersRequest.data && activeLedgersRequest.data.length > 0) {
				setLedgerOptions(activeLedgersRequest.data.map(ledger => ({label: ledger.name, value: ledger})));
                setLedgersLoading(false);
            }

            if (ledgerRequest && ledgerRequest.data) {
                const l = new Ledger(ledgerRequest.data);
                l.creator = ledgerRequest.data.creator.username;
                setLedger(l);
            }

            if (ledgerParentRequest && ledgerParentRequest.data) {
                setLedgerParent(ledgerParentRequest.data);
            }
            const startDate = new Date();
            startDate.setHours(0, 0, 0);
            const endDate = new Date();
            endDate.setHours(0, 0, 0);

            setFilename(`${ledger.name} ${startDate} - ${endDate}`);
    
            const dayTransactions = await ledgerController.ledgerTransactions(id, startDate.toISOString(), endDate.toISOString());
            if(dayTransactions && dayTransactions.data){
                setTransactions(dayTransactions.data.map(datum => new LedgerTransaction(datum)));
            }

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return initialize();
                }
                // Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                // display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                // if error while refreshing, logout and delete all cookies
                logout();
            }
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'deleteLedger':
                break;
            case 'selectLedger':
                setDropDownMsg("Select Ledger")
                setShowDropDownModal(true);
                break;
            case 'renameLedger':
                setDisplayMsg("Enter unique ledger name");
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
            case 'pdfExport':
                break;
            case 'xlsExport':
                if(transactions.length > 0){
                    exportToCSV();
                }
                break;
            case 'removeDiscount':
                setInputStr(0);
                setDisplayMsg(`Remove discount?`);
                setShowConfirmModal(true);
                break;
            case 'adjustDiscount':
                setDisplayMsg("Enter discount value in %");
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
        }
	}

    const handleCloseModal = () => {
        setShowInputModal(false);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
    };

	const handleLedgerSelected = async (ledger) => {
    };
    
    const handleInputOK = async (str) => {
        switch (confirmDialogEvtName) {
            case 'renameLedger':
                setInputStr(str);
                setDisplayMsg(`set new ledger name from ${ledger.name} to ${str}?`);
                setShowConfirmModal(true);
                break;
            case 'adjustDiscount':
                if(!+str){
                    toast.error('Please enter a valid number');
                    return;
                }
                setInputStr(str);
                setDisplayMsg(`Update discount to ${str}?`);
                setShowConfirmModal(true);
                break;
        }
    };
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'renameLedger':
				if(ledger.isDefault){
                    toast.error('Operation not allowed on default ledgers');
                    return;
                }
                renameLedger();
                break;
            case 'adjustDiscount':
				if(ledger.isDefault){
                    toast.error('Operation not allowed on default ledgers');
                    return;
                }
                updateDiscount();
                break;
            case 'removeDiscount':
				if(ledger.isDefault){
                    toast.error('Operation not allowed on default ledgers');
                    return;
                }
                updateDiscount();
                break;
        }
	}

    const renameLedger = async () => {
        try {
            setNetworkRequest(true);
            await ledgerController.rename(ledger.id, inputStr);
            const temp = new Ledger(ledger);
            temp.name = inputStr;
            temp.creator = ledger.creator;
            setLedger(temp);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return renameLedger();
                }
                // Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                // display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                // if error while refreshing, logout and delete all cookies
                logout();
            }
        }
    };

    const updateDiscount = async () => {
        try {
            setNetworkRequest(true);
            await ledgerController.setDiscount(ledger.id, inputStr);
            const temp = new Ledger(ledger);
            temp.discount = inputStr;
            temp.creator = ledger.creator;
            setLedger(temp);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return updateDiscount();
                }
                // Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                // display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                // if error while refreshing, logout and delete all cookies
                logout();
            }
        }
    };
    
    const exportToCSV = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const Heading = [ {date: "Date", description: "Description", ledgerVchId: "Voucher No.", drAmount: "DR", crAmount: "CR", balance: "Balance" } ];

        const temp = transactions.map(t => ({
            description: t.description, 
            drAmount: t.drAmount,
            ledgerVchId: t.ledgerVchId,
            balance: t.balance,
            crAmount: t.crAmount,
            date: t.date
        }));
        
        const wscols = [
            { wch: 20 },
            { wch: 40 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ["date", "description", "ledgerVchId", "drAmount", "crAmount", "balance"],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ["date", "description", "ledgerVchId", "drAmount", "crAmount", "balance"],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const exportPDF = () => {
        /*  ref:
            *   https://stackoverflow.com/questions/56752113/export-to-pdf-in-react-table
            *   https://www.npmjs.com/package/jspdf-autotable
            *   https://www.npmjs.com/package/jspdf */
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(15);

        const title = "Sales Summary";

        doc.text(title, marginLeft, 40);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Item Name', dataKey: 'itemName' },
                { header: 'Store Qty', dataKey: 'storeQty' },
                { header: 'Sales Qty', dataKey: 'salesQty' },
                { header: 'Total Qty', dataKey: 'totalQty' },
                { header: 'Qty Sold', dataKey: 'soldOutQty' },
            ],
        });
        
        doc.save(`${filename}` + fileExtension);
    }
        
    const onsubmit = async (data) => {
        try {
            if (data.startDate && data.endDate) {
                setNetworkRequest(true);
                data.startDate.setHours(0);
                data.startDate.setMinutes(0);
                data.startDate.setSeconds(0);
    
                data.endDate.setHours(23);
                data.endDate.setMinutes(59);
                data.endDate.setSeconds(59);

                setFilename(`${ledger.name} ${data.startDate} - ${data.endDate}`);
    
                const response = await ledgerController.ledgerTransactions(id, data.startDate.toISOString(), data.endDate.toISOString());
                if(response && response.data){
                    setTransactions(response.data.map(datum => new LedgerTransaction(datum)));
                }
                setNetworkRequest(false);
            }
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return onsubmit(data);
                }
                // Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                // display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                // if error while refreshing, logout and delete all cookies
                logout();
            }
        }
    }
    
        const toggle = async (checked, ledger) => {
            try {
                if(user.hasAuth('EDIT_lEDGER_CREDIT_SALES')){
                    await ledgerController.setAllowCreditSales(id, checked);
                }else {
                    toast.error("Forbidden. Your account doesn't support granting this permission. Please contact your supervisor");
                    throw new Error("Forbidden. Your account doesn't support granting this permission. Please contact your supervisor");
                }
            } catch (error) {
                //	Incase of 500 (Invalid Token received!), perform refresh
                try {
                    if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                        await handleRefresh();
                        return toggle(checked, auth);
                    }
                    // Incase of 401 Unauthorized, navigate to 404
                    if(error.response?.status === 401){
                        navigate('/404');
                    }
                    // display error message
                    toast.error(handleErrMsg(error).msg);
                } catch (error) {
                    // if error while refreshing, logout and delete all cookies
                    logout();
                }
                throw error;
            }
        };

    return (
        <div className='container my-4'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
				<div>
					<OffcanvasMenu menuItems={ledgerOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Account Ledger</span>
						<img src={SVG.ledger} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    View ledger properties, ledger transactions within specified date, Edit and Change Ledger status on the fly.
                    Please Note, this page requires FINANCE PERMISSION
                </span>
			</div>
            <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle my-4">
                <div className="row g-4"> {/* Adds gap between sections */}
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Name:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>{ledger?.name}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Creator:</span>
                            <span style={{overflow: 'scroll', textAlign: "right" }} className='pe-2 text-primary fw-bold'>{ledger?.creator}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Date:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                {ledger?.creationDate}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Discount:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                {ledger?.discount} %
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Parent:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>
                                <Link to={`/finance/groups/${ledgerParent.id}/view`}>
                                    {ledgerParent?.name}
                                </Link>
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Credit Sales:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                <ToggleSwitch
                                    data={ledger}
                                    checkedTxt="Granted" 
                                    unCheckedTxt="Revoked" 
                                    ticked={ledger.allowCreditSales ? true : false} 
                                    onChangeFn={toggle} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border py-4 px-5 bg-white-subtle rounded-4" style={{ boxShadow: "black 3px 2px 5px" }}>
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
            
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "700px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow" style={{ maxHeight: "750px", minHeight: "750px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Date</th>
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Vch No.</th>
                                <th className='text-danger'>Dr</th>
                                <th className='text-danger'>Cr</th>
                                <th className='text-danger'>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>{_datum.date}</td>
                                    <td>{_datum.description}</td>
                                    <td>{_datum.ledgerVchId}</td>
                                    <td>{_datum.drAmount}</td>
                                    <td>{_datum.crAmount}</td>
                                    <td>{_datum.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
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
                            <p className='fw-bold h5 text-primary'>Cr.:</p>
                            <h5><span>$680000</span></h5>
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
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={handleInputOK}
                message={displayMsg}
            />
			<ConfirmDialog
				show={showConfirmModal}
				handleClose={handleCloseConfirmModal}
				handleConfirm={handleConfirmOK}
				message={displayMsg}
			/>
        </div>
    );
};

export default LedgerDisplay;
