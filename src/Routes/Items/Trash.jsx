import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import genericController from '../../Controllers/generic-controller';
import { Item } from '../../Entities/Item';
import ReactMenu from '../../Components/ReactMenu';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';
import itemController from '../../Controllers/item-controller';

const Trash = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Restore', onClickParams: {evtName: 'restore'} },
    ];
    
    const [networkRequest, setNetworkRequest] = useState(false);
    
    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    //  for drop down dialog
    const [dropDownMsg, setDropDownMsg] = useState("");
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [tractOptions, setTractOptions] = useState([]);
        
    //	for pagination
    const [pageSize] = useState(20);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [items, setItems] = useState([]);
    
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    const itemsOffCanvasMenu = [
        { label: "Filter By Section", onClickParams: {evtName: 'filterBySection'} },
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Restore All", onClickParams: {evtName: 'restoreAll'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
    ];
            
    useEffect( () => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            setNetworkRequest(true);
            const urls = [ '/api/trash/items', '/api/tracts/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: trashRequest, 1: tractRequest } = response;

            //	check if the request to fetch tracts doesn't fail before setting values to display
            if(tractRequest){
                setTractOptions(tractRequest.data.map( tract => ({label: tract.name, value: tract})));
            }
            
            if (trashRequest && trashRequest.data && trashRequest.data.length > 0) {
                const arr = [];
                trashRequest.data.forEach( i => {
                    const item = new Item();
                    item.id = i.id;
                    item.itemName = i.itemName;
                    item.qty = i.qty;
                    item.storeQty = i.storeQty;
                    item.pkgName = i.pkgName;
                    item.tractName = i.tractName;
                    arr.push(item);
                } );
                setItems(arr);
                setFilteredItems(arr);
                setTotalItemsCount(trashRequest.data.length);
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
        // setEntityToEdit(null);
        setShowConfirmModal(false);
        setShowInputModal(false);
    };

    const resetPage = () => {
        setDisplayMsg("");
        setEntityToEdit(null);
        setShowConfirmModal(false);
        setShowInputModal(false);
        setConfirmDialogEvtName(null);
        setShowDropDownModal(false);
    };
    
    const handleDropDown = async (entity) => {
        setShowDropDownModal(false);
        switch (confirmDialogEvtName) {
            case 'filterBySection':
                const arr = items.filter(item => item.tractName.toLowerCase() === entity.name.toLowerCase());
                setFilteredItems(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
        }
    };
    
    const handleInputOK = async (str) => {
        let arr = [];
        switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = items.filter(item => item.name.toLowerCase().includes(str));
                setFilteredItems(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
        }
    }

    const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
        switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter Name");
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
            case 'showAll':
                setFilteredItems(items);
                setTotalItemsCount(items.length);
                break;
            case 'sortByName':
                filteredItems.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredItems.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
            case 'filterBySection':
                setConfirmDialogEvtName(onclickParams.evtName);
                setDropDownMsg("Select Section");
                setShowDropDownModal(true);
                break;
        }
    }

    const setPageChanged = async (pageNumber) => {
        setCurrentPage(pageNumber);
        const startIndex = (pageNumber - 1) * pageSize;
        setPagedData(filteredItems.slice(startIndex, startIndex + pageSize));
    };
    
    const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        try {
            setNetworkRequest(true);
            switch (confirmDialogEvtName) {
                case 'restore':
                    if(user.hasAuth('DELETE_ITEM')){
                        await itemController.restoreItem(entityToEdit.id);
                        //	find index position of restored item in items arr
                        let indexPos = filteredItems.findIndex(i => i.id == entityToEdit.id);
                        if(indexPos > -1){
                            //	cut out restored item found at index position
                            filteredItems.splice(indexPos, 1);
                            setFilteredItems([...filteredItems]);
                            /*  MAINTAIN CURRENT PAGE.  */
                            setTotalItemsCount(totalItemsCount - 1);
                            if(pagedData.length <= 1){
                                if(totalItemsCount >= pageSize){
                                    setCurrentPage(currentPage - 1);
                                }
                            }
                            toast.success('item successfully restored');
                        }
                        //  update in items arr also
                        indexPos = items.findIndex(i => i.id === data.id);
                        if(indexPos > -1){
                            //	replace old item found at index position in items array with edited one
                            items.splice(indexPos, 1);
                            setItems([...items]);
                        }
                    }else {
                        toast.error("Account doesn't support this operation. Please contact your supervisor");
                        return;
                    }
                    break;
            }
            resetPage();
            setNetworkRequest(false);
        } catch (error) {
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return handleConfirmOK();
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
    }

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'restore':
                //	ask if sure to restore
                setEntityToEdit(entity);
                setDisplayMsg(`Restore Item ${entity.itemName} from Trash?`);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowConfirmModal(true);
                break;
        }
    };
        
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Sales Qty (Unit)', 'Store Qty (Unit)', 'Packaging', 'Section', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'qty', 'storeQty', 'pkgName', 'tractName'],
        //	React Menu
        menus: {
            ReactMenu,
            menuItems,
            menuItemClick: handleTableReactMenuItemClick,
        }
    };

    return (
        <div style={{minHeight: '75vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={itemsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Trash (Items)</span>
                        <img src={SVG.shopping_items} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View, Restore deleted Items.
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
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={handleDropDown}
                message={dropDownMsg}
                options={tractOptions}
            />
        </div>
    )
}

export default Trash;