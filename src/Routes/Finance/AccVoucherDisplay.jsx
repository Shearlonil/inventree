import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuTicket } from "react-icons/lu";
import { FaReceipt } from "react-icons/fa";
import numeral from "numeral";
import { toast } from "react-toastify";
import { format, isAfter } from 'date-fns';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'

import OffcanvasMenu from "../../Components/OffcanvasMenu";
import useLedgerController from "../../Controllers/ledger-controller-hook";
import { Ledger } from "../../Entities/Ledger";
import VchCreationForm from "../../Components/Finance/VchCreationForm";
import TableMain from "../../Components/TableView/TableMain";
import ReactMenu from "../../Components/ReactMenu";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import handleErrMsg from '../../Utils/error-handler';
import InputDialog from "../../Components/DialogBoxes/InputDialog";
import { LedgerTransaction } from "../../Entities/LedgerTransaction";
import SingleDateSelectDialog from "../../Components/DialogBoxes/SingleDateSelectDialog";
import { OribitalLoading, ThreeDotLoading } from "../../Components/react-loading-indicators/Indicator";
import { clientDetails } from "../../../data";
import { useAuthUser } from "../../app-context/user-context";
import useFinanceController from "../../Controllers/finance-controller-hook";
import { positiveNumberMiscParamSchema } from "../../Utils/yup-schema-validator/input-validator";

const AcctVoucherDisplay = () => {
    applyPlugin(jsPDF);
    const controllerRef = useRef(new AbortController());

    const navigate = useNavigate();
    const location = useLocation();
    const { vch_id } = useParams();
    
    const { findLedgerVch, updateVoucherDate, updateVoucher, deleteLedgerVoucher } = useFinanceController();
    const { findAll } = useLedgerController();
    const { authUser } = useAuthUser();
    const user = authUser();
        
    const [networkRequest, setNetworkRequest] = useState(false);
        
    const [ledgerOptions, setLedgerOptions] = useState([]);
    const [ledgerArr, setLedgerArr] = useState([]);
    const [ledgerTransactions, setLedgerTransactions] = useState([]);

    const [entityToEdit, setEntityToEdit] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showSingleDateDialog, setShowSingleDateDialog] = useState(false);
    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);

    const [totalDrAmount, setTotalDrAmount] = useState(0);
    const [totalCrAmount, setTotalCrAmount] = useState(0);
    const [vchId, setVchId] = useState(vch_id);
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [tempDate, setTempDate] = useState(new Date());
    
    const [reportTitle, setReportTitle] = useState("");
    const [filename, setFilename] = useState("");

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'Edit', onClickParams: {evtName: 'edit' } },
    ];

	const vchOffCanvasMenu = [
        { label: "Search By No.", onClickParams: {evtName: 'findVchById'} },
		{ label: "Delete Voucher", onClickParams: {evtName: 'deleteVch'} },
		{ label: "Edit Voucher Date", onClickParams: {evtName: 'editVchDate'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
	];

    useEffect( () => {
        setVchId(vch_id);
        if(user.hasAuth('FINANCE') && user.hasAuth('ACCOUNTING_VOUCHERS')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
    }, [vch_id, location.pathname]);

    const initialize = async () => {
        try {
            positiveNumberMiscParamSchema.validateSync(vch_id);
        } catch (error) {
            toast.error(error.message);
            return;
        }
        try {
            setNetworkRequest(true);
            controllerRef.current = new AbortController();
            let response = await findAll(controllerRef.current.signal);

            const ledgerArr = [];
            if (response && response.data) {
                ledgerArr.push(...response.data);
                setLedgerArr(ledgerArr);
                setLedgerOptions(response.data.filter(datum => datum.status).map(datum => new Ledger(datum)).map(ledger => ({label: ledger.name, value: ledger})));
            }

            if(vch_id > 0){
                response = await findLedgerVch(vch_id, controllerRef.current.signal);
                const arr = [];
                if(response.data.length > 0){
                    setTransactionDate(new Date(response.data[0].date));
                }
                response.data.forEach(vchDetail => {
                    const transaction = new LedgerTransaction(vchDetail);
                    const ledger = ledgerArr.find(ledger => ledger.id === vchDetail.ledgerId);
                    transaction.ledgerName = ledger.name;
                    arr.push(transaction);
                });
                setLedgerTransactions(arr.sort((a, b) => a.id - b.id));
                calcTotalAmounts(arr);
            }

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    };

    const handleShowFormModal = () => setShowFormModal(true);

    const handleCloseModal = () => {
        setEntityToEdit(null);
        setShowFormModal(false);
        setShowConfirmModal(false);
		setShowInputModal(false);
    };

    const closeSingleDateDialog = () => setShowSingleDateDialog(false);

    const fnAdd = (data) => {
        data.date = transactionDate;
        // explicitly set dtoDateTime to avoid 1hr lag when sending to backend. Time will be set by Java on the backend, only date is important here.
        data.dtoDateTime = format(transactionDate, "yyyy-MM-dd") + "T12:00:00.000Z";
        const indexPos = ledgerTransactions.findIndex(i => i.ledgerId === data.ledgerId);
        if(indexPos > -1){
            //	replace old item found at index position in ledgerTransactions array with edited one
            ledgerTransactions.splice(indexPos, 1, data);
            setLedgerTransactions([...ledgerTransactions]);
            calcTotalAmounts(ledgerTransactions);
        }else {
            const temp = [...ledgerTransactions, data];
            setLedgerTransactions(temp);
            calcTotalAmounts(temp);
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'deleteVch':
				setDisplayMsg(`Delete Voucher No. ${vchId}`);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowConfirmModal(true);
                break;
            case 'findVchById':
				setDisplayMsg("Please enter Voucher No.");
				setShowInputModal(true);
                break;
            case 'editVchDate':
                if(vchId == 0){
                    toast.info('No voucher selected. Please perform search');
                    break;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowSingleDateDialog(true);
                break;
            case 'pdfExport':
                exportPDF();
                break;
        }
	}

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
                const indexPos = ledgerTransactions.findIndex(i => i.ledgerId === entity.ledgerId);
                if(indexPos > -1){
                    //	replace old item found at index position in ledgerTransactions array with edited one
                    ledgerTransactions.splice(indexPos, 1);
                    setLedgerTransactions([...ledgerTransactions]);
                }
                calcTotalAmounts(ledgerTransactions);
                break;
            case 'edit':
                setEntityToEdit(entity);
                setShowFormModal(true);
                break;
        }
    };
    
    const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName) {
            case 'deleteVch':
                delVch();                
                break;
            case "save":
                saveTransactions();
                break;
            case "cancel":
                setLedgerTransactions([]);
                calcTotalAmounts([]);
                break;
            case 'editVchDate':
                updateTransactionDate();
                break;
        }
    }
    
    const handleDateChanged = (date) => {
        //  if future date detected, throw error
        if(isAfter(date.startDate, new Date())){
            toast.error("Future date detected");
            return;
        }
        setTempDate(date.startDate);
        setDisplayMsg(`Update Voucher date to ${format(date.startDate, 'dd/MM/yyyy')}`);
        setShowConfirmModal(true);
    }

    const handleCancel = () => {
        if(ledgerTransactions.length === 0){
            return;
        }
        setDisplayMsg('Cancel transaction?');
        setConfirmDialogEvtName('cancel');
        setShowConfirmModal(true);
    };

    const handleSave = () => {
        if(ledgerTransactions.length === 0){
            return;
        }
        if(numeral(totalDrAmount).difference(totalCrAmount)){
            toast.error('Dr and Cr must balance');
            return;
        }
        setDisplayMsg('Save transaction?');
        setConfirmDialogEvtName('save');
        setShowConfirmModal(true);
    };

    const updateTransactionDate = async () => {
        try {
            setNetworkRequest(true);
            resetAbortController();
            // explicitly set dtoDateTime to avoid 1hr lag when sending to backend. Time will be set by Java on the backend, only date is important here.
            const date = new Date();
            let dtoDate = format(tempDate, "yyyy-MM-dd") + "T12:00:00.000Z";
            await updateVoucherDate(vchId, dtoDate, controllerRef.current.signal);
            setTransactionDate(tempDate);
            ledgerTransactions.forEach(lt => {
                lt.dtoDateTime = tempDate;
                lt.date = tempDate;
            });
            setLedgerTransactions(ledgerTransactions);

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    }

    const saveTransactions = async () => {
        try {
            setNetworkRequest(true);
            resetAbortController();
            await updateVoucher(vchId, ledgerTransactions, controllerRef.current.signal);

            setLedgerTransactions([]);
            calcTotalAmounts([]);

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    }

    const delVch = async () => {
        try {
            setNetworkRequest(true);
            resetAbortController();
            await deleteLedgerVoucher(vchId, controllerRef.current.signal);
			setLedgerTransactions([]);
            setTotalDrAmount(0);
            setTotalCrAmount(0);
            setVchId(0);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    }

	const idSearch = async (id) => {
        try {
            positiveNumberMiscParamSchema.validateSync(id);
        } catch (error) {
            toast.error(error.message);
            return;
        }
		try {
			setNetworkRequest(true);
            resetAbortController();
			setLedgerTransactions([]);
            setTotalDrAmount(0);
            setTotalCrAmount(0);

			setReportTitle(`Purchases Report with ID: ${id}`);
			setFilename(`Purchases Report with ID: ${id}`);
	
			const response = await findLedgerVch(id, controllerRef.current.signal);
            setVchId(id);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data) {
                const arr = [];
                response.data.forEach(vchDetail => {
                    const transaction = new LedgerTransaction(vchDetail);
                    const ledger = ledgerArr.find(ledger => ledger.id === vchDetail.ledgerId);
                    transaction.ledgerName = ledger.name;
                    arr.push(transaction);
                });
                setLedgerTransactions(arr.sort((a, b) => a.id - b.id));
                calcTotalAmounts(arr);
			}
			setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
		}
	}

    const exportPDF = () => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const fileExtension = ".pdf";

        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');

        const client = `${clientDetails.storeName}`;
        const title = `Accounting Voucher`;
        const xCoordinate = doc.internal.pageSize.width / 2; // Calculate the center of the page

        doc.text(client, xCoordinate, 40, { align: 'center' }); // 40 is the Y-coordinate
        doc.setFontSize(14);
        doc.text("Accounting Voucher", xCoordinate, 60, { align: 'center' }); // 60 is the Y-coordinate
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`No. ${vchId}`, xCoordinate, 75, { align: 'center' }); // 70 is the Y-coordinate

        doc.autoTable({
            styles: { theme: 'striped' },
            margin: { top: 80 },
            showHead: 'firstPage',
            body: ledgerTransactions,
            // head: [['Description', 'Debit', 'Credit']],
            columns: [
                { header: 'Ledger', dataKey: 'ledgerName' },
                { header: 'Description', dataKey: 'description' },
                { header: 'Debit', dataKey: 'drAmount' },
                { header: 'Credit', dataKey: 'crAmount' },
                { header: 'Date', dataKey: 'date' },
            ],
        });
            
        doc.save(`${title}` + fileExtension);
    }
        
    //  private helper function to calculate total debit and credit
    const calcTotalAmounts = (ledgerTransactions) => {
        let totalDr = numeral(0);
        let totalCr = numeral(0);
        ledgerTransactions.forEach(transaction => {
            totalDr = numeral(totalDr).add(numeral(transaction.drAmount).value());
            totalCr = numeral(totalCr).add(numeral(transaction.crAmount).value());
        });
        setTotalDrAmount(numeral(totalDr).value());
        setTotalCrAmount(numeral(totalCr).value());
    }
    
    const tableProps = {
        //	table header
        headers: ['Ledger', 'Description', 'Debit', 'Credit', 'Date', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['ledgerName', 'description', 'drAmount', 'crAmount', 'date'],
        //	React Menu
        menus: {
            ReactMenu,
            menuItems,
            menuItemClick: handleTableReactMenuItemClick,
        }
    };

    const resetAbortController = () => {
        // Cancel previous request if it exists
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
    };

    return (
        <div className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className={`${networkRequest ? 'disabledDiv' : ''}`}>
                    <OffcanvasMenu menuItems={vchOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Accounting Voucher View</span>
                        <FaReceipt className="text-white" size={"30px"} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Update, View and modify accounting Vouchers. <br />NOTE: This page requires both FINANCE AND ACCOUNTING VOUCHERS permissions
                </span>
                <span className='text-center m-1 h2'>
                    Voucher No.: {vchId > 0 ? vchId : "N/A"}
                </span>
            </div>
            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>
            <div className="container p-0">
                <div className="p-3 rounded-2 border shadow">
                    <div className="row m-1">
                        <div className="col-12 col-md-4 my-3">
                            <aside className="p-3 d-none d-md-block bg-light shadow-lg">
                                <VchCreationForm fnAdd={fnAdd} networkRequest={networkRequest} ledgerOptions={ledgerOptions} />
                            </aside>
                        </div>
                        <div className="col-12 col-md-8 border border rounded-3 p-1 bg-light my-3 shadow">
                            <TableMain tableProps={tableProps} tableData={ledgerTransactions} />
                        </div>
                    </div>
                    <div className="row m-1">
                        <span className="text-danger fw-bold">Date: {format(transactionDate, 'dd/MM/yyyy')}</span>
                    </div>
                </div>
                <div className="d-flex flex-end justify-content-end gap-5 p-3">
                    <div className="text-center">
                        <p className="fw-bold">Total Debit</p>
                        <h5> {numeral(totalDrAmount).format('₦0,0.00')} </h5>
                    </div>
                    <div className="text-center">
                        <p className="fw-bold">Total Credit</p>
                        <h5> {numeral(totalCrAmount).format('₦0,0.00')} </h5>
                    </div>
                </div>
                <div className="d-flex flex-end justify-content-end gap-3">
                    {/* <button className="btn btn-danger rounded-3 py-1" style={{ width: "7em" }} onClick={() => handleCancel()} >
                        Cancel
                    </button> */}
                    <button className="btn btn-success rounded-3 py-1" style={{ width: "14em" }} onClick={() => handleSave()} >
                        { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
					    { (!networkRequest) && `OK` }
                    </button>
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
            <div className="d-md-none" style={{ position: "fixed", bottom: "40px", right: "30px", cursor: "pointer", zIndex: 999}}>
                <div variant="dark"
                    style={{ boxShadow: '4px 4px 4px #9E9E9E', maxWidth: '50px' }}
                    className="m-2 p-2 rounded bg-success text-white rounded-5 d-flex justify-content-center" onClick={handleShowFormModal}>
                    <LuTicket className="text-white" size={'25px'} />
                </div>
            </div>
			<InputDialog
				show={showInputModal}
				handleClose={handleCloseModal}
				handleConfirm={idSearch}
				message={displayMsg}
			/>

            <SingleDateSelectDialog
                show={showSingleDateDialog}
                handleClose={closeSingleDateDialog}
                handleConfirm={handleDateChanged}
                message={"Update Voucher Transaction date"}
            />

            <Modal show={showFormModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Voucher Creation Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <VchCreationForm fnAdd={fnAdd} data={entityToEdit} networkRequest={networkRequest} ledgerOptions={ledgerOptions} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AcctVoucherDisplay;
