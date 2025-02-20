import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import numeral from 'numeral';

import ErrorMessage from '../../Components/ErrorMessage';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import DateDialog from '../../Components/DialogBoxes/DateDialog';
import handleErrMsg from '../../Utils/error-handler';
import { useAuth } from '../../app-context/auth-user-context';
import transactionsController from '../../Controllers/transactions-controller';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import { Receipt } from '../../Entities/Receipt';
import TableMain from '../../Components/TableView/TableMain';
import { TransactionItem } from '../../Entities/TransactionItem';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import PaymentModeDialog from '../../Components/DialogBoxes/PaymentModeDialog';

const SalesReceiptWindow = () => {
    //  format(selectedReceipt?.transactionDate, 'dd/MM/yyyy HH:mm:ss')
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const { control, setValue, formState: { errors } } = useForm();

	const receiptsOffCanvasMenu = [
		{ label: "Search By Receipt No.", onClickParams: {evtName: 'searchByNo'} },
		{ label: "Search by Date", onClickParams: {evtName: 'searchByDate'} },
		{ label: "Activate Receipt", onClickParams: {evtName: 'activateReceipt'} },
		{ label: "Reverse Receipt", onClickParams: {evtName: 'reverseReceipt'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
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

    const [receipts, setReceipts] = useState([]);
    const [receiptOptions, setReceiptOptions] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [salesRecords, setSalesRecords] = useState([]);
    const [totalTransactionAmount, setTotalTransactionAmount] = useState(0);
    
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

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByNo':
				setDisplayMsg("Please enter Receipt No.");
				setShowInputModal(true);
                break;
            case 'exportToPDF':
                break;
            case 'searchByDate':
				setShowDateModal(true);
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
        }
	}

	const handleCloseModal = () => {
		setShowDateModal(false);
		setShowInputModal(false);
		setShowConfirmModal(false);
	};

	const handleClosePaymentModal = () => {
		setShowPaymentModal(false);
	};
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'activateReceipt':
				activateReceipt();
                break;
            case 'reverseReceipt':
				reverseReceipt();
                break;
        }
	}

    //  Handle item selection change
    const handleReceiptChange = (selectedReceipt) => {
        setSelectedReceipt(selectedReceipt.value);
        setSelectedInvoice(selectedReceipt.value.dtoInvoice);
        setSalesRecords(buildTableData(selectedReceipt.value.dtoInvoice.dtoSalesRecords));
    };

    //  Handle item selection clicked from table
    const handleReceiptClicked = (selectedReceipt) => {
        setValue('receipt_no', {label: selectedReceipt.id, value: selectedReceipt});
        setSelectedReceipt(selectedReceipt);
        setSelectedInvoice(selectedReceipt.dtoInvoice);
        setSalesRecords(buildTableData(selectedReceipt.dtoInvoice.dtoSalesRecords));
    };

    const paymentModeSet = (payments) => {
        console.log(payments);
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
        console.log(selectedReceipt);
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

			setSearchedId(id);
			setSearchedDate(null);
			setValue('startDate', null);
			setValue('endDate', null);
	
			const response = await transactionsController.findPurchaseReceiptByNo(id);
            if(response && response.data){
                const tableArr = [];
                response.data.forEach(res => tableArr.push(new Receipt(res)));
                tableArr.sort((a, b) => a.id - b.id);
                response.data.sort((a, b) => a.id - b.id);
                setReceipts(tableArr);
                setReceiptOptions(tableArr.map( receipt => ({label: receipt.id, value: receipt})));
                console.log(response.data, tableArr);
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
        try {
			if (date.startDate && date.endDate) {
				setNetworkRequest(true);
                setTotalTransactionAmount(0);
                setReceipts([]);
                setSalesRecords([]);
                setSelectedReceipt(null);
                setSelectedInvoice(null);
				setSearchedId(0);
                setSearchMode(0);
				setSearchedDate(date);
                
				const response = await transactionsController.searchPurchaseReceiptByDate(date.startDate.toISOString(), date.endDate.toISOString());
				if(response && response.data){
                    const tableArr = [];
                    response.data.forEach(res => tableArr.push(new Receipt(res)));
                    tableArr.sort((a, b) => a.id - b.id);
                    response.data.sort((a, b) => a.id - b.id);
                    setReceipts(tableArr);
                    setReceiptOptions(tableArr.map( receipt => ({label: receipt.id, value: receipt})));
                    console.log(response.data, tableArr);
				}
                
				// const res = await transactionsController.searchPurchaseReceiptByDatee(date.startDate.toISOString(), date.endDate.toISOString());
                // console.log('searching within date', date);
				// if(res && res.data){
                //     console.log(res.data.sort((a, b) => a.id - b.id));
				// }
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
	
	const activateReceipt = async () => {
        try {
            setNetworkRequest(true);
            
            const response = await transactionsController.activateReceipt(selectedReceipt);
            if(response && response.status === 200){
                console.log(response.data);
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
            
    //	setup table data from fetched stock record
    const buildTableData = (arr = []) => {
        const tableArr = [];
        arr.forEach(item => {
            const dtoItem = new TransactionItem();
            dtoItem.id = item.id;
            dtoItem.itemSoldOutPrice = item.itemSoldOutPrice;
            dtoItem.itemName = item.itemName;
            dtoItem.qty = item.qty;
            dtoItem.qtyType = item.qtyType;
            dtoItem.discount = item.discount ? item.discount : '0';

            tableArr.push(dtoItem);
        });
        setTotalTransactionAmount(tableArr.reduce( (accumulator, currentVal) => numeral(currentVal.totalAmount).add(accumulator).value(), 0));
        return tableArr;
    };

    return (
        <div>
            <div className={`container-fluid`}>
                <div className="d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                    <div>
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
            <PaymentModeDialog
                show={showPaymentModal}
                handleClose={handleClosePaymentModal}
                handleConfirm={paymentModeSet}
            />
        </div>
    )
}

export default SalesReceiptWindow;