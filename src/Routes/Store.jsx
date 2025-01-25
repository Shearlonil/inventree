import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FaStoreAlt } from "react-icons/fa";
import { format } from "date-fns";

import StoreFormInputs from "../Components/StoreComp/StoreFormInputs";
import MyOffcanvasMenu from "../Components/MyOffcanvasMenu";
import { storeSubMenu } from "../../data";
import TableMain from "../Components/TableView/TableMain";
import ReactMenu from "../Components/ReactMenu";
import { ItemRegDTO } from "../Entities/ItemRegDTO";

const Store = () => {
	const [items, setItems] = useState([]);
	const [showModal, setShowModal] = useState(false);

    //	menus for the ellipse menu-button
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        {
            name: 'Edit', onClickParams: {evtName: 'edit' }
        },
    ];

	const tableData = [
		{itemName: 'PREGMOM PLUS TABLETS (DARAVIT)', qty: 100, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'CEFIXIME SUSP 100ML (AQUIXIM)', qty: 9000, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'ERYTHROMYCIN TAB 500MG (ERYTHROCARE)', qty: 453322, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'CIPROTAB-TN TABLETS 500/600MG', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'METHYLATED SPIRIT 200MLS', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'ERYTHROMYCIN SUSP. 125MG (TUYIL)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'GRIPE WATER 100MLS (WOODWARDS)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'ASOMEX 5MG TAB (S-AMLODIPINE)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'METOCLOPRAMIDE INJ 10MG (MAXOLON)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'BROMAZEPAM (BROMATAN) 1.5MG', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'ERYTHROMYCIN 500MG TAB. (NEMEL)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
		{itemName: 'STREPSIL LOZENGES (12TABS/BLISTER)', qty: 1, qtyType: "unit", qtyPerPkg: 1, expData: null, unitStockPrice: 2, unitSalesPrice: 4, packStockPrice: 7, pakcSalesPrice: 4, sectionName: "Pharmacy", totalAmount: 9788800, vendor: "", cashAmount: 6, creditAmount: 0},
	];

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleShowModal = () => setShowModal(true);

    const handleReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
				console.log('deleting..', entity);
                break;
            case 'edit':
				console.log('editing..', entity);
                break;
        }
    };

	const submitData = (data) => {
		const item = new ItemRegDTO();
		item.itemName = data.item_name;
		item.qty = data.total_qty;
		item.qtyType = data.qty_type;
		item.expDate = format(data.expDate, "yyyy-MM-dd");
		item.qtyPerPkg = data.qty_per_pkg;
		item.unitStockPrice = data.unit_stock;
		item.unitSalesPrice = data.unit_sales;
		item.pkgStockPrice = data.pkg_stock_price;
		item.pkgSalesPrice = data.pkg_sales_price;
		item.sectionName = data.section;
		item.vendorName = data.vendor;
		item.cashPurchaseAmount = data.amount_paid;
		setItems([...items, item]);
		
		console.log(data);
	};

    const tableProps = {
        //	table header
        headers: ['Item Name', 'Total Qty', 'Type', 'Qty/Pkg', 'Exp. Date', 'Unit Stock', 'Unit Sales', 'Pack Stock', 'Pack Sales', 'Dept.', "Total", "Vendor", "Cash", "Credit", 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'qty', 'qtyType', 'qtyPerPkg', 'expDate', 'unitStockPrice', 'unitSalesPrice', 'pkgStockPrice', 'pkgSalesPrice', 'sectionName', "purchaseAmount", "vendorName", "cashPurchaseAmount", "creditPurchaseAmount"],
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
			<div className="container-fluid row">
				{/* Sidebar for large screens */}
				<aside className="col-3 p-3 d-none d-md-block bg-light shadow-lg">
					<h3>Add New Item</h3>
					<StoreFormInputs submitData={submitData} />
				</aside>

				{/* Main Content */}
				<main className="p-3 col-md-9 col-12">
					<TableMain tableProps={tableProps} tableData={items} />
				</main>
			</div>

			<Modal show={showModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Add Item</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<StoreFormInputs submitData={submitData} />
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</>
	);
};

export default Store;
