import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FaStoreAlt } from "react-icons/fa";

import StoreFormInputs from "../../Components/StoreComp/StoreFormInputs";
import MyOffcanvasMenu from "../../Components/MyOffcanvasMenu";
import { storeSubMenu } from "../../../data";
import TableMain from "../../Components/TableView/TableMain";
import ReactMenu from "../../Components/ReactMenu";

const StoreItemReg = () => {
	const [stockRecId, setStockRecId] = useState(0);
	const [items, setItems] = useState([]);
	const [entityToEdit, setEntityToEdit] = useState(null);
	const [showModal, setShowModal] = useState(false);

	// for pagination
	const [pageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
  
	//  data returned from DataPagination
	const [pagedData, setPagedData] = useState([]);

    //	menus for the table menu-button
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        {
            name: 'Edit', onClickParams: {evtName: 'edit' }
        },
    ];

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleShowModal = () => {
		setEntityToEdit(null);
		setShowModal(true);
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

	const submitData = (stock_rec_id, item) => {
		setStockRecId(stock_rec_id);
		setItems([...items, item]);
	};

	const updateTableData = (item) => {
		setItems([...items, item]);
	};

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
						<StoreFormInputs submitData={submitData} stockRecId={stockRecId} />
					</aside>

					{/* Main Content */}
					<main className="p-3 col-md-9 col-12">
						<TableMain tableProps={tableProps} tableData={items} />
					</main>
				</div>
			</div>

			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Add Itemm</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<StoreFormInputs submitData={submitData} stockRecId={stockRecId} data={entityToEdit} />
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</>
	);
};

export default StoreItemReg;
