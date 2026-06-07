import React, { useEffect, useRef, useState } from "react";
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import Datetime from 'react-datetime';
import { toast } from "react-toastify";
import { format } from 'date-fns';
import { toDate } from "date-fns-tz"
import { useLocation, useNavigate } from "react-router-dom";
import numeral from "numeral";
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable'

import ReactMenu from "../../Components/ReactMenu";
import OffcanvasMenu from "../../Components/OffcanvasMenu";
import SVG from "../../assets/Svg";
import TableMain from "../../Components/TableView/TableMain";
import PaginationLite from "../../Components/PaginationLite";
import ConfirmDialog from "../../Components/DialogBoxes/ConfirmDialog";
import ErrorMessage from '../../Components/ErrorMessage';
import { useAuthUser } from "../../app-context/user-context";
import handleErrMsg from "../../Utils/error-handler";
import { Vendor } from "../../Entities/Vendor";
import { ItemRegDTO } from "../../Entities/ItemRegDTO";
import { ThreeDotLoading } from "../../Components/react-loading-indicators/Indicator";
import InputDialog from "../../Components/DialogBoxes/InputDialog";
import DropDownDialog from "../../Components/DialogBoxes/DropDownDialog";
import PurchasesUpdateForm from "../../Components/InventoryComp/PurchasesUpdateForm";
import DateDialog from '../../Components/DialogBoxes/DateDialog';
import StartEndDateSearch from "../../Components/StartEndDateSearch";
import useGenericController from "../../Controllers/generic-controller-hook";
import useInventoryController from "../../Controllers/inventory-controller-hook";
import { positiveNumberMiscParamSchema } from "../../Utils/yup-schema-validator/input-validator";

const PurchasesWindow = () => {
	applyPlugin(jsPDF);
	const controllerRef = useRef(new AbortController());

	const navigate = useNavigate();
	const location = useLocation();
	
    const { paginatePurchasesIdSearch, paginatePurchasesDateSearch, findItemPurchases, updatePurchasedItem, changePurchasesVendor, deletePurchasedItem } = useInventoryController();
    const { performGetRequests } = useGenericController();
	const { authUser } = useAuthUser();
	const user = authUser();

	const schema = object().shape(
		{
			startDate: date(),
			endDate: date().min(ref("startDate"), "please update start date"),
		}
	);

	const {
		handleSubmit,
		control,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
	  	resolver: yupResolver(schema)
	});
	const startDate = watch("startDate");
  
	const [networkRequest, setNetworkRequest] = useState(false);
	const [entity, setEntity] = useState(null);
	const [selectedDropDownEntity, setSelectedDropDownEntity] = useState(null);
	const [items, setItems] = useState([]);
	//	for confirmation dialog
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
	const [showFormModal, setShowFormModal] = useState(false);
	//	for date dialog
	const [showDateModal, setShowDateModal] = useState(false);
	//	for input dialog
	const [showInputModal, setShowInputModal] = useState(false);
	//	for vendor drop down dialog
	const [dropDownMsg, setDropDownMsg] = useState("");
	const [showDropDownModal, setShowDropDownModal] = useState(false);

	const [reportTitle, setReportTitle] = useState("Purchases");
	const [filename, setFilename] = useState("");
	const [beginDate, setBeginDate] = useState("");
	const [endDate, setEndDate] = useState("");
	
	//	for pagination
	const [pageSize] = useState(10);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	  
	//  data returned from DataPagination
	const [pagedData, setPagedData] = useState([]);

	const [itemOptions, setItemOptions] = useState([]);
	const [vendorOptions, setVendorOptions] = useState([]);
	const [dropDownOptions, setDropDownOptions] = useState([]);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Edit', onClickParams: {evtName: 'edit' } },
        { name: 'Delete', onClickParams: {evtName: 'deleteItem'} },
        { name: 'Edit Vendor', onClickParams: {evtName: 'updateVendor' } },
    ];

	const purchasesOffCanvasMenu = [
		{ label: "Search By Purchase No.", onClickParams: {evtName: 'searchByNo'} },
		{ label: "Search By Item", onClickParams: {evtName: 'searchByItem'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
		{ label: "Export to Excel", onClickParams: {evtName: 'xlsxExport'} },
	];
		
	useEffect( () => {
		if(user.hasAuth('REPORT_WINDOW')){
			initialize();
		}else {
			toast.error("Account doesn't support viewing this page. Please contact your supervisor");
			navigate('/404');
		}
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
	}, [location.pathname]);

	const initialize = async () => {
		try {
            controllerRef.current = new AbortController();
			//  find active vendors and items
			const urls = [ '/api/items/transactions/mono', '/api/vendors/active' ];
			const response = await genericController.performGetRequests(urls, controllerRef.current.signal);
			const { 0: itemsRequest, 1: vendorsRequest } = response;

            //	check if the request to fetch items doesn't fail before setting values to display
            if(itemsRequest){
				setItemOptions(itemsRequest.data.map(item => ({label: item.itemName, value: item})));
            }

			if(vendorsRequest){
				setVendorOptions(vendorsRequest.data.map( vendor => ({label: vendor.name, value: vendor})));
			}

		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
				return;
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	};

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(items.slice(startIndex, startIndex + pageSize));
    };

	const handleCloseModal = () => {
		setShowConfirmModal(false);
		setShowInputModal(false);
		setShowFormModal(false);
		setShowDateModal(false);
		setEntity(null);
	};
	
	const handleDropDownCloseModal = () => {
		/*	a separate method is created for handling drop down modal and not using the handleCloseModal above because of updateVendor function.
			This method requires closing of dropdown dialog and opening of confirm dialog. If a single method handles the closing of modals in this case
			handleCloseModal, then confirm dialog won't show after drop down as the state responsible for showing confirm dialog will be set to false
			in handleCloseModal when closing drop down dialog	*/
		setShowDropDownModal(false);
	}

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
		setConfirmDialogEvtName(onclickParams.evtName);
        switch (onclickParams.evtName) {
            case 'deleteItem':
				//	ask if sure to delete
				setEntity(entity);
				setDisplayMsg(`Delete item ${entity.itemName}?`);
				setShowConfirmModal(true);
                break;
            case 'updateVendor':
				setEntity(entity);
				setConfirmDialogEvtName('updateVendor');
				setDropDownOptions(vendorOptions)
				setDropDownMsg("Please select Vendor")
				setShowDropDownModal(true);
                break;
            case 'edit':
				setEntity(entity);
				setShowFormModal(true);
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByNo':
				setDisplayMsg("Please enter Purchases No.");
				setShowInputModal(true);
                break;
            case 'exportToPDF':
				if(items.length > 0){
					pdfExport();
				}
                break;
            case 'xlsxExport':
				if(items.length > 0){
					xlsxExport();
				}
                break;
            case 'searchByItem':
				setConfirmDialogEvtName('searchByItem');
				setDropDownOptions(itemOptions)
				setDropDownMsg("Please select Item")
				setShowDropDownModal(true);
                break;
        }
	}

	const dropDownItemSelected = async (dropDownItem) => {
		switch (confirmDialogEvtName) {
            case 'searchByItem':
				setSelectedDropDownEntity(dropDownItem);
				setShowDateModal(true);
                break;
            case 'updateVendor':
				setSelectedDropDownEntity(dropDownItem);
				//	ask to update vendor
				setDisplayMsg(`Update ${entity.itemName}, change vendor to ${dropDownItem.name}?`);
				setShowConfirmModal(true);
                break;
        }
	};
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'deleteItem':
				fnDeletePurchasedItem();
                break;
            case 'updateVendor':
				fnChangePurchasesVendor();
                break;
        }
	}

	const idSearch = async (id) => {
		try {
			positiveNumberMiscParamSchema.validateSync(id);
		} catch (error) {
			toast.error(error.message);
			return;
		}
		try {
			setNetworkRequest(true);
			resetAbortController();
			setPagedData([]);
			setItems([]);
			setCurrentPage(1);
			setTotalItemsCount(0);

			setReportTitle(`Purchases Report with ID: ${id}`);
			setFilename(`Purchases Report with ID: ${id}`);

			setValue('startDate', null);
			setValue('endDate', null);
	
			const response = await paginatePurchasesIdSearch(id, controllerRef.current.signal);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data) {
				setItems(buildTableData(response.data.content));
				//	setPagedData(buildTableData(response.data.content));
				setTotalItemsCount(response.data.page.totalElements);
			}
			setNetworkRequest(false);
		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	}

	const fnSearch = async (data) => {
		try {
			if (data.startDate && data.endDate) {
				const startDate = format(data.startDate, "yyyy-MM-dd") + "T00:00:00.000Z";
				const endDate = format(data.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
				setBeginDate(startDate);
				setEndDate(endDate);

				setNetworkRequest(true);
				resetAbortController();
				setCurrentPage(1);
				setTotalItemsCount(0);
				setItems([]);
				setPagedData([]);

				setReportTitle(`Purchases Report from ${format(new Date(data.startDate), "dd/MM/yyyy")} to ${format(new Date(data.endDate), "dd/MM/yyyy")}`);
				setFilename(`Purchases Report from ${format(new Date(data.startDate), "dd/MM/yyyy")} to ${format(new Date(data.endDate), "dd/MM/yyyy")}`);

				const response = await paginatePurchasesDateSearch(startDate, endDate, controllerRef.current.signal);
				if(response && response.data){
					setItems(buildTableData(response.data.content));
					setTotalItemsCount(response.data.page.totalElements);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	}
	
	const itemDateSearch = async (date) => {
        try {
			if (date.startDate && date.endDate) {
				const startDate = format(date.startDate, "yyyy-MM-dd") + "T00:00:00.000Z";
				const endDate = format(date.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
				setBeginDate(startDate);
				setEndDate(endDate);

				setNetworkRequest(true);
				resetAbortController();
				setItems([]);
				setPagedData([]);
				setCurrentPage(1);
				setTotalItemsCount(0);

				setReportTitle(`Purchases Report for ${selectedDropDownEntity.itemName} from ${format(date.startDate, "dd/MM/yyyy")} to ${format(date.endDate, "dd/MM/yyyy")}`);
				setFilename(`Purchases Report for ${selectedDropDownEntity.itemName} from ${format(date.startDate, "dd/MM/yyyy")} to ${format(date.endDate, "dd/MM/yyyy")}`);

				const response = await findItemPurchases(selectedDropDownEntity.id, startDate, endDate, controllerRef.current.signal);
				if(response && response.data && response.data.length > 0){
					setItems(buildTableData(response.data));
					setTotalItemsCount(response.data.length);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	}
	
	const fnSave = async (item) => {
		try {
			setNetworkRequest(true);
				resetAbortController();
			await updatePurchasedItem(item, controllerRef.current.signal);
			//	find index position of edited item in items arr
			const indexPos = pagedData.findIndex(i => i.id === item.id);
			if(indexPos > -1){
				//	replace old item found at index position in items array with edited one
				pagedData.splice(indexPos, 1, item);
				setPagedData([...pagedData]);
				toast.success('Update successful');
			}
			setNetworkRequest(false);
		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	}
	
	const fnChangePurchasesVendor = async () => {
		try {
			setNetworkRequest(true);
			resetAbortController();
			const vendor = new Vendor();
			vendor.id = selectedDropDownEntity.id;
			vendor.name = selectedDropDownEntity.name;

			const temp = {...entity};
			temp.vendor = vendor;

			await changePurchasesVendor(entity, controllerRef.current.signal);
			entity.vendor = vendor;
			//	find index position of edited item in items arr
			const indexPos = pagedData.findIndex(i => i.id === temp.id);
			if(indexPos > -1){
				//	replace old item found at index position in items array with edited one
				pagedData.splice(indexPos, 1, temp);
				setPagedData([...pagedData]);
				toast.success('Update successful');
			}

			setSelectedDropDownEntity(null);
			setEntity(null);
			setNetworkRequest(false);
		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	}
	
	const fnDeletePurchasedItem = async () => {
		try {
			setNetworkRequest(true);
			resetAbortController();
			await deletePurchasedItem(entity, controllerRef.current.signal);
			//	find index position of edited item in items arr
			const indexPos = pagedData.findIndex(i => i.id === entity.id);
			if(indexPos > -1){
				//	cut out deleted item found at index position
				items.splice(indexPos, 1);
				setItems([...items]);
				/*  MAINTAIN CURRENT PAGE.	*/
				setCurrentPage(Math.ceil((totalItemsCount - 1) / pageSize));
				setTotalItemsCount(totalItemsCount - 1);
				toast.success('Delete successful');
			}

			setSelectedDropDownEntity(null);
			setEntity(null);
			setNetworkRequest(false);
		} catch (error) {
			setNetworkRequest(false);
            if (error.name === 'AbortError' || error.name === 'CanceledError' || (error.response?.status === 500 && error.response?.data.message === "Invalid Token received!")) {
                // Request was intentionally aborted or Invalid Bearer Token received which requires refresh, handle silently
                return;
            }
			// Incase of 401 Unauthorized, navigate to 404
			if(error.response?.status === 401){
				navigate('/404');
			}
			// display error message
			toast.error(handleErrMsg(error).msg);
		}
	}
	
	const pdfExport = () => {
		const unit = "pt";
		const size = "A4"; // Use A1, A2, A3 or A4
		const orientation = "landscape"; // portrait or landscape
		const fileExtension = ".pdf";

		const marginLeft = 40;
		const doc = new jsPDF(orientation, unit, size);

		doc.setFontSize(20);

		const title = reportTitle;

		doc.text(title, marginLeft, 40);

		doc.autoTable({
			styles: { theme: 'striped' },
			margin: { top: 60 },
			body: items,
			columns: [
				// { header: 'Receipt No.', dataKey: 'receipt_id' },
				{ header: 'Description', dataKey: 'itemName' },
				{ header: 'Qty', dataKey: 'qty' },
				{ header: 'Type', dataKey: 'qtyType' },
				{ header: 'Qty/Pkg', dataKey: 'qtyPerPkg' },
				{ header: 'Unit Stock', dataKey: 'unitStockPrice' },
				{ header: 'Pkg Stock', dataKey: 'pkgStockPrice' },
				{ header: 'Date', dataKey: 'creationDate' },
				{ header: 'Amount', dataKey: 'purchaseAmount' },
				{ header: 'Dept.', dataKey: 'tractName' },
				{ header: 'Vendor', dataKey: 'vendorName' },
				{ header: 'Cash', dataKey: 'cashPurchaseAmount' },
				{ header: 'Credit', dataKey: 'creditPurchaseAmount' },
				{ header: 'Purchase No.', dataKey: 'id' },
			],
		});
		doc.save(`${filename}` + fileExtension);
	}
	
	const xlsxExport = () => {
		//  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js

		const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
		const fileExtension = ".xlsx";

		const Heading = [ {itemName: "Description", qty: "Total Qty", qtyType: "Type", qtyPerPkg: "Qty/Pkg", unitStockPrice: "Unit Stock Price", pkgStockPrice: "Pkg Stock Price", 
			creationDate: "Date", purchaseAmount: "Amount", tractName: "Dept.", vendorName: "Vendor", cashPurchaseAmount: "Cash", creditPurchaseAmount: "Credit", id: "Purchase No." } ];
		
		const temp = [];
		items.forEach(t => {
			const a = {...t.toJSON()};
			delete a.itemDetailId;
			delete a.barcode;
			delete a.pkgId;
            delete a.vendorId;
            delete a.tractId;
			delete a.status;
			delete a.expDate;
			delete a.pkgSalesPrice;
			delete a.unitSalesPrice;
			temp.push(a);
		});
		const wscols = [
			{ wch: Math.max(...items.map(datum => datum.itemName.length)) },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 15 },
		];
		const ws = XLSX.utils.json_to_sheet(Heading, {
			header: ["itemName", "qty", "qtyType", "qtyPerPkg", "unitStockPrice", "pkgStockPrice", "creationDate", "purchaseAmount", "tractName", "vendorName", 
				"cashPurchaseAmount", "creditPurchaseAmount", "id"],
			skipHeader: true,
			origin: 0 //ok
		});
		ws["!cols"] = wscols;
		XLSX.utils.sheet_add_json(ws, temp, {
			header: ["itemName", "qty", "qtyType", "qtyPerPkg", "unitStockPrice", "pkgStockPrice", "creationDate", "purchaseAmount", "tractName", "vendorName", 
				"cashPurchaseAmount", "creditPurchaseAmount", "id"],
			skipHeader: true,
			origin: -1 //ok
		});
		const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
		const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
		const finalData = new Blob([excelBuffer], { type: fileType });
		FileSaver.saveAs(finalData, `${filename}` + fileExtension);
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
			dtoItem.qtyType = item.qtyType;
			dtoItem.creationDate = item.creationDate;
			dtoItem.qtyPerPkg = item.qtyPerPkg;
			dtoItem.unitStockPrice = item.unitStockPrice;
			dtoItem.pkgStockPrice = numeral(item.unitStockPrice).multiply(item.qtyPerPkg).value();
			dtoItem.tractName = item.tractName;
			dtoItem.cashPurchaseAmount = item.cashPurchaseAmount;
	
			const vendor = new Vendor();
			vendor.id = item.vendorId;
			vendor.name = item.vendorName;
			dtoItem.vendor = vendor;

			tableArr.push(dtoItem);
		});
		/*	sorting the array is IMPORTANT as it prevents the items array from behaving unexpectedly
			when working with pagination.
			At first, when the pagination number is first clicked, the unexpected behaviour is, the 
			elements in the items array are rearranged from the order the were initially	*/
		tableArr.sort((a , b) => a.id - b.id);
		return tableArr;
	};
	
	const tableProps = {
		//	table header
		headers: ['Item Name', 'Total Qty', 'Type', 'Qty/Pkg', 'Unit Stock', 'Pkg Stock', 'Date', "Total", 'Dept.', 
			"Vendor", "Cash", "Credit", 'Purchase No.', 'Options'],
		//	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
		objectProps: ['itemName', 'qty', 'qtyType', 'qtyPerPkg', 'unitStockPrice', 'pkgStockPrice', 'creationDate', "purchaseAmount", 'tractName', 
			"vendorName", "cashPurchaseAmount", "creditPurchaseAmount", 'id'],
		//	React Menu
		menus: {
			ReactMenu,
			menuItems,
			menuItemClick: handleTableReactMenuItemClick,
		}
	};

    const resetAbortController = () => {
        // Cancel previous request if it exists
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
    };

	return (
		<>
			<div className="d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<OffcanvasMenu menuItems={purchasesOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Purchases</span>
						<img src={SVG.purchases_two_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <p className='text-center m-2'>Search purchases by date or number to view, update, delete etc</p>
			</div>
			<div className="container-fluid" style={{minHeight: '65vh'}}>
				<StartEndDateSearch networkRequest={networkRequest} fnSearch={fnSearch} />
				<div className={`row mt-2 ${networkRequest ? 'disabledDiv' : ''}`}>
					{/* Main Content */}
					<TableMain tableProps={tableProps} tableData={pagedData} />
					{/* PaginationLite is engulfed in a span tag because of the padding applied to the span tags to keep the PaginationLite component farther
						away from the edge of the screen
					*/}
					<span className="px-3">
						<PaginationLite
							itemCount={totalItemsCount}
							pageSize={pageSize}
							setPageChanged={setPageChanged}
							pageNumber={currentPage}
						/>
					</span>
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
				handleConfirm={idSearch}
				message={displayMsg}
			/>
            <DateDialog
                showRadio={false}
                show={showDateModal}
                handleClose={handleCloseModal}
                handleConfirm={itemDateSearch}
                message={"Select date range"}
            />
			<DropDownDialog
				show={showDropDownModal}
				handleClose={handleDropDownCloseModal}
				handleConfirm={dropDownItemSelected}
				message={dropDownMsg}
				optionsLoading={networkRequest}
				options={dropDownOptions}
			/>

			<Modal show={showFormModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Item</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<PurchasesUpdateForm fnSave={fnSave} data={entity} networkRequest={networkRequest} />
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
		</>
	);
};

export default PurchasesWindow;
