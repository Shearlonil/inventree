import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStoreAlt } from "react-icons/fa";

import StoreFormInputs from "../../Components/StoreComp/StoreFormInputs";
import MyOffcanvasMenu from "../../Components/MyOffcanvasMenu";
import { storeSubMenu } from "../../../data";
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
	const [showModal, setShowModal] = useState(false);

	// for pagination
	const [pageSize] = useState(3);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
  
	//  data returned from DataPagination
	const [pagedData, setPagedData] = useState([]);

    //	menus for the table menu-button
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        {
            name: 'Edit', onClickParams: {evtName: 'edit' }
        },
    ];
	
	useEffect( () => {
		if(stock_rec_id > 0){
			initialize();
		}else {
			setItems([]);
			setPagedData([]);
			setTotalItemsCount(0);
			setCurrentPage(1);
		}
	}, [stock_rec_id]);

	const initialize = async () => {
		try {
			setNetworkRequest(true);
	
			const response = await storeController.findUnverifiedStockRecById(stock_rec_id);
	
			//	check if the request to fetch item doesn't fail before setting values to display
			if (response && response.data) {
				setItems(buildTableData(response.data.items));
				setTotalItemsCount(response.data.items.length);
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
		setShowModal(false);
	};

	const handleShowModal = () => {
		setEntityToEdit(null);
		setShowModal(true);
	};

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(items.slice(startIndex, startIndex + pageSize));
    };

    const handleReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
				console.log('deleting..', entity);
                break;
            case 'edit':
				console.log('editing..', entity);
				setEntityToEdit(entity);
				setShowModal(true);
                break;
        }
    };
	
	const fnSave = async (item) => {
		try {
			setNetworkRequest(true);
			if(item.id){
				//	if data has id, then update mode
				await storeController.updateStockRecItem(item);
				//	find index position of edited item in items arr
				const indexPos = items.findIndex(i => i.id === item.id);
				if(indexPos){
					//	reaplace old item found at index position in items array with edited one
					items.splice(indexPos, 1, item);
					setItems([...items]);
					const startIndex = (currentPage - 1) * pageSize;
					setPagedData(items.slice(startIndex, startIndex + pageSize));
				}
			}else {
				// 	else, create new item
				let response = await storeController.persistStockRecItem(stockRecId, item);
				if(response && response.status === 200){
					item.id = response.data.items[0].id;
					item.itemDetailId = response.data.items[0].itemDetailId;
					setStockRecId(response.data.id);
					setItems([...items, item]);
					setTotalItemsCount(totalItemsCount + 1);
					setCurrentPage(Math.ceil(totalItemsCount / pageSize));
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
			// throw error;
		}
	}

    const tableProps = {
        //	table header
        headers: ['Item Name', 'Total Qty', 'Type', 'Qty/Pkg', 'Exp. Date', 'Unit Stock', 'Unit Sales', 'Pack Stock', 'Pack Sales', 'Dept.', "Total", "Vendor", "Cash", "Credit", 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'qty', 'qtyType', 'qtyPerPkg', 'expDate', 'unitStockPrice', 'unitSalesPrice', 'pkgStockPrice', 'pkgSalesPrice', 'tractName', "purchaseAmount", "vendorName", "cashPurchaseAmount", "creditPurchaseAmount"],
		//	React Menu
		menus: {
			ReactMenu,
			menuItems,
			menuItemClick: handleReactMenuItemClick,
		}
    };

	return (
		<>
			{/* Offcanvas Sidebar for small screens */}
			<div className="d-flex justify-content-between mt-2">
				<div>
					<MyOffcanvasMenu
						menuItems={storeSubMenu}
						handleShowModal={handleShowModal}
						handleCloseModal={handleCloseModal}
					/>
				</div>
				<div className="text-center d-flex">
					<h2 className="text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
						<span className="me-4">Store</span>
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

			<Modal show={showModal} onHide={handleCloseModal}>
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
