import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { format, isAfter } from 'date-fns';
import numeral from 'numeral';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable'

import ErrorMessage from '../../Components/ErrorMessage';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import DateDialog from '../../Components/DialogBoxes/DateDialog';
import handleErrMsg from '../../Utils/error-handler';
import { useAuth } from '../../app-context/auth-user-context';
import transactionsController from '../../Controllers/transactions-controller';
import genericController from '../../Controllers/generic-controller';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import { Receipt } from '../../Entities/Receipt';
import TableMain from '../../Components/TableView/TableMain';
import { TransactionItem } from '../../Entities/TransactionItem';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import PaymentModeDialog from '../../Components/DialogBoxes/PaymentModeDialog';
import { ReceiptSummary } from '../../Entities/DocExport/ReceiptSummary';
import printerController from '../../Controllers/printer-controller';
import { clientDetails } from '../../../data';
import EntityDateDialog from '../../Components/DialogBoxes/EntityDateDialog';
import User from '../../Entities/User';
import { Contact } from '../../Entities/Contact';
import SingleDateSelectDialog from '../../Components/DialogBoxes/SingleDateSelectDialog';
import { Outpost } from '../../Entities/Outpost';

const SalesReceiptWindow = () => {
    applyPlugin(jsPDF);
    const navigate = useNavigate();
    const { receipt_id } = useParams();

    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const { control, setValue, formState: { errors } } = useForm();

	const receiptsOffCanvasMenu = [
		{ label: "Search By Receipt No.", onClickParams: {evtName: 'searchByNo'} },
		{ label: "Search by Date", onClickParams: {evtName: 'searchByDate'} },
		{ label: "Search by Customer", onClickParams: {evtName: 'searchByCustomer'} },
		{ label: "Search by User", onClickParams: {evtName: 'searchByUser'} },
		{ label: "Search by Outpost", onClickParams: {evtName: 'searchByOutpost'} },
		{ label: "Activate Receipt", onClickParams: {evtName: 'activateReceipt'} },
		{ label: "Reverse Receipt", onClickParams: {evtName: 'reverseReceipt'} },
		{ label: "Adjust Receipt Date", onClickParams: {evtName: 'adjustReceiptDate'} },
		{ label: "Reprint", onClickParams: {evtName: 'reprint'} },
		{ label: "Download Receipt", onClickParams: {evtName: 'download'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
	];
    
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Qty', 'Type', "Price (x1)", "Discount", "Amount"],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['name', 'qty', 'qtyType', 'itemSoldOutPrice', 'discount', 'totalAmount'],
    };

    const [networkRequest, setNetworkRequest] = useState(false);
    //	indicate where id search or date search, 0 => date search	|	1 => id search  |   2 => entity date search
    const [searchMode, setSearchMode] = useState(null);
    //	incase of id search, store in this state
    const [searchedId, setSearchedId] = useState(0);
    //	incase of date search, store in this state
    const [searchedDate, setSearchedDate] = useState(null);
    //	incase of entity date search, store in this state
    const [searchedEntityData, setSearchedEntityData] = useState(null);
    const [searchedEntity, setSearchedEntity] = useState("");

    const [receipts, setReceipts] = useState([]);
    const [receiptOptions, setReceiptOptions] = useState([]);
    const [entityOptions, setEntityOptions] = useState([]);
    const [users, setUsers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [outposts, setOutposts] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [salesRecords, setSalesRecords] = useState([]);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
    const [tempDate, setTempDate] = useState(new Date());
    
    const [filename, setFilename] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    //	for payment dialog
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    //	for date dialog
    const [showDateModal, setShowDateModal] = useState(false);
    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    //  for entity dialog (users and customers)
    const [showEntityModal, setShowEntityModal] = useState(false);
    const [entityLoading, setEntityLoading] = useState(true);
    const [showSingleDateDialog, setShowSingleDateDialog] = useState(false);
    
    useEffect( () => {
        if(!user.hasAuth('RECEIPT_WINDOW')){
            toast.error("Account doesn't support viewing this page. Please contact your admin");
            navigate('/404');
        }
        initialize();
    }, []);
    
    const initialize = async () => {
        try {
            setNetworkRequest(true);
            const urls = [ `/api/users/active`, `/api/customers/active`, `/api/outposts/active` ];
            const response = await genericController.performGetRequests(urls);
            const { 0: usersRequest, 1: customersRequest, 2: outpostRequest } = response;
            
            if (usersRequest && usersRequest.data && usersRequest.data.length > 0) {
                const arr = [];
                usersRequest.data.filter(datum => {
                    if(datum.username.toLowerCase() === 'inventree'){
                        return false;
                    }
                    return true;
                }).forEach( user => {
                    const u = new User();
                    //  u.id = user.id;
                    u.username = user.username;
                    u.firstName = user.firstName;
                    u.lastName = user.lastName;
                    u.sex = user.sex;
                    u.phoneNo = user.phoneNo;
                    u.email = user.email;
                    u.regDate = user.dateOfReg;
                    switch (user.level) {
                        case 1:
                            u.level = 'Admin';
                            break;
                        case 2:
                            u.level = 'Supervisor';
                            break;
                        case 3:
                            u.level = 'Sales Assistant';
                            break;
                    }
                    arr.push(u);
                } );
                setUsers(arr.map(user => ({label: user.username, value: user})));
            }

            if (customersRequest && customersRequest.data) {
                const arr = [];
                customersRequest.data.forEach( customer => arr.push(new Contact(customer)) );
                setCustomers(arr.map(customer => ({label: customer.name, value: customer})));
            }

            if (outpostRequest && outpostRequest.data) {
                const arr = [];
                outpostRequest.data.forEach( outpost => arr.push(new Outpost(outpost)) );
                setOutposts(arr.map(outpost => ({label: outpost.name, value: outpost})));
            }

            if(receipt_id){
                idSearch(receipt_id);
            }

            setEntityLoading(false);
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
            case 'searchByNo':
				setDisplayMsg("Please enter Receipt No.");
				setShowInputModal(true);
                break;
            case 'exportToPDF':
                pdfExport();
                break;
            case 'searchByDate':
				setShowDateModal(true);
                break;
            case 'adjustReceiptDate':
                if(!selectedReceipt){
                    toast.error("Please select a receipt");
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowSingleDateDialog(true);
                break;
            case 'activateReceipt':
                if(!selectedReceipt){
                    toast.error("Please select a receipt");
                    return;
                }
                if(selectedReceipt.reversalStatus === false){
                    toast.info("Receipt is active");
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowPaymentModal(true);
                break;
            case 'reverseReceipt':
                if(!selectedReceipt){
                    toast.error("Please select a receipt");
                    return;
                }
                if(selectedReceipt.reversalStatus === true){
                    toast.info("Receipt is already reversed");
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Reverse receipt with No. ${selectedReceipt.id}`);
				setShowConfirmModal(true);
                break;
            case 'reprint':
                if(!selectedReceipt){
                    toast.error("Please select a receipt");
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Reprint receipt with No. ${selectedReceipt.id}`);
				setShowConfirmModal(true);
                break;
            case 'download':
                if(!selectedReceipt){
                    toast.error("Please select a receipt");
                    return;
                }
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Download receipt with No. ${selectedReceipt.id}`);
				setShowConfirmModal(true);
                break;
            case 'searchByCustomer':
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Select customer`);
				setShowEntityModal(true);
                setEntityOptions(customers);
                break;
            case 'searchByUser':
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Select user`);
				setShowEntityModal(true);
                setEntityOptions(users);
                break;
            case 'searchByOutpost':
                setConfirmDialogEvtName(onclickParams.evtName);
				setDisplayMsg(`Select outpost`);
				setShowEntityModal(true);
                setEntityOptions(outposts);
                break;
        }
	}

	const handleCloseModal = () => {
		setShowDateModal(false);
		setShowInputModal(false);
		setShowConfirmModal(false);
        setShowEntityModal(false);
	};

	const handleClosePaymentModal = () => {
		setShowPaymentModal(false);
	};

    const closeSingleDateDialog = () => setShowSingleDateDialog(false);
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'activateReceipt':
                if(!user.hasAuth('REVERSAL')){
                    toast.error("Account doesn't support this feature. Please contact your admin");
                    return;
                }
				activateReceipt();
                break;
            case 'reverseReceipt':
                if(!user.hasAuth('REVERSAL')){
                    toast.error("Account doesn't support this feature. Please contact your admin");
                    return;
                }
				reverseReceipt();
                break;
            case 'reprint':
				reprint();
                break;
            case 'download':
				download();
                break;
            case 'adjustReceiptDate':
                updateTransactionDate();
                break;
        }
	}

    //  Handle item selection change
    const handleReceiptChange = (selectedReceipt) => {
        setSelectedReceipt(selectedReceipt.value);
        setSelectedInvoice(selectedReceipt.value.dtoInvoice);
        setSalesRecords(buildTableData(selectedReceipt.value, selectedReceipt.value.dtoInvoice));
    };

    //  Handle item selection clicked from table
    const handleReceiptClicked = (selectedReceipt) => {
        setValue('receipt_no', {label: selectedReceipt.id, value: selectedReceipt});
        setSelectedReceipt(selectedReceipt);
        setSelectedInvoice(selectedReceipt.dtoInvoice);
        setSalesRecords(buildTableData(selectedReceipt, selectedReceipt.dtoInvoice));
    };
        
    const handleDateChanged = (date) => {
        //  if future date detected, throw error
        if(isAfter(date.startDate, new Date())){
            toast.error("Future date detected");
            return;
        }
        setTempDate(date.startDate);
        setDisplayMsg(`Update Receipt date with id ${selectedReceipt.id} to ${format(date.startDate, 'dd/MM/yyyy')}`);
        setShowConfirmModal(true);
    }

    const paymentModeSet = (payments) => {
        const paymentModes = [];
		if(payments.atm){
			paymentModes.push({
				type: 'POS/DEBIT-CARD',
				amount: payments.atm
			})
		}
		if(payments.transfer){
			paymentModes.push({
				type: 'TRANSFER',
				amount: payments.transfer
			})
		}
		if(payments.cash){
			paymentModes.push({
				type: 'CASH',
				amount: payments.cash
			})
		}

		//	if none of the above, then wallet/ledger/credit-sales payment mode
		if(paymentModes.length === 0){
			paymentModes.push({
				type: 'WALLET',
				amount: totalTransactionAmount
			})
		}
        
        selectedReceipt.paymentModes = paymentModes;
        setSelectedReceipt(selectedReceipt);
        setDisplayMsg(`Activate receipt with No. ${selectedReceipt.id} with the following payment mode: ${selectedReceipt?.paymentModes.map(pm => pm.type + " = " + pm.amount + " ")}`);
		setShowConfirmModal(true);
    }

	const idSearch = async (id) => {
		try {
			/*	text returned from input dialog is always a string but we can use a couple of techniques to convert it to a valid number
				Technique 1: use the unary plus operator which is what i've adopted below
				Technique 2: multiply by a number. 
				etc	*/
			if(!+id){
				toast.error('Please enter a valid number');
				return;
			}
			setNetworkRequest(true);
			setReceipts([]);
            setSalesRecords([]);
			setSearchMode(1);
            setTotalTransactionAmount(0);
            setSelectedReceipt(null);
            setSelectedInvoice(null);
            setStartDate(null);
            setEndDate(null);

			setSearchedId(id);
			setSearchedDate(null);
            setSearchedEntityData(null);
            setSearchedEntity("");
			setValue('startDate', null);
			setValue('endDate', null);

            setFilename(`Receipt ID - ${id}`);
	
			const response = await transactionsController.findPurchaseReceiptByNo(id);
            if(response && response.data){
                const tableArr = [];
                response.data.forEach(res => tableArr.push(new Receipt(res)));
                tableArr.sort((a, b) => a.id - b.id);
                response.data.sort((a, b) => a.id - b.id);
                setReceipts(tableArr);
                setReceiptOptions(tableArr.map( receipt => ({label: receipt.id, value: receipt})));
            }
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return idSearch(id);
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
			setNetworkRequest(false);
		}
	}
	
	const dateSearch = async (date) => {
        /*  Setting start date to 1 instead of 0 to avoid story that touch (1 hour lag from front end, causing a previous date with 23 hour). Time
            isn't important here from front end as the time will be set by Java on the backend. Only date is important  */
        try {
			if (date.startDate && date.endDate) {
                const startDate = format(date.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(date.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                setStartDate(startDate);
                setEndDate(endDate);

				setNetworkRequest(true);
                setTotalTransactionAmount(0);
                setReceipts([]);
                setSalesRecords([]);
                setSelectedReceipt(null);
                setSelectedInvoice(null);
                setSearchMode(0);
				setSearchedId(0);
                setSearchedEntityData(null);
                setSearchedEntity("");
				setSearchedDate(date);

                setFilename(`Receipts ${format(new Date(date.startDate), "dd/MM/yyyy")} - ${format(new Date(date.endDate), "dd/MM/yyyy")}`);
                
				const response = await transactionsController.searchPurchaseReceiptsByDate(startDate, endDate, date.reversal_status);
				if(response && response.data){
                    const tableArr = [];
                    response.data.forEach(res => tableArr.push(new Receipt(res)));
                    tableArr.sort((a, b) => a.id - b.id);
                    response.data.sort((a, b) => a.id - b.id);
                    setReceipts(tableArr);
                    setReceiptOptions(tableArr.map( receipt => ({label: receipt.id, value: receipt})));
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return dateSearch(date);
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
	
	const entityDateSearch = async (data) => {
        /*  Setting start date to 1 instead of 0 to avoid story that touch (1 hour lag from front end, causing a previous date with 23 hour). Time
            isn't important here from front end as the time will be set by Java on the backend. Only date is important  */
        try {
			if (data.startDate && data.endDate) {
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                setStartDate(startDate);
                setEndDate(endDate);

				setNetworkRequest(true);
                setTotalTransactionAmount(0);
                setReceipts([]);
                setSalesRecords([]);
                setSelectedReceipt(null);
                setSelectedInvoice(null);
				setSearchedId(0);
                setSearchMode(2);
				setSearchedDate(null);
                setSearchedEntityData(data);

                let response;
                if(confirmDialogEvtName === "searchByCustomer"){
                    setFilename(
                        `Receipts_for_${data.select.label}_${format(new Date(data.startDate), "dd/MM/yyyy")} - ${format(new Date(data.endDate), "dd/MM/yyyy")}`
                    );
                    setSearchedEntity('customer');
                    response = await transactionsController.customerSalesReceiptsByDate(startDate, endDate, data.select.value.id);
                }else if(confirmDialogEvtName === "searchByUser"){
                    setFilename(
                        `Receipts_generated_by_${data.select.label}_${format(new Date(data.startDate), "dd/MM/yyyy")} - ${format(new Date(data.endDate), "dd/MM/yyyy")}`
                    );
                    setSearchedEntity('user');
                    response = await transactionsController.userGeneratedSalesReceiptsByDate(data.startDate, data.endDate, data.select.label);
                }else {
                    setFilename(
                        `${data.select.label}_Receipts_${format(new Date(data.startDate), "dd/MM/yyyy")} - ${format(new Date(data.endDate), "dd/MM/yyyy")}`
                    );
                    setSearchedEntity('outpost');
                    response = await transactionsController.outpostSalesReceiptsByDate(data.startDate, data.endDate, data.select.value.id);
                }
                
				if(response && response.data){
                    const tableArr = [];
                    response.data.forEach(res => tableArr.push(new Receipt(res)));
                    tableArr.sort((a, b) => a.id - b.id);
                    response.data.sort((a, b) => a.id - b.id);
                    setReceipts(tableArr);
                    setReceiptOptions(tableArr.map( receipt => ({label: receipt.id, value: receipt})));
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return entityDateSearch(data);
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

    const updateTransactionDate = async () => {
        try {
            setNetworkRequest(true);
            // explicitly set dtoDateTime to avoid 1hr lag when sending to backend. Time will be set by Java on the backend, only date is important here.
            const date = new Date();
            let dtoDate = format(tempDate, "yyyy-MM-dd") + "T12:20:00.000Z";
            const response = await transactionsController.updateReceiptDate(selectedReceipt.id, dtoDate);
            if(response && response.status === 200){
                selectedReceipt.transactionDate = dtoDate;
                setSelectedReceipt(selectedReceipt);
                toast.info('Date updated');
            }

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return updateTransactionDate();
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
	
	const activateReceipt = async () => {
        try {
            setNetworkRequest(true);
            
            const response = await transactionsController.activateReceipt(selectedReceipt);
            if(response && response.status === 200){
                selectedReceipt.reversalStatus = false;
                setSelectedReceipt(selectedReceipt);
                toast.info('activated');
            }
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return activateReceipt();
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
	
	const reverseReceipt = async () => {
        try {
            setNetworkRequest(true);
            
            const response = await transactionsController.reverseReceipt(selectedReceipt);
            if(response && response.status === 200){
                selectedReceipt.reversalStatus = true;
                setSelectedReceipt(selectedReceipt);
                toast.info('reversed');
            }
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return reverseReceipt();
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
	
	const reprint = async () => {
        try {
            setNetworkRequest(true);
            
            await printerController.print(selectedReceipt);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return activateReceipt();
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
	
	const download = async () => {
        try {
            setNetworkRequest(true);
            /*  TWO WAYS TO WORD WRAP IN jsPDF
                1. use method splitTextToSize
                2. use maxWidth property options to text method
            */
            const unit = "mm";
            const size = [80, 120]; // Use A1, A2, A3 or A4
            const orientation = "portrait"; // portrait or landscape
            const fileExtension = ".pdf";

            const marginLeft = 40;
            const doc = new jsPDF(orientation, unit, size);

            doc.setFontSize(15);
            doc.setFont("monospace", 'bold');

            let splitTitle = doc.splitTextToSize(clientDetails.storeName, 80);
            doc.text(splitTitle, marginLeft, 10, {align: 'center'});
            
            doc.setFontSize(6);
            doc.setFont("times", 'normal');
            doc.text(clientDetails.address, marginLeft, 15, {align: 'center', maxWidth: 80});
            doc.text(clientDetails.phone, marginLeft, 20, {align: 'center'});

            doc.text(`SALES BILL NO.: ${selectedReceipt.id}`, 5, 25, {align: 'left'});
            doc.text(`DATE: ${format(selectedReceipt.transactionDate, 'dd/MM/yyyy HH:mm:ss')}`, 5, 30, {align: 'left'});
            doc.text(`CASHIER.: ${selectedReceipt.cashier}`, 5, 35, {align: 'left'});
            doc.text(`CUSTOMER: ${selectedReceipt.customerName}`, 5, 40, {align: 'left'});
            
            autoTable(doc, {
                styles: { theme: 'striped', fontSize: 7 },
                margin: { top: 42, left: 5 },
                didDrawPage: (data) => {
                    /*  Reseting top margin. The change will be reflected only after print the first page.
                        ref:    https://github.com/simonbengtsson/jsPDF-AutoTable/issues/345
                    */
                    data.settings.margin.top = 10;
                },
                showHead: 'firstPage',
                // head: [['Name', 'Email']],
                body: salesRecords,
                columns: [
                    { header: 'QTY', dataKey: 'qty' },
                    { header: 'CAT', dataKey: 'qtyType' },
                    { header: 'DESCRIPTION', dataKey: 'name' },
                    { header: 'AMOUNT', dataKey: 'totalAmount' },
                ],
                tableWidth: doc.internal.pageSize.getWidth() - 10,
            });

            doc.setFontSize(8);
            doc.text(`DISCOUNT (N): ${numeral(totalDiscount).format('₦0,0.00')}`, marginLeft,  doc.lastAutoTable.finalY + 5, {align: 'center'});
            doc.setFontSize(11);
            doc.text(`TOTAL (N): ${numeral(totalTransactionAmount).format('₦0,0.00')}`, marginLeft,  doc.lastAutoTable.finalY + 10, {align: 'center'});
            doc.line(5, doc.lastAutoTable.finalY + 15, doc.internal.pageSize.getWidth() - 5, doc.lastAutoTable.finalY + 15, 'S');

            doc.setFontSize(6);
            doc.text(clientDetails.appreciation, marginLeft, doc.lastAutoTable.finalY + 22, {align: 'center'});
            doc.text(clientDetails.invoiceWarning, marginLeft, doc.lastAutoTable.finalY + 27, {align: 'center'});
            doc.line(5, doc.lastAutoTable.finalY + 28, doc.internal.pageSize.getWidth() - 5, doc.lastAutoTable.finalY + 28, 'S');

            doc.setFontSize(6);
            doc.text(`Powered By ${clientDetails.poweredBy} - ${clientDetails.gctContact}`, marginLeft, doc.lastAutoTable.finalY + 32, {align: 'center'});

            doc.save(`id_${selectedReceipt.id}_${format(selectedReceipt.transactionDate, 'dd/MM/yyyy HH:mm:ss')}` + fileExtension);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return activateReceipt();
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
    
    const pdfExport = async () => {
        /*  Setting start date to 1 instead of 0 to avoid story that touch (1 hour lag from front end, causing a previous date with 23 hour). Time
            isn't important here from front end as the time will be set by Java on the backend. Only date is important  */
        let startDate;
        let endDate;
        try {
            setNetworkRequest(true);
            let response;
            switch (searchMode){
                case 0:
                    startDate = format(searchedDate.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                    endDate = format(searchedDate.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                    setStartDate(startDate);
                    setEndDate(endDate);
                    response = await transactionsController.pdfPurchaseReceiptsByDateForExport(startDate, endDate, searchedDate.reversal_status);
                    if(response && response.data){
                        if(user.hasAuth('PROFIT_VIEW')){
                            dayBookProfitPDF(response.data);
                        }else {
                            generatePDF(response.data);
                        }
                    }
                    break;
                case 1:
                    response = await transactionsController.pdfPurchaseReceiptsByNoForExport(searchedId);
                    if(response && response.data){
                        if(user.hasAuth('PROFIT_VIEW')){
                            dayBookProfitPDF(response.data);
                        }else {
                            generatePDF(response.data);
                        }
                    }
                case 2:
                    startDate = format(searchedEntityData.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                    endDate = format(searchedEntityData.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                    setStartDate(startDate);
                    setEndDate(endDate);
                    if(searchedEntity === "customer"){
                        response = await transactionsController.pdfCustomerSalesReceiptsByDateForExport(startDate, endDate, searchedEntityData.select.value.id);
                    }else if(searchedEntity === "user"){
                        response = await transactionsController.userGeneratedSalesReceiptsByDateForExport(startDate, endDate, searchedEntityData.select.label);
                    }else if(searchedEntity === "outpost"){
                        response = await transactionsController.outpostSalesReceiptsByDateForExport(startDate, endDate, searchedEntityData.select.value.id);
                    }
                    if(response && response.data){
                        if(user.hasAuth('PROFIT_VIEW')){
                            dayBookProfitPDF(response.data);
                        }else {
                            generatePDF(response.data);
                        }
                    }
                    break;
            }
            setNetworkRequest(false);
            
        } catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return pdfExport();
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
            
    //	setup table data from fetched stock record
    const buildTableData = (selectedReceipt, dtoInvoice) => {
        const tableArr = [];
        let discount = numeral(0);
        dtoInvoice.dtoSalesRecords.forEach(item => {
            const dtoItem = new TransactionItem();
            dtoItem.id = item.id;
            dtoItem.itemSoldOutPrice = item.itemSoldOutPrice;
            dtoItem.name = item.name;
            dtoItem.qty = item.qty;
            dtoItem.qtyType = item.qtyType;
            dtoItem.discount = item.discount ? item.discount : '0';

            const tempDisc = numeral(dtoItem.discount).multiply(dtoItem.qty);
            discount = numeral(discount).add(tempDisc);

            tableArr.push(dtoItem);
        });
        setTotalTransactionAmount(tableArr.reduce( (accumulator, currentVal) => numeral(currentVal.totalAmount).add(accumulator).value(), 0));
        
        setTotalDiscount(numeral(discount).add(dtoInvoice.invoiceDiscount).add(selectedReceipt.ledgerDiscount));
        return tableArr;
    };
    
    const dayBookProfitPDF = (receiptData) => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(20);

        const title = `Receipts Summary ${format(new Date(startDate), "dd/MM/yyyy")} - ${format(new Date(endDate), "dd/MM/yyyy")}`;

        doc.text(title, marginLeft, 40);
        const receipts = [];
        for (const key in receiptData) {
            receipts.push(new ReceiptSummary(receiptData[key]));
        }
        let totalGrossAmount = numeral(0);
        let totalNetAmount = numeral(0);
        let totalNetProfit = numeral(0);
        receipts.forEach(receipt => {
            totalGrossAmount = numeral(totalGrossAmount).add(receipt.grossAmount);
            totalNetAmount = numeral(totalNetAmount).add(receipt.netAmount);
            totalNetProfit = numeral(totalNetProfit).add(receipt.netProfit);
            doc.autoTable({
                styles: { theme: 'striped' },
                margin: { top: 60 },
                showHead: 'firstPage',
                footStyles: {textColor: 'black', fillColor: 'white',},
                foot: [
                    [
                        {
                            content: `Receipt No. ${receipt.id} | Date: ${receipt.transactionDate} | Payment Mode: ${receipt.toStringPaymentModes}`,
                            colSpan: 8,
                        }
                    ],
                    [
                        {
                            content: "Gross Amount " + `${numeral(receipt.grossAmount).format('₦0,0.00')} | Invoice Discount: ` + 
                                `${numeral(receipt.invoiceDiscount).format('₦0,0.00')} | Net Amount: ${numeral(receipt.netAmount).format('₦0,0.00')} | ` + 
                                `Net Profit: ${numeral(receipt.netProfit).format('₦0,0.00')}`,
                            colSpan: 8,
                        }
                    ],
                ],
                body: receipt.items,
                columns: [
                    // { header: 'Receipt No.', dataKey: 'receipt_id' },
                    { header: 'Description', dataKey: 'itemName' },
                    { header: 'Qty', dataKey: 'qty' },
                    { header: 'Type', dataKey: 'qtyType' },
                    { header: 'Stock Price (x1)', dataKey: 'stockPrice' },
                    { header: 'Sales Price (x1)', dataKey: 'price' },
                    { header: 'Discount x1', dataKey: 'itemDiscount' },
                    { header: 'Amount', dataKey: 'totalAmount' },
                    { header: 'Profit Margin', dataKey: 'profit' },
                ],
            });
        });
        doc.text(`Total Gross Amount: ${numeral(totalGrossAmount).format('₦0,0.00')} | Total Net Amount: ${numeral(totalNetAmount).format('₦0,0.00')}`, marginLeft, doc.lastAutoTable.finalY + 40);
        doc.text(`Total Net Profit: ${numeral(totalNetProfit).format('₦0,0.00')}`, marginLeft,  doc.lastAutoTable.finalY + 70);
            
        doc.save(`${filename}` + fileExtension);
    }

    const generatePDF = (receiptData) => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "landscape"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(20);

        const title = `Receipts Summary ${format(new Date(startDate), "dd/MM/yyyy")} - ${format(new Date(endDate), "dd/MM/yyyy")}`;

        doc.text(title, marginLeft, 40);
        const receipts = [];
        for (const key in receiptData) {
            receipts.push(new ReceiptSummary(receiptData[key]));
        }
        let totalGrossAmount = numeral(0);
        let totalNetAmount = numeral(0);
        let totalNetProfit = numeral(0);
        receipts.forEach(receipt => {
            totalGrossAmount = numeral(totalGrossAmount).add(receipt.grossAmount);
            totalNetAmount = numeral(totalNetAmount).add(receipt.netAmount);
            totalNetProfit = numeral(totalNetProfit).add(receipt.netProfit);
            doc.autoTable({
                styles: { theme: 'striped' },
                margin: { top: 60 },
                showHead: 'firstPage',
                footStyles: {textColor: 'black', fillColor: 'white',},
                foot: [
                    [
                        {
                            content: `Receipt No. ${receipt.id} | Date: ${receipt.transactionDate} | Payment Mode: ${receipt.toStringPaymentModes}`,
                            colSpan: 8,
                        }
                    ],
                    [
                        {
                            content: "Gross Amount " + `${numeral(receipt.grossAmount).format('₦0,0.00')} | Invoice Discount: ` + 
                                `${numeral(receipt.invoiceDiscount).format('₦0,0.00')} | Net Amount: ${numeral(receipt.netAmount).format('₦0,0.00')} | `, colSpan: 8,
                        }
                    ],
                ],
                body: receipt.items,
                columns: [
                    // { header: 'Receipt No.', dataKey: 'receipt_id' },
                    { header: 'Description', dataKey: 'itemName' },
                    { header: 'Qty', dataKey: 'qty' },
                    { header: 'Type', dataKey: 'qtyType' },
                    { header: 'Sales Price (x1)', dataKey: 'price' },
                    { header: 'Discount x1', dataKey: 'itemDiscount' },
                    { header: 'Amount', dataKey: 'totalAmount' },
                ],
            });
        });
        doc.text(`Total Gross Amount: ${numeral(totalGrossAmount).format('₦0,0.00')} | Total Net Amount: ${numeral(totalNetAmount).format('₦0,0.00')}`, marginLeft, doc.lastAutoTable.finalY + 40);
            
        doc.save(`${filename}` + fileExtension);
    }

    return (
        <div>
            <div className={`container-fluid`}>
                <div className="d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                    <div className={`${networkRequest ? 'disabledDiv' : ''}`}>
                        <OffcanvasMenu menuItems={receiptsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
                    </div>
                    <div className="text-center d-flex">
                        <h2 className="display-6 p-3 mb-0">
                            <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Receipts</span>
                            <img src={SVG.receipt} style={{ width: "50px", height: "50px" }} />
                        </h2>
                    </div>
                    <p className='text-center m-2'>Search receipts by date or number to view, update, delete etc</p>
                </div>
                <div className="justify-content-center d-flex">
                    {networkRequest && <OribitalLoading color='red' />}
                </div>
                <div className={`row justify-content-center ${networkRequest ? 'disabledDiv' : ''}`} id='user-window'>
                    {/* Receipts drop down.... ONLY SHOW ON MOBILE */}
                    <div className="d-md-none mb-3">
                        <p className="h5 mb-2">Receipt No.: </p>
                        <Controller
                            name="receipt_no"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Select
                                    required
                                    placeholder="Select..."
                                    className="text-dark"
                                    options={receiptOptions}
									value={value}
                                    onChange={(val) => {
										onChange(val);
										handleReceiptChange(val);
									}}
                                />
                            )}
                        />
                        <ErrorMessage source={errors.receipt_no} />
                    </div>

                    <div className="d-none d-md-block col-12 col-md-2 p-4 d-flex flex-column gap-2 rounded bg-light shadow-sm border overflow-md-auto border" style={{ maxHeight: "100vh", overflow: 'scroll' }}>
                        <h4 className='mb-3'>Reciept ID:-</h4>
                        <Table id="myTable" className="rounded-2" hover responsive>
                            <tbody>
                                {/* <tr> */}
                                {receipts.map((receipt, index) => (
                                    <tr className='' key={index} onClick={() => handleReceiptClicked(receipt)}>
                                        <td>{receipt.id}</td>
                                    </tr>
                                ))}
                                {/* </tr> */}
                            </tbody>
                        </Table>
                        {/*  */}

                    </div>

                    <div className="col-12 col-md-9 p-3 shadow-sm border border-2 rounded-3 ms-1 overflow-md-auto">
                        <div className="shadow p-4 border rounded-3 bg-success-subtle mb-3">
                            <h4>Receipt Details:- </h4>
                            <div className="row g-4"> {/* Adds gap between sections */}
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">ID:</span>
                                        <span className='pe-2 fw-bold text-danger h3'>{selectedReceipt?.id}</span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Cashier:</span>
                                        <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>{selectedReceipt?.cashier}</span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Customer:</span>
                                        <span style={{overflow: 'scroll', textAlign: "right" }} className='pe-2 text-primary fw-bold'>{selectedReceipt?.customerName}</span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Date:</span>
                                        <span className='pe-2 text-primary fw-bold'>
                                            {selectedReceipt?.transactionDate ? format(selectedReceipt?.transactionDate, 'dd/MM/yyyy HH:mm:ss') : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Status:</span>
                                        <span className={`pe-2 fw-bold ${selectedReceipt?.reversalStatus ? 'text-danger' : 'text-primary'}`}>
                                            {selectedReceipt?.reversalStatus ? 'REVERSED' : "ACTIVE"}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                        <span className="fw-bold text-md-end h5 me-2">Payment Mode:</span>
                                        <span style={{overflow: 'scroll' }} className='pe-2 text-primary fw-bold'>
                                            {selectedReceipt?.paymentModes.map(pm => pm.type + " = " + pm.amount + ", ")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle">
                            <h4>Invoice Details:- </h4>
                            <div className="row g-4"> {/* Adds gap between sections */}
                                <div className="col-12 col-md-6">
                                    <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                        {/* TODO: Make a link and navigate to invoice page when clicked */}
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
                            </div>
                        </div>

                        <div className="rounded-2 border mt-4">
                            <div style={{maxHeight: '400px', minHeight: '400px', overflow: 'scroll'}}>
                                <TableMain tableProps={tableProps} tableData={salesRecords} />
                            </div>
                        </div>
                        <div className='pe-2 fw-bold h3 mt-3 d-flex flex-column gap-2'>
                            <div className='h5'>Total Discount (₦): <span className='text-danger fw-bold'>{numeral(totalDiscount).format('₦0,0.00')}</span> </div>
                            <div>Total (₦): <span className='h3 text-success fw-bold'>{numeral(totalTransactionAmount).format('₦0,0.00')}</span> </div>
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
                showRadio={true}
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
            <PaymentModeDialog
                show={showPaymentModal}
                handleClose={handleClosePaymentModal}
                handleConfirm={paymentModeSet}
            />
            <EntityDateDialog 
                show={showEntityModal}
                message={displayMsg}
                entityOptions={entityOptions}
                optionsLoading={entityLoading}
                handleClose={handleCloseModal}
                handleConfirm={entityDateSearch}
            />

            <SingleDateSelectDialog
                show={showSingleDateDialog}
                handleClose={closeSingleDateDialog}
                handleConfirm={handleDateChanged}
                message={"Update Receipt Transaction date"}
            />
        </div>
    )
}

export default SalesReceiptWindow;