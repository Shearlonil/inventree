import React, { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { LuTicket } from "react-icons/lu";
import { FaReceipt } from "react-icons/fa";
import numeral from "numeral";
import { toast } from "react-toastify";
import { format, isAfter } from "date-fns";
import { useLocation } from "react-router-dom";

import OffcanvasMenu from "../../Components/OffcanvasMenu";
import ledgerController from "../../Controllers/ledger-controller";
import { Ledger } from "../../Entities/Ledger";
import VchCreationForm from "../../Components/Finance/VchCreationForm";
import TableMain from "../../Components/TableView/TableMain";
import ReactMenu from "../../Components/ReactMenu";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import handleErrMsg from '../../Utils/error-handler';
import SingleDateSelectDialog from "../../Components/DialogBoxes/SingleDateSelectDialog";
import { ThreeDotLoading } from "../../Components/react-loading-indicators/Indicator";
import { useAuthUser } from "../../app-context/user-context";
import useFinanceController from "../../Controllers/finance-controller-hook";

const AcctVoucherCreation = () => {
	const controllerRef = useRef(new AbortController());
		
	const location = useLocation();
	
	const { createVoucher } = useFinanceController();
	const { authUser } = useAuthUser();
	const user = authUser();
		
	const [networkRequest, setNetworkRequest] = useState(false);
		
	const [ledgerOptions, setLedgerOptions] = useState([]);
	const [ledgerTransactions, setLedgerTransactions] = useState([]);

	const [entityToEdit, setEntityToEdit] = useState(null);
	const [showFormModal, setShowFormModal] = useState(false);
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showSingleDateDialog, setShowSingleDateDialog] = useState(false);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

	const [totalDrAmount, setTotalDrAmount] = useState(0);
	const [totalCrAmount, setTotalCrAmount] = useState(0);
	const [transactionDate, setTransactionDate] = useState(new Date());

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'Edit', onClickParams: {evtName: 'edit' } },
    ];

    const offCanvasMenu = [
        { label: "Adjust Date", onClickParams: {evtName: 'adjustDate'} },
    ];

    useEffect( () => {
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
    }, [location.pathname]);

    const initialize = async () => {
        try {
            setNetworkRequest(true);
            controllerRef.current = new AbortController();
            const response = await ledgerController.findAllActive(controllerRef.current.signal);

            if (response && response.data) {
                setLedgerOptions(response.data.map(datum => new Ledger(datum)).map(ledger => ({label: ledger.name, value: ledger})));
            }

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
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
		setShowSingleDateDialog(false);
    };

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
            case 'adjustDate':
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowSingleDateDialog(true);
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
			case 'delete':
				break;
			case "save":
				saveTransactions();
				break;
			case "cancel":
				setLedgerTransactions([]);
				calcTotalAmounts([]);
				break;
		}
	}
	
	const handleDateChanged = (date) => {
		//  if future date detected, throw error
		if(isAfter(date.startDate, new Date())){
			toast.error("Future date detected");
			return;
		}
		setTransactionDate(date.startDate);
		ledgerTransactions.forEach(lt => {
			lt.dtoDateTime = date.startDate;
			lt.date = date.startDate;
		});
		setLedgerTransactions(ledgerTransactions);
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

	const saveTransactions = async () => {
		try {
            setNetworkRequest(true);
			resetAbortController();
            await createVoucher(ledgerTransactions, controllerRef.current.signal);

            setLedgerTransactions([]);
			calcTotalAmounts([]);

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
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
                <OffcanvasMenu menuItems={offCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Accounting Voucher Creation</span>
						<FaReceipt className="text-white" size={"30px"} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Create, View and modify accounting Vouchers. <br />NOTE: This page requires both FINANCE AND ACCOUNTING VOUCHERS permissions
                </span>
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
					<button className="btn btn-danger rounded-3 py-1" style={{ width: "7em" }} onClick={() => handleCancel()} >
						{ (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
						{ (!networkRequest) && `Cancel` }
					</button>
					<button className="btn btn-success rounded-3 py-1" style={{ width: "7em" }} onClick={() => handleSave()} >
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

            <SingleDateSelectDialog
                show={showSingleDateDialog}
                handleClose={handleCloseModal}
                handleConfirm={handleDateChanged}
                message={"Set Transaction date"}
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

export default AcctVoucherCreation;
