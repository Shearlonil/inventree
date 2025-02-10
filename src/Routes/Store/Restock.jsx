import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaStoreAlt } from "react-icons/fa";

import storeController from '../../Controllers/store-controller';
import genericController from '../../Controllers/generic-controller';
import handleErrMsg from '../../Utils/error-handler';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import RestockForm from '../../Components/StoreComp/RestockForm';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';
import ReactMenu from '../../Components/ReactMenu';
import { useAuth } from '../../app-context/auth-user-context';
import { Modal } from 'react-bootstrap';
import { ItemRegDTO } from '../../Entities/ItemRegDTO';
import { Packaging } from '../../Entities/Packaging';
import { Vendor } from '../../Entities/Vendor';
import { Tract } from '../../Entities/Tract';

const Restock = () => {
    const navigate = useNavigate();
    const { stock_rec_id } = useParams();
        
    const { handleRefresh, logout } = useAuth();

    /*	Flag to indicate network fetch for stock record and it's item details to populate table in order to continue data input.
        If true, then disable save button in store form input.	*/
    const [networkRequest, setNetworkRequest] = useState(false);
    
    const [stockRecId, setStockRecId] = useState(stock_rec_id);
    const [items, setItems] = useState([]);
    const [entityToEdit, setEntityToEdit] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [outpostOptions, setOutpostOptions] = useState([]);
    const [destination, setDestination] = useState(null);	//	1 => commit to store	| 2 => commit to outpost's sales/shelf
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [dropDownMsg, setDropDownMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    
    //	for pagination
    const [pageSize] = useState(10);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    //  data fetched from database to fill in Select
    const [dbItemOptions, setDbItemOptions] = useState([]);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        {
            name: 'Edit', onClickParams: {evtName: 'edit' }
        },
    ];

    const storeItemRegOffCanvasMenu = [
        { label: "Input form", onClickParams: {evtName: 'showFormInput'} },
        { label: "Save To Sales/Shelf", onClickParams: {evtName: 'saveRecToSales'} },
        { label: "Save To Store", onClickParams: {evtName: 'saveRecToStore'} },
        { label: "Delete Record", onClickParams: {evtName: 'deleteStockRec'} },
        // { label: "Search", onClickParams: {evtName: 'search'} },
        { label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
    ];
        
    useEffect( () => {
        if(stock_rec_id > 0){
            initializeWithStockRec();
        }else {
            initialize();
        }
    }, [stock_rec_id]);

	const initialize = async () => {
		try {
			setNetworkRequest(true);
			resetPageStates();
            const urls = [ '/api/items/transaction/mono', '/api/outposts/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: dbItemRequest, 1: outpostRequest } = response;

            //	check if the request to fetch db items doesn't fail before setting values to display
            if(dbItemRequest){
				setDbItemOptions(dbItemRequest.data.map( item => ({label: item.itemName, value: item.id})));
            }

            //	check if the request to fetch outposts doesn't fail before setting values to display
            if(outpostRequest){
                setOutpostOptions(outpostRequest.data.map( outpost => ({label: outpost.name, value: outpost.id}) ));
            }
	
			setNetworkRequest(false);
		} catch (error) {
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
	}

	const initializeWithStockRec = async () => {
		try {
			setNetworkRequest(true);
			resetPageStates();
	
			const unverifiedStockRequest = await storeController.findUnverifiedStockRecById(stock_rec_id);
            
            const urls = [ '/api/items/transaction/mono', '/api/outposts/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: dbItemRequest, 1: outpostRequest } = response;

            //	check if the request to fetch db items doesn't fail before setting values to display
            if(dbItemRequest){
				setDbItemOptions(dbItemRequest.data.map( item => ({label: item.itemName, value: item.id})));
            }

            //	check if the request to fetch outposts doesn't fail before setting values to display
            if(outpostRequest){
                setOutpostOptions(outpostRequest.data.map( outpost => ({label: outpost.name, value: outpost.id}) ));
            }
	
			//	check if the request to fetch item doesn't fail before setting values to display
			if (unverifiedStockRequest && unverifiedStockRequest.data) {
				setItems(buildTableData(unverifiedStockRequest.data.items));
				setTotalItemsCount(unverifiedStockRequest.data.items.length);
			}
	
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return initializeWithStockRec();
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

	const resetPageStates = () => {
		setItems([]);
		setPagedData([]);
		setTotalItemsCount(0);
		setCurrentPage(1);
		setStockRecId(stock_rec_id);
		setEntityToEdit(null);
		setDestination(null);
	}

	const commitStockRecord = async (outpostId) => {
		try {
			setNetworkRequest(true);
			await storeController.commitStockRecById(stockRecId, outpostId, destination);
			resetPageStates();
			//	navigate back to this page which will cause reset of page states
			navigate("/store/item/restock/0");

			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return commitStockRecord(outpostId);
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

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(items.slice(startIndex, startIndex + pageSize));
    };

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
				//	ask if sure to delete
				setEntityToEdit(entity);
				setDisplayMsg(`Delete item ${entity.itemName}?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
            case 'edit':
				setEntityToEdit(entity);
				setShowFormModal(true);
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'showFormInput':
				setShowFormModal(true);
                break;
            case 'saveRecToSales':
				setDisplayMsg(`Save record with ${items.length} item${items.length > 1 ? 's' : ''} to Sales/Shelf? Action cannot be undone`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setDestination(2);
				setShowConfirmModal(true);
                break;
            case 'saveRecToStore':
				setDisplayMsg(`Save record with ${items.length} item${items.length > 1 ? 's' : ''} to store? Action cannot be undone`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setDestination(1);
				setShowConfirmModal(true);
                break;
            case 'deleteStockRec':
				setDisplayMsg(`Delete record with ${items.length} item${items.length > 1 ? 's' : ''}? Action cannot be undone`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
            case 'exportToPDF':
				setDisplayMsg(`Export record to PDF?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
            case 'search':
                break;
        }
	}
	
	const fnSave = async (item) => {
		try {
			setNetworkRequest(true);
			if(item.itemDetailId){
				//	if data has itemDetailId, then update mode
				await storeController.updateStockRecItem(item);
				//	find index position of edited item in items arr
				const indexPos = items.findIndex(i => i.id === item.id);
				if(indexPos > -1){
					//	replace old item found at index position in items array with edited one
					items.splice(indexPos, 1, item);
					setItems([...items]);
					const startIndex = (currentPage - 1) * pageSize;
					setPagedData(items.slice(startIndex, startIndex + pageSize));
					toast.success('Update successful');
				}
			}else {
				// 	else, create new item
				let response = await storeController.restock(stockRecId, item);
				if(response && response.status === 200){
					item.id = response.data.items[0].id;
					item.itemDetailId = response.data.items[0].itemDetailId;
					setStockRecId(response.data.id);
					setItems([...items, item]);
					//	maintain current page
					setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
					//	update total items count
					setTotalItemsCount(totalItemsCount + 1);
				}
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return fnSave(item);
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
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		try {
			setNetworkRequest(true);
			switch (confirmDialogEvtName) {
				case 'delete':
					await storeController.deleteStockRecItem(entityToEdit.itemDetailId);
					//	find index position of deleted item in items arr
					const indexPos = items.findIndex(i => i.id == entityToEdit.id);
					if(indexPos > -1){
						//	cut out deleted item found at index position
						items.splice(indexPos, 1);
						setItems([...items]);
						/*  MAINTAIN CURRENT PAGE.	*/
						setCurrentPage(Math.ceil((totalItemsCount - 1) / pageSize));
						setTotalItemsCount(totalItemsCount - 1);
						toast.success('Delete successful');
					}
					break;
				case 'saveRecToSales':
				case 'saveRecToStore':
					setDropDownMsg("Please select Outpost")
					setShowDropDownModal(true);
					break;
				case "deleteStockRec":
					await storeController.deleteStockRec(stockRecId);
					resetPageStates();
					//	navigate back to this page which will cause reset of page states
					navigate("/store/item/reg/0");
					break;
				case "exportToPDF":
					await storeController.exportToPDF(stockRecId);
					break;
			}
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

    const tableProps = {
        //	table header
        headers: ['Item Name', 'Total Qty', 'Type', 'Qty/Pkg', 'Exp. Date', 'Unit Stock', 'Unit Sales', 'Pkg Stock', 'Pkg Sales', "Total", 
			"Vendor", "Cash", "Credit", 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'qty', 'qtyType', 'qtyPerPkg', 'expDate', 'unitStockPrice', 'unitSalesPrice', 'pkgStockPrice', 'pkgSalesPrice', 
			"purchaseAmount", "vendorName", "cashPurchaseAmount", "creditPurchaseAmount"],
		//	React Menu
		menus: {
			ReactMenu,
			menuItems,
			menuItemClick: handleTableReactMenuItemClick,
		}
    };
    
    //	setup table data from fetched stock record
    const buildTableData = (arr = []) => {
        const tableArr = [];
        arr.forEach(item => {
            const dtoItem = new ItemRegDTO();
            dtoItem.id = item.id;
            dtoItem.itemDetailId = item.itemDetailId;
            dtoItem.itemName = item.itemName;
            dtoItem.qty = item.qty;
            dtoItem.expDate = item.expDate;
            dtoItem.qtyPerPkg = item.qtyPerPkg;
            dtoItem.unitStockPrice = item.unitStockPrice;
            dtoItem.pkgStockPrice = item.pkgStockPrice;
            dtoItem.unitSalesPrice = item.unitSalesPrice;
            dtoItem.pkgSalesPrice = item.pkgSalesPrice;
            dtoItem.sectionName = item.tractName;
            dtoItem.cashPurchaseAmount = item.cashPurchaseAmount;
            
            const pkg = new Packaging();
            pkg.id = item.pkgId;
            pkg.name = item.pkgName;
            dtoItem.pkg = pkg;
    
            const vendor = new Vendor();
            vendor.id = item.vendorId;
            vendor.name = item.vendorName;
            dtoItem.vendor = vendor;
            
            const tract = new Tract();
            tract.id = item.tractId;
            tract.name = item.tractName;
            dtoItem.tract = tract;

            tableArr.push(dtoItem);
        });
        /*	sorting the array is IMPORTANT as it prevents the items array from behaving unexpectedly
            when working with pagination.
            At first, when the pagination number is first clicked, the unexpected behaviour is, the 
            elements in the items array are rearranged from the order the were initially	*/
        tableArr.sort((a , b) => a.itemDetailId - b.itemDetailId);
        return tableArr;
    };

    const handleCloseModal = () => {
		setEntityToEdit(null);
        setShowFormModal(false);
        setShowConfirmModal(false);
        setShowDropDownModal(false);
    };

    return (
		<>
            {/* Offcanvas Sidebar for small screens */}
            <div className="d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center ">
                <div>
                    <OffcanvasMenu menuItems={storeItemRegOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}} >Restock</span>
                        <FaStoreAlt className="text-white" size={"30px"} />
                    </h2>
                </div>
                <p className='text-center m-2'>Please note, sales prices set here will reflect on old stock!</p>
            </div>
            <div className="container-fluid">
                <div className="row">
                    {/* Sidebar for large screens */}
                    <aside className="col-3 p-3 d-none d-md-block bg-light shadow-lg">
                        <h3>Item Details</h3>
                        <RestockForm fnSave={fnSave} networkRequest={networkRequest} dbItemOptions={dbItemOptions} />
                    </aside>

                    {/* Main Content */}
                    <main className="p-3 col-md-9 col-12">
                        <TableMain tableProps={tableProps} tableData={pagedData} />
                        <div className="mt-3">
                            <PaginationLite
                                itemCount={totalItemsCount}
                                pageSize={pageSize}
                                setPageChanged={setPageChanged}
                                pageNumber={currentPage}
                            />
                        </div>
                    </main>
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={commitStockRecord}
                message={dropDownMsg}
                options={outpostOptions}
            />

            <Modal show={showFormModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Restock Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RestockForm fnSave={fnSave} data={entityToEdit} networkRequest={networkRequest} dbItemOptions={dbItemOptions} />
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
            </Modal>
        </>
    )
}

export default Restock;