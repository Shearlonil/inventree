import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useLocation, useParams } from 'react-router-dom';
import numeral from 'numeral';

import ErrorMessage from '../../Components/ErrorMessage';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import DateDialog from '../../Components/DialogBoxes/DateDialog';
import handleErrMsg from '../../Utils/error-handler';
import useTransactionsController from '../../Controllers/transactions-controller-hook';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import TableMain from '../../Components/TableView/TableMain';
import { TransactionItem } from '../../Entities/TransactionItem';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import { Invoice } from '../../Entities/Invoice';
import { useAuthUser } from '../../app-context/user-context';
import { positiveNumberMiscParamSchema } from '../../Utils/yup-schema-validator/input-validator';

const InvoiceWindow = () => {
    const controllerRef = useRef(new AbortController());

    const location = useLocation();
    const { incomplete } = useParams();

    const { findInvoiceByNo, searchInvoicesByDate, activateInvoice, reverseInvoice, incompleteTrasactions } = useTransactionsController();
    const { authUser } = useAuthUser();
    const user = authUser();

    const { control, setValue, formState: { errors } } = useForm();

	const invoicesOffCanvasMenu = [
		{ label: "Search By Invoice No.", onClickParams: {evtName: 'searchByNo'} },
		{ label: "Search by Date", onClickParams: {evtName: 'searchByDate'} },
		{ label: "Activate Invoice", onClickParams: {evtName: 'activateInvoice'} },
		{ label: "Reverse Invoice", onClickParams: {evtName: 'reverseInvoice'} },
		{ label: "Incomplete Transactions", onClickParams: {evtName: 'incompleteTransactions'} },
	];
    
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Qty', 'Type', "Price (x1)", "Discount", "Amount"],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'qty', 'qtyType', 'itemSoldOutPrice', 'discount', 'totalAmount'],
    };

    const [networkRequest, setNetworkRequest] = useState(false);
    //	indicate where id search or date search, 0 => date search	|	1 => id search
    const [searchMode, setSearchMode] = useState(null);
    //	incase of id search, store in this state
    const [searchedId, setSearchedId] = useState(0);
    //	incase of date search, store in this state
    const [searchedDate, setSearchedDate] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [invoices, setInvoices] = useState([]);
    const [invoiceOptions, setInvoiceOptions] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [salesRecords, setSalesRecords] = useState([]);
    const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
    
    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    //	for date dialog
    const [showDateModal, setShowDateModal] = useState(false);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    
    useEffect( () => {
        if(!user.hasAuth('INVOICE_WINDOW')){
            toast.error("Account doesn't support viewing this page. Please contact your admin");
            navigate('/');
        }else {
            switch (incomplete) {
                case 'incomplete':
                    incompleteTransactions();
                default:
                    break;
            }
        }
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
    }, [location.pathname]);

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByNo':
				setDisplayMsg("Please enter Invoice No.");
				setShowInputModal(true);
                break;
            case 'incompleteTransactions':
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Find all active invoices without receipts?`);
				setShowConfirmModal(true);
                break;
            case 'searchByDate':
				setShowDateModal(true);
                break;
            case 'activateInvoice':
                if(!selectedInvoice){
                    toast.error("Please select an invoice");
                    return;
                }
                if(selectedInvoice.receiptId && selectedInvoice.receiptId > 0){
                    toast.info(`Invoice has a receipt with No. ${selectedInvoice.receiptId}. Please activate the receipt instead`);
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Activate invoice with No. ${selectedInvoice.id}`);
				setShowConfirmModal(true);
                break;
            case 'reverseInvoice':
                if(!selectedInvoice){
                    toast.error("Please select an invoice");
                    return;
                }
                if(selectedInvoice.receiptId && selectedInvoice.receiptId > 0){
                    toast.info(`Invoice has a receipt with No. ${selectedInvoice.receiptId}. Please reverse the receipt instead`);
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Reverse invoice with No. ${selectedInvoice.id}`);
				setShowConfirmModal(true);
                break;
        }
	}

	const handleCloseModal = () => {
		setShowInputModal(false);
		setShowConfirmModal(false);
        setShowDateModal(false);
	};
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'activateInvoice':
				fnActivateInvoice();
                break;
            case 'reverseInvoice':
				fnReverseInvoice();
                break;
            case 'incompleteTransactions':
                incompleteTransactions();
                break;
        }
	}

    //  Handle item selection change
    const handleInvoiceChange = (selectedInvoice) => {
        setSelectedInvoice(selectedInvoice.value);
        setSalesRecords(buildTableData(selectedInvoice.value.dtoSalesRecords));
    };

    //  Handle item selection clicked from table
    const handleInvoiceClicked = (selectedInvoice) => {
        setValue('invoice_no', {label: selectedInvoice.id, value: selectedInvoice});
        setSelectedInvoice(selectedInvoice);
        setSalesRecords(buildTableData(selectedInvoice.dtoSalesRecords));
    };

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
			setInvoices([]);
            setSalesRecords([]);
			setSearchMode(1);
            setTotalTransactionAmount(0);
            setSelectedInvoice(null);
            setStartDate(null);
            setEndDate(null);

			setSearchedId(id);
			setSearchedDate(null);
			setValue('startDate', null);
			setValue('endDate', null);
	
			const response = await findInvoiceByNo(id, controllerRef.current.signal);
            if(response && response.data){
                const tableArr = [];
                response.data.forEach(res => tableArr.push(new Invoice(res)));
                tableArr.sort((a, b) => a.id - b.id);
                response.data.sort((a, b) => a.id - b.id);
                setInvoices(tableArr);
                setInvoiceOptions(tableArr.map( invoice => ({label: invoice.id, value: invoice})));
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
	
	const dateSearch = async (date) => {
        /*  Setting start date to 1 instead of 0 to avoid story that touch (1 hour lag from front end, causing a previous date with 23 hour). Time
            isn't important here from front end as the time will be set by Java on the backend. Only date is important  */
        try {
			if (date.startDate && date.endDate) {
                const startDate = format(date.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(date.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                resetAbortController();
                setStartDate(startDate);
                setEndDate(endDate);
				setNetworkRequest(true);
                setTotalTransactionAmount(0);
                setInvoices([]);
                setSalesRecords([]);
                setSelectedInvoice(null);
				setSearchedId(0);
                setSearchMode(0);
				setSearchedDate(date);
                
				const response = await searchInvoicesByDate(startDate, endDate, controllerRef.current.signal);
				if(response && response.data){
                    const tableArr = [];
                    response.data.forEach(res => tableArr.push(new Invoice(res)));
                    tableArr.sort((a, b) => a.id - b.id);
                    response.data.sort((a, b) => a.id - b.id);
                    setInvoices(tableArr);
                    setInvoiceOptions(tableArr.map( invoice => ({label: invoice.id, value: invoice})));
				}
				setNetworkRequest(false);
			}
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
	
	const fnActivateInvoice = async () => {
        try {
            setNetworkRequest(true);
            resetAbortController();
            const response = await activateInvoice(selectedInvoice.id, controllerRef.current.signal);
            if(response && response.status === 200){
                selectedInvoice.reversalStatus = false;
                setSelectedInvoice(selectedInvoice);
                toast.info('activated');
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
	
	const fnReverseInvoice = async () => {
        try {
            setNetworkRequest(true);
            resetAbortController();
            const response = await reverseInvoice(selectedInvoice.id, controllerRef.current.signal);
            if(response && response.status === 200){
                selectedInvoice.reversalStatus = true;
                setSelectedInvoice(selectedInvoice);
                toast.info('reversed');
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
	
	const incompleteTransactions = async () => {
        try {
            setNetworkRequest(true);
            resetAbortController();
            const response = await incompleteTrasactions(controllerRef.current.signal);
            if(response && response.data){
                const tableArr = [];
                response.data.forEach(res => tableArr.push(new Invoice(res)));
                tableArr.sort((a, b) => a.id - b.id);
                response.data.sort((a, b) => a.id - b.id);
                setInvoices(tableArr);
                setInvoiceOptions(tableArr.map( invoice => ({label: invoice.id, value: invoice})));
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
            
    //	setup table data from fetched stock record
    const buildTableData = (arr = []) => {
        const tableArr = [];
        arr.forEach(item => {
            const dtoItem = new TransactionItem();
            dtoItem.id = item.id;
            dtoItem.itemSoldOutPrice = item.itemSoldOutPrice;
            dtoItem.itemName = item.name;
            dtoItem.qty = item.qty;
            dtoItem.qtyType = item.qtyType;
            dtoItem.discount = item.discount ? item.discount : '0';

            tableArr.push(dtoItem);
        });
        setTotalTransactionAmount(tableArr.reduce( (accumulator, currentVal) => numeral(currentVal.totalAmount).add(accumulator).value(), 0));
        return tableArr;
    };

    const resetAbortController = () => {
        // Cancel previous request if it exists
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
    };

    return (
        <div>
            <div className={`container-fluid`}>
                <div className="d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                    <div className={`${networkRequest ? 'disabledDiv' : ''}`}>
                        <OffcanvasMenu menuItems={invoicesOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
                    </div>
                    <div className="text-center d-flex">
                        <h2 className="display-6 p-3 mb-0">
                            <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Invoices</span>
                            <img src={SVG.invoice_coloured} style={{ width: "50px", height: "50px" }} />
                        </h2>
                    </div>
                    <p className='text-center m-2'>Search invoices by date or number to view, update, delete etc</p>
                </div>
                <div className="justify-content-center d-flex">
                    {networkRequest && <OribitalLoading color='red' />}
                </div>
                <div className={`row justify-content-center ${networkRequest ? 'disabledDiv' : ''}`} id='user-window'>
                    {/* INvoices drop down.... ONLY SHOW ON MOBILE */}
                    <div className="d-md-none mb-3">
                        <p className="h5 mb-2">Invoice No.: </p>
                        <Controller
                            name="invoice_no"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    required
                                    placeholder="Select..."
                                    className="text-dark"
                                    options={invoiceOptions}
									value={value}
                                    onChange={(val) => {
										onChange(val);
										handleInvoiceChange(val);
									}}
                                />
                            )}
                        />
                        <ErrorMessage source={errors.invoice_no} />
                    </div>

                    <div className="d-none d-md-block col-12 col-md-2 p-4 d-flex flex-column gap-2 rounded bg-light shadow-sm border overflow-md-auto border" style={{ maxHeight: "100vh", overflow: 'scroll' }}>
                        <h4 className='mb-3'>Invoice ID:-</h4>
                        <Table id="myTable" className="rounded-2" hover responsive>
                            <tbody>
                                {/* <tr> */}
                                {invoices.map((invoice, index) => (
                                    <tr className='' key={index} onClick={() => handleInvoiceClicked(invoice)}>
                                        <td>{invoice.id}</td>
                                    </tr>
                                ))}
                                {/* </tr> */}
                            </tbody>
                        </Table>
                        {/*  */}

                    </div>

                    <div className="col-12 col-md-9 p-3 shadow-sm border border-2 rounded-3 ms-1 overflow-md-auto">
                        <div className="shadow p-4 border border-light rounded-3 bg-success-subtle">
                            <h4>Invoice Details:- </h4>
                            <div className="row g-4"> {/* Adds gap between sections */}
                                <div className="col-12 col-md-6">
                                    <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5">ID:</span>
                                        <span className='pe-2 text-danger fw-bold'>{selectedInvoice?.id}</span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5">Creator:</span>
                                        <span className='pe-2 text-primary fw-bold'>{selectedInvoice?.username}</span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5">Date:</span>
                                        <span className='pe-2 text-primary fw-bold'>
                                            {selectedInvoice?.transactionDate ? format(selectedInvoice?.transactionDate, 'dd/MM/yyyy HH:mm:ss') : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5">Discount:</span>
                                        <span className='pe-2 text-primary fw-bold'>{selectedInvoice?.invoiceDiscount ? selectedInvoice.invoiceDiscount : 0}</span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Status:</span>
                                        <span className={`pe-2 fw-bold ${selectedInvoice?.reversalStatus ? 'text-danger' : 'text-primary'}`}>
                                            {selectedInvoice?.reversalStatus ? 'REVERSED' : "ACTIVE"}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Receipt Id:</span>
                                        <span className='pe-2 text-primary fw-bold'>
                                            {/* TODO: Make a link and navigate to receipt page when clicked */}
                                            {selectedInvoice?.receiptId}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Outpost:</span>
                                        <span className='pe-2 text-primary fw-bold'>
                                            {selectedInvoice?.outpostName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2 border mt-4">
                            <div style={{maxHeight: '400px', minHeight: '400px', overflow: 'scroll'}}>
                                <TableMain tableProps={tableProps} tableData={salesRecords} />
                            </div>
                        </div>
                        <div className='pe-2 fw-bold h3 mt-5'>
                            Total (₦): <span className='h3 text-danger fw-bold'>{numeral(totalTransactionAmount).format('₦0,0.00')}</span> 
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
            <DateDialog
                show={showDateModal}
                handleClose={handleCloseModal}
                handleConfirm={dateSearch}
                message={"Select date range"}
            />
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={idSearch}
                message={displayMsg}
            />
        </div>
    )
}

export default InvoiceWindow;