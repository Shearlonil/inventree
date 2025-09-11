import React, { useEffect, useState } from "react";
import { FaReceipt } from "react-icons/fa";
import numeral from "numeral";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";

import ledgerController from "../../Controllers/ledger-controller";
import { Ledger } from "../../Entities/Ledger";
import { useAuth } from "../../app-context/auth-user-context";
import IncomeExpVchForm from "../../Components/Finance/IncomeExpVchForm";
import ReactMenu from "../../Components/ReactMenu";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import handleErrMsg from '../../Utils/error-handler';
import financeController from "../../Controllers/finance-controller";
import IMAGES from '../../assets/Images';
import StartEndDateSearch from "../../Components/StartEndDateSearch";
import TableMain from "../../Components/TableView/TableMain";

const Income = () => {
    const navigate = useNavigate();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
        
    const [networkRequest, setNetworkRequest] = useState(false);
        
    const [ledgerOptions, setLedgerOptions] = useState([]);
    const [ledgerTransactions, setLedgerTransactions] = useState([]);

    const [entity, setEntity] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Edit', onClickParams: {evtName: 'edit' } },
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
    ];

    useEffect( () => {
        if(user.hasAuth('FINANCE') && user.hasAuth('ACCOUNTING_VOUCHERS')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

    const initialize = async () => {
        try {
            setNetworkRequest(true);
            const response = await financeController.findChartLedgersByName("Revenue");

            if (response && response.data) {
                setLedgerOptions(
                    response.data
                        .filter(datum => datum.isDefault === false)
                        .map(datum => new Ledger(datum)).map(ledger => ({label: ledger.name, value: ledger}))
                );
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
        setEntity(null);
        setShowFormModal(false);
        setShowConfirmModal(false);
    };

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
                setEntity(entity);
                setConfirmDialogEvtName("delete");
                setDisplayMsg(`Delete entry with description ${entity.description}?`)
                setShowConfirmModal(true);
                break;
            case 'edit':
                setEntity(entity);
                setShowFormModal(true);
                break;
        }
    };
    
    const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName.toLowerCase()) {
            case 'delete':
                fnDelete();
                break;
            case "save":
                fnSave();
                break;
        }
    }

    const fnConfirmSave = async (dtoTransaction) => {
        setEntity(dtoTransaction);
        setConfirmDialogEvtName("save");
        //  if dtoTransaction has id, then update mode
        if(dtoTransaction.id){
            setDisplayMsg(`Update Income entry with ${dtoTransaction.description}?`)
        }else {
            setDisplayMsg(`Save Income entry?`)
        }
        setShowConfirmModal(true);
    }

    const fnSearch = async (data) => {
        try {
			if (data.startDate && data.endDate) {
                const startDate = format(data.startDate, "yyyy-MM-dd") + "T00:00:00.000Z";
                const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";

				setNetworkRequest(true);
                setLedgerTransactions([]);

				const response = await financeController.getIncomeExpVoucherDetails('Revenue', startDate, endDate);
				if(response && response.data){
                    const arr = [];

                    let totalCash = numeral(0);
                    response.data.forEach(datum => {
                        datum.dtoDateTime = datum.date;
                        datum.date = format(datum.date, 'dd/MM/yyyy');
                        totalCash = numeral(totalCash).add(datum.crAmount);
                        arr.push(datum);
                    });
					setLedgerTransactions(arr);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return fnSearch(data);
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

    const fnSave = async () => {
        try {
            setNetworkRequest(true);
            //  if dtoTransaction has id, then update mode
            if(entity.id){
                // explicitly set dtoDateTime to avoid 1hr lag when sending to backend
                entity.dtoDateTime = format(entity.dtoDateTime, "yyyy-MM-dd") + "T00:00:00.000Z";
                await financeController.updateIncomeExpVoucher(entity);
                //	find index position of edited item in items arr
                const indexPos = ledgerTransactions.findIndex(i => i.id === entity.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    ledgerTransactions.splice(indexPos, 1, entity);
                    setLedgerTransactions([...ledgerTransactions]);
                    toast.success('Update successful');
                }
            }else {
                //  new income transaction
                const response = await financeController.createIncomeExpVoucher(entity);
                if(response && response.data){
                    const arr = [response.data, ...ledgerTransactions];
                    setLedgerTransactions(arr);
                }
            }
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return fnSave();
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
            toast.error(handleErrMsg(error).msg);
        }
    }

    const fnDelete = async () => {
        try {
            setNetworkRequest(true);
            await financeController.deleteIncomeExpVoucher(entity);
            const indexPos = ledgerTransactions.findIndex(i => i.id === entity.id);
            if(indexPos > -1){
                //	replace old item found at index position in ledgerTransactions array with edited one
                ledgerTransactions.splice(indexPos, 1);
                setLedgerTransactions([...ledgerTransactions]);
            }
            calcTotalAmounts(ledgerTransactions);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return fnDelete();
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
        headers: ['Ledger', 'Description', 'Amount', 'Date', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['ledgerName', 'description', 'crAmount', 'date'],
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
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Income Voucher Creation</span>
                        <FaReceipt className="text-white" size={"30px"} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Manage income on the fly. Source ledgers are extracted from DIRECT and INDIRECT income groups.
                    <br />NOTE: This page requires both FINANCE AND ACCOUNTING VOUCHERS permissions
                </span>
            </div>
            <div className="container">
                <div className="row p-3 rounded-2 my-3 py-4 border shadow">
                    <div className="col-12 col-md-4 my-3">
                        <aside className="p-3 bg-light shadow-lg">
                            <IncomeExpVchForm fnSave={fnConfirmSave} networkRequest={networkRequest} ledgerOptions={ledgerOptions} mode={0} />
                        </aside>
                    </div>
                    <div className="col-12 col-md-8 my-3">
                        <aside className="d-none d-md-block border border rounded-3 p-3 bg-light shadow h-100">
                            <div id="carouselExample" className="carousel slide carousel-dark h-100" data-bs-ride="carousel">
                                <div className="carousel-indicators">
                                    <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                                    <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="1" aria-label="Slide 2"></button>
                                    <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="2" aria-label="Slide 3"></button>
                                </div>
                                <div className="carousel-inner h-100">
                                    <div className="carousel-item h-100 active">
                                        <div className="d-flex h-100">
                                            <div className="col-6">
                                                <img src={IMAGES.income_ex_three} className="w-100 h-100" alt="..." />
                                            </div>
                                            <div className="col-6 align-items-center d-flex">
                                                <div className="">
                                                    <h1>Quick Income/Expenses Records</h1>
                                                    <p className="text-secondary fs-5">Add your business income/expenses on the fly to start tracking your profit.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="carousel-item h-100">
                                        <div className="d-flex h-100">
                                            <div className="col-6">
                                                <img src={IMAGES.income_ex_one} className="w-100 h-100" alt="..." />
                                            </div>
                                            <div className="col-6 align-items-center d-flex">
                                                <div className="">
                                                    <h1>Income</h1>
                                                    <p className="text-secondary fs-5">
                                                        Add income records with ease. Start calculating actual profit by tracking your business income.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="carousel-item h-100">
                                        <div className="d-flex h-100">
                                            <div className="col-6">
                                                <img src={IMAGES.income_ex_two} className="w-100 h-100" alt="..." />
                                            </div>
                                            <div className="col-6 align-items-center d-flex">
                                                <div className="">
                                                    <h1>Expenses</h1>
                                                    <p className="text-secondary fs-5">
                                                        With the click of a button, add your expenses. Start calculating actual profit by tracking your business expenses.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
                <div className="row p-3">
                    <h2 className="paytone-one fw-bold" style={{color: '#8a2be2'}}>Recent Income</h2>
                    <StartEndDateSearch networkRequest={networkRequest} fnSearch={fnSearch} />
                </div>
                
            </div>
            <div style={{ maxHeight: "750px", overflow: 'scroll' }}>
                <TableMain tableProps={tableProps} tableData={ledgerTransactions} />
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
                    <IncomeExpVchForm fnSave={fnConfirmSave} data={entity} networkRequest={networkRequest} ledgerOptions={ledgerOptions} mode={0} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Income;