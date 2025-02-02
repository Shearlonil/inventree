import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStoreAlt } from "react-icons/fa";

import StoreFormInputs from "../../Components/StoreComp/StoreFormInputs";
import OffcanvasMenu from "../../Components/OffcanvasMenu";
import TableMain from "../../Components/TableView/TableMain";
import ReactMenu from "../../Components/ReactMenu";
import storeController from "../../Controllers/store-controller";
import { useAuth } from "../../app-context/auth-user-context";
import handleErrMsg from "../../Utils/error-handler";
import { ItemRegDTO } from "../../Entities/ItemRegDTO";
import { Packaging } from "../../Entities/Packaging";
import { Vendor } from "../../Entities/Vendor";
import { Tract } from "../../Entities/Tract";
import PaginationLite from "../../Components/PaginationLite";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import DropDownDialog from "../../Components/DialogBoxes/DropDownDialog";
import outpostController from "../../Controllers/outpost-controller";

const StoreItemReg = () => {
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
	const [pageSize] = useState(3);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
  
	//  data returned from DataPagination
	const [pagedData, setPagedData] = useState([]);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        {
            name: 'Edit', onClickParams: {evtName: 'edit' }
        },
    ];

	const storeItemRegOffCanvasMenu = [
		{ label: "Show Input form", onClickParams: {evtName: 'showFormInput'} },
		{ label: "Save To Sales/Shelf", onClickParams: {evtName: 'saveRecToSales'} },
		{ label: "Save To Store", onClickParams: {evtName: 'saveRecToStore'} },
		{ label: "Delete Record", onClickParams: {evtName: 'deleteStockRec'} },
		{ label: "Search", onClickParams: {evtName: 'search'} },
		{ label: "Save to PDF", onClickParams: {evtName: 'saveToPDF'} },
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
			setItems([]);
			setPagedData([]);
			setTotalItemsCount(0);
			setCurrentPage(1);
			const response = await outpostController.findAll();
	
			//	check if the request to fetch item doesn't fail before setting values to display
			if (response && response.data) {
                setOutpostOptions(response.data.map( outpost => ({label: outpost.name, value: outpost.id})));
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
	
			const response = await storeController.findUnverifiedStockRecById(stock_rec_id);
			const outpostResponse = await outpostController.findAll();
	
			//	check if the request to fetch item doesn't fail before setting values to display
			if (response && response.data) {
				setItems(buildTableData(response.data.items));
				setTotalItemsCount(response.data.items.length);
			}
	
			//	check if the request to fetch outposts doesn't fail before setting values to display
			if (outpostResponse && outpostResponse.data) {
                setOutpostOptions(outpostResponse.data.map( outpost => ({label: outpost.name, value: outpost.id})));
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
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
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
		tableArr.sort((a , b) => a.id - b.id);
		return tableArr;
	};

	const handleCloseModal = () => {
		setShowFormModal(false);
		setShowConfirmModal(false);
		setShowDropDownModal(false);
	};

	const commitStockRecord = async (outpostId) => {
		try {
			setNetworkRequest(true);
			await storeController.commitStockRecById(stockRecId, outpostId, destination);
			//	reset all variables
			setItems([]);
			setPagedData([])
			setCurrentPage(1);
			setTotalItemsCount(0);
			setEntityToEdit(null);
			setDestination(null);

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
				setDisplayMsg(`Save record with ${items.length} item${items.length > 1 ? 's' : ''}? to Sales/Shelf. Action cannot be undone`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setDestination(2);
				setShowConfirmModal(true);
                break;
            case 'saveRecToStore':
				setDisplayMsg(`Save record with ${items.length} item${items.length > 1 ? 's' : ''}? to store. Action cannot be undone`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setDestination(1);
				setShowConfirmModal(true);
                break;
            case 'deleteStockRec':
                break;
            case 'search':
                break;
            case 'saveToPDF':
                break;
        }
	}
	
	const fnSave = async (item) => {
		try {
			setNetworkRequest(true);
			if(item.id){
				//	if data has id, then update mode
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
				let response = await storeController.persistStockRecItem(stockRecId, item);
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
						//	replace old item found at index position in items array with edited one
						items.splice(indexPos, 1);
						setItems([...items]);
						/*  MAINTAIN CURRENT PAGE.
						normally, we would call setPagedData(response.data.products) here but that isn't necessary because calling setCurrentPage(pageNumber)
						would cause PaginationLite to re-render as currentPage is part of it's useEffect dependencies. This re-render triggers setPageChanged to be
						called with currentPage number.	*/
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
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
	}

    const tableProps = {
        //	table header
        headers: ['Item Name', 'Total Qty', 'Type', 'Qty/Pkg', 'Exp. Date', 'Unit Stock', 'Unit Sales', 'Pack Stock', 'Pack Sales', 'Dept.', "Total", 
			"Vendor", "Cash", "Credit", 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'qty', 'qtyType', 'qtyPerPkg', 'expDate', 'unitStockPrice', 'unitSalesPrice', 'pkgStockPrice', 'pkgSalesPrice', 'tractName', 
			"purchaseAmount", "vendorName", "cashPurchaseAmount", "creditPurchaseAmount"],
		//	React Menu
		menus: {
			ReactMenu,
			menuItems,
			menuItemClick: handleTableReactMenuItemClick,
		}
    };

	return (
		<>
			{/* Offcanvas Sidebar for small screens */}
			<div className="d-flex justify-content-between mt-2">
				<div>
					<OffcanvasMenu menuItems={storeItemRegOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} />
				</div>
				<div className="text-center d-flex">
					<h2 className="text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
						<span className="me-4">Store Item Registration</span>
						<FaStoreAlt className="text-warning" size={"30px"} />
					</h2>
				</div>
				{/* here for the purpose of justify-content-between to make the Store word appear in the middle of the screen */}
				<h1></h1>
			</div>
			<div className="container-fluid">
				<div className="row">
					{/* Sidebar for large screens */}
					<aside className="col-3 p-3 d-none d-md-block bg-light shadow-lg">
						<h3>Add New Item</h3>
						<StoreFormInputs fnSave={fnSave} networkRequest={networkRequest} />
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
					<Modal.Title>Add Item</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<StoreFormInputs fnSave={fnSave} data={entityToEdit} networkRequest={networkRequest} />
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</>
	);
};

export default StoreItemReg;
