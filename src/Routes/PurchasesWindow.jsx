import React, { useState } from "react";
import ReactMenu from "../Components/ReactMenu";
import OffcanvasMenu from "../Components/OffcanvasMenu";
import SVG from "../assets/Svg";
import TableMain from "../Components/TableView/TableMain";
import PaginationLite from "../Components/PaginationLite";
import ConfirmDialog from "../Components/DialogBoxes/ConfirmDialog";

const PurchasesWindow = () => {
	const [entityToEdit, setEntityToEdit] = useState(null);
	const [items, setItems] = useState([]);
	//	for confirmation dialog
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
	
	//	for pagination
	const [pageSize] = useState(10);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	  
	//  data returned from DataPagination
	const [pagedData, setPagedData] = useState([]);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'deleteItem'} },
        {
            name: 'Edit Vendor', onClickParams: {evtName: 'editVendor' }
        },
    ];

	const purchasesSubMenu = [
		{ label: "Search By Purchase No.", onClickParams: {evtName: 'searchByNo'} },
		{ label: "Delete", onClickParams: {evtName: 'deleteStockRecords'} },
		{ label: "Filter By Cash", onClickParams: {evtName: 'viewCashPurchases'} },
		{ label: "Filter By Credit", onClickParams: {evtName: 'deleteStockRec'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
	];

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(items.slice(startIndex, startIndex + pageSize));
    };

	const handleCloseModal = () => {
		setShowConfirmModal(false);
	};

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'deleteItem':
				//	ask if sure to delete
				setEntityToEdit(entity);
				setDisplayMsg(`Delete item ${entity.itemName}?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
            case 'editVendor':
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByNo':
                break;
            case 'deleteStockRecords':
                break;
            case 'viewCashPurchases':
                break;
            case 'deleteStockRec':
                break;
            case 'exportToPDF':
                break;
            case 'search':
                break;
        }
	}
	
	const handleConfirmOK = async () => {}
	
	const tableProps = {
		//	table header
		headers: ['Item Name', 'Total Qty', 'Type', 'Qty/Pkg', 'Exp. Date', 'Unit Stock', 'Unit Sales', 'Pkg Stock', 'Pkg Sales', 'Dept.', "Total", 
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
			<div className="d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<div>
					<OffcanvasMenu menuItems={purchasesSubMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Purchases</span>
						<img src={SVG.purchases_two_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <p className='text-center m-2'>Search purchases by date or number to view, update, delete etc</p>
			</div>
			<div className="container-fluid" style={{minHeight: '65vh'}}>
				<div className="row">
					{/* Main Content */}
					<TableMain tableProps={tableProps} tableData={pagedData} />
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
		</>
	);
};

export default PurchasesWindow;
