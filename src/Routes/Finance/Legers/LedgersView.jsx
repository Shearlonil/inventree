import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../../../app-context/auth-user-context';
import OffcanvasMenu from '../../../Components/OffcanvasMenu';
import SVG from '../../../assets/Svg';
import handleErrMsg from '../../../Utils/error-handler';
import ledgerController from '../../../Controllers/ledger-controller';
import TableMain from '../../../Components/TableView/TableMain';
import PaginationLite from '../../../Components/PaginationLite';
import ReactMenu from '../../../Components/ReactMenu';
import InputDialog from '../../../Components/DialogBoxes/InputDialog';
import ConfirmDialog from '../../../Components/DialogBoxes/ConfirmDialog';
import { OribitalLoading } from '../../../Components/react-loading-indicators/Indicator';
import DropDownDialog from '../../../Components/DialogBoxes/DropDownDialog';
import { Ledger } from '../../../Entities/Ledger';

const LedgersView = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        // { name: 'Rename', onClickParams: {evtName: 'rename' } },
        // { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'View', onClickParams: {evtName: 'view'} },
    ];
    
    const [networkRequest, setNetworkRequest] = useState(false);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
        
    //	for pagination
    const [pageSize] = useState(20);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [ledgers, setLedgers] = useState([]);
        
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredLedgers, setFilteredLedgers] = useState([]);

    const ledgersOffCanvasMenu = [
        { label: "Create", onClickParams: {evtName: 'create'} },
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
    ];

    useEffect( () => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            setNetworkRequest(true);
            const response = await ledgerController.findAllActive();

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( ledger => arr.push(new Ledger(ledger)) );
                setLedgers(arr);
                setFilteredLedgers(arr);
                setTotalItemsCount(response.data.length);
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

    const handleCloseModal = () => {
        setDisplayMsg("");
        setShowConfirmModal(false);
        setShowInputModal(false);
    };

    const resetPage = () => {
        setEntityToEdit(null);
        setConfirmDialogEvtName(null);
        handleCloseModal();
    };

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
                if(user.hasAuth('FINANCE') && user.hasAuth('DELETE_ITEM')){
                    if(entity && entity.id === 1){
                        toast.error("Operation not allowed on default ledger");
                        return;
                    }
                    //	ask if sure to delete
                    setEntityToEdit(entity);
                    setDisplayMsg(`Delete ledger ${entity.name}?`);
                    setConfirmDialogEvtName(onclickParams.evtName);
                    setShowConfirmModal(true);
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
            case 'rename':
                if(user.hasAuth('FINANCE')){
                    if(entity && entity.id === 1){
                        toast.error("Operation not allowed on default ledger");
                        return;
                    }
                    setEntityToEdit(entity);
                    setConfirmDialogEvtName(onclickParams.evtName);
                    setDisplayMsg(`Enter Unique ledger name`);
                    setShowInputModal(true);
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
            case 'view':
                if(user.hasAuth('FINANCE')){
                    window.open(`ledgers/${entity.id}/view`, '_blank')?.focus();
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
        }
    };

    const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
        switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter ledger Name");
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
            case 'trash':
                navigate('/finance/ledgers/trash');
                break;
            case 'showAll':
                setFilteredLedgers(ledgers);
                setTotalItemsCount(ledgers.length);
                break;
            case 'sortByName':
                filteredLedgers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredLedgers.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
            case 'create':
                if(user.hasAuth('FINANCE')){
                    setConfirmDialogEvtName(onclickParams.evtName);
                    setDisplayMsg(`Enter Unique ledger name`);
                    setShowInputModal(true);
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
        }
    }

    const setPageChanged = async (pageNumber) => {
        setCurrentPage(pageNumber);
        const startIndex = (pageNumber - 1) * pageSize;
        setPagedData(filteredLedgers.slice(startIndex, startIndex + pageSize));
    };
    
    const handleInputOK = async (str) => {
        let arr = [];
        switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = ledgers.filter(ledger => ledger.name.toLowerCase().includes(str));
                setFilteredLedgers(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
            case 'create':
                createLedger(str);
                break;
            case 'rename':
                renameLedger(str);
                break;
        }
    }
    
    const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        switch (confirmDialogEvtName) {
            case 'delete':
                deleteLedger();
                break;
        }
    }
    
    const createLedger = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await ledgerController.create(name);
            if(response && response.data){
                const ledger = new Ledger(response.data);
                const arr = [...filteredLedgers, ledger];
                ledgers.push(ledger);
                setLedgers(ledger);
                setFilteredLedgers([...arr]);
                /*  GO TO PAGE WHERE NEW LEDGER IS.  */
                setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
                setTotalItemsCount(totalItemsCount + 1);
                toast.success('Ledger creation successful');
            }
            resetPage();
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return createLedger(name);
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
        }
    };
    
    const renameLedger = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await ledgerController.rename(entityToEdit.id, name);
            if(response && response.status === 200){
                entityToEdit.name = name;
                //	find index position of edited item in filtered ledgers arr
                let indexPos = filteredLedgers.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in ledgers array with edited one
                    filteredLedgers.splice(indexPos, 1, entityToEdit);
                    setFilteredLedgers([...filteredLedgers]);
                    const startIndex = (currentPage - 1) * pageSize;
                    setPagedData(filteredLedgers.slice(startIndex, startIndex + pageSize));
                    toast.success('Update successful');
                }
                //  update in ledgers arr also
                indexPos = ledgers.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in ledgers array with edited one
                    ledgers.splice(indexPos, 1, entityToEdit);
                    setLedgers([...ledgers]);
                }
            }
            resetPage();
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return renameLedger(name);
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
        }
    };
    
    const deleteLedger = async () => {
        try {
            setNetworkRequest(true);
            
            await ledgerController.deleteLedger(entityToEdit.id);
            //	find index position of deleted item in items arr
            let indexPos = filteredLedgers.findIndex(o => o.id == entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                filteredLedgers.splice(indexPos, 1);
                setFilteredLedgers([...filteredLedgers]);
                /*  MAINTAIN CURRENT PAGE.  */
                setTotalItemsCount(totalItemsCount - 1);
                if(pagedData.length <= 1){
                    if(totalItemsCount >= pageSize){
                        setCurrentPage(currentPage - 1);
                    }
                }
                toast.success('Delete successful');
            }
            //  update in ledgers arr also
            indexPos = ledgers.findIndex(o => o.id === entityToEdit.id);
            if(indexPos > -1){
                //	replace old item found at index position in items array with edited one
                ledgers.splice(indexPos, 1);
                setLedgers([...ledgers]);
            }

            resetPage();
            setNetworkRequest(false);
        } catch (error) {
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return deleteLedger();
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
        }
    };
    
    const tableProps = {
        //	table header
        headers: ['Ledger Name', 'Balance', 'Reg. Date', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['name', 'ledgerBalance', 'creationDate'],
        //	React Menu
        menus: {
            ReactMenu,
            menuItems,
            menuItemClick: handleTableReactMenuItemClick,
        }
    };

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={ledgersOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Ledgers</span>
                        <img src={SVG.ledger} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Create, View and modify accounting Legers. View ledger transactions by custom dates
                </span>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className={`container mt-4 p-3 shadow-sm border border-2 rounded-1 ${networkRequest ? 'disabledDiv' : ''}`}>
                <div className="border bg-light my-3">
                    <TableMain tableProps={tableProps} tableData={pagedData} />
                </div>
                <div className="mt-3">
                    <PaginationLite
                        itemCount={totalItemsCount}
                        pageSize={pageSize}
                        setPageChanged={setPageChanged}
                        pageNumber={currentPage}
                    />
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={handleInputOK}
                message={displayMsg}
            />
        </div>
    );
}

export default LedgersView;