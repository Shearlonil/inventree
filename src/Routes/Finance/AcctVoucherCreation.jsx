import React, { useEffect, useState } from "react";
import { Form, Modal, Table } from "react-bootstrap";
import Select from "react-select";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaReceipt } from "react-icons/fa";
import { Controller, useForm } from "react-hook-form";

import OffcanvasMenu from "../../Components/OffcanvasMenu";
import ErrorMessage from "../../Components/ErrorMessage";
import ledgerController from "../../Controllers/ledger-controller";
import { Ledger } from "../../Entities/Ledger";
import { useAuth } from "../../app-context/auth-user-context";
import VchCreationForm from "../../Components/Finance/VchCreationForm";
import TableMain from "../../Components/TableView/TableMain";
import ReactMenu from "../../Components/ReactMenu";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import numeral from "numeral";

const AcctVoucherCreation = () => {
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();
		
	const [networkRequest, setNetworkRequest] = useState(false);
		
	const [ledgerOptions, setLedgerOptions] = useState([]);
	const [ledgerTransactions, setLedgerTransactions] = useState([]);

	const [entityToEdit, setEntityToEdit] = useState(null);
	const [showFormModal, setShowFormModal] = useState(false);
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

	const [totalDrAmount, setTotalDrAmount] = useState(0);
	const [totalCrAmount, setTotalCrAmount] = useState(0);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'Edit', onClickParams: {evtName: 'edit' } },
    ];

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
            const response = await ledgerController.findAllActive();

            if (response && response.data) {
                setLedgerOptions(response.data.map(datum => new Ledger(datum)).map(ledger => ({label: ledger.name, value: ledger})));
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

    const handleShowFormModal = () => setShowFormModal(true);

    const handleCloseModal = () => {
		setEntityToEdit(null);
        setShowFormModal(false);
		setShowConfirmModal(false);
    };

	const fnSave = (data) => {
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
				break;
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
		headers: ['Ledger', 'Description', 'Dr', 'Cr', 'Options'],
		//	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
		objectProps: ['ledgerName', 'description', 'drAmount', 'crAmount'],
		//	React Menu
		menus: {
			ReactMenu,
			menuItems,
			menuItemClick: handleTableReactMenuItemClick,
		}
	};

	return (
		<div className="container">
			<div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <OffcanvasMenu variant='danger' />
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Account Voucher Creation</span>
						<FaReceipt className="text-white" size={"30px"} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Create, View and modify accounting Legers. View ledger transactions by custom dates
                </span>
            </div>
			<div className="container">
				<div className="row p-3 rounded-2 my-3 py-4 border shadow">
					<div className="col-12 col-md-4 my-3">
						<aside className="p-3 d-none d-md-block bg-light shadow-lg">
							<VchCreationForm fnSave={fnSave} networkRequest={networkRequest} ledgerOptions={ledgerOptions} />
						</aside>
					</div>
					<div className="col-12 col-md-8 border border rounded-3 p-1 bg-light my-3 shadow">
						<TableMain tableProps={tableProps} tableData={ledgerTransactions} />
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
					<button
						className="btn btn-danger rounded-3 py-1"
						style={{ width: "7em" }}
					>
						Cancel
					</button>
					<button
						className="btn btn-success rounded-3 py-1"
						style={{ width: "7em" }}
					>
						Ok
					</button>
				</div>
			</div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />

            <Modal show={showFormModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Voucher Creation Form</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <VchCreationForm fnSave={fnSave} data={entityToEdit} networkRequest={networkRequest} ledgerOptions={ledgerOptions} />
                </Modal.Body>
            </Modal>
		</div>
	);
};

export default AcctVoucherCreation;
