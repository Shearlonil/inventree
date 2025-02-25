import React, { useEffect, useState } from "react";
import "react-datetime/css/react-datetime.css";
import { object, date, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import Datetime from 'react-datetime';
import { toast } from "react-toastify";

import ReactMenu from "../Components/ReactMenu";
import OffcanvasMenu from "../Components/OffcanvasMenu";
import SVG from "../assets/Svg";
import TableMain from "../Components/TableView/TableMain";
import PaginationLite from "../Components/PaginationLite";
import ConfirmDialog from "../Components/DialogBoxes/ConfirmDialog";
import ErrorMessage from '../Components/ErrorMessage';
import storeController from "../Controllers/store-controller";
import { useAuth } from "../app-context/auth-user-context";
import handleErrMsg from "../Utils/error-handler";
import { useNavigate } from "react-router-dom";
import { Vendor } from "../Entities/Vendor";
import { ItemRegDTO } from "../Entities/ItemRegDTO";
import { ThreeDotLoading } from "../Components/react-loading-indicators/Indicator";
import InputDialog from "../Components/DialogBoxes/InputDialog";
import vendorController from "../Controllers/vendor-controller";
import DropDownDialog from "../Components/DialogBoxes/DropDownDialog";

const PurchasesWindow = () => {
	const navigate = useNavigate();
		
	const { handleRefresh, logout, authUser } = useAuth();
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
	const [entityToEdit, setEntityToEdit] = useState(null);
	//	indicate where id search or date search, 0 => date search	|	1 => id search
	const [searchMode, setSearchMode] = useState(null);
	//	incase of id search, store in this state
	const [searchedId, setSearchedId] = useState(0);
	//	incase of date search, store in this state
	const [searchedDate, setSearchedDate] = useState(null);
	const [items, setItems] = useState([]);
	//	for confirmation dialog
	const [displayMsg, setDisplayMsg] = useState("");
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
	//	for input dialog
	const [showInputModal, setShowInputModal] = useState(false);
	//	for vendor drop down dialog
	const [dropDownMsg, setDropDownMsg] = useState("");
	const [showDropDownModal, setShowDropDownModal] = useState(false);
	const [vendor, setVendor] = useState({});
	
	//	for pagination
	const [pageSize] = useState(10);
	const [totalItemsCount, setTotalItemsCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	  
	//  data returned from DataPagination
	const [pagedData, setPagedData] = useState([]);
	const [vendorOptions, setVendorOptions] = useState([]);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'deleteItem'} },
        { name: 'Edit Vendor', onClickParams: {evtName: 'updateVendor' } },
        { name: 'View Quantity Mgr', onClickParams: {evtName: 'viewQtyMgr' } },
    ];

	const purchasesOffCanvasMenu = [
		{ label: "Search By Purchase No.", onClickParams: {evtName: 'searchByNo'} },
		// { label: "Delete", onClickParams: {evtName: 'delete'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
	];
		
	useEffect( () => {
		if(user.hasAuth('REPORT_WINDOW')){
			initialize();
		}else {
			toast.error("Account doesn't support viewing this page. Please contact your supervisor");
			navigate('/404');
		}
	}, []);

	const initialize = async () => {
		try {
			const response = await vendorController.fetchAllActive();
			if(response && response.data){
				setVendorOptions(response.data.map( vendor => ({label: vendor.name, value: vendor})));
			}

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

    const setPageChanged = async (pageNumber) => {
		if(currentPage === pageNumber){
			return;
		}
		setCurrentPage(pageNumber);
		switch (searchMode) {
			case 0:
				// 0 date search
				paginateDateSearch(pageNumber);
				break;
			case 1:
				// id search
				paginateIdSearch(pageNumber);
				break;
		}
    };

	const paginateIdSearch = async (pageNumber) => {
		try {
			setNetworkRequest(true);
			setPagedData([]);
			const offset = pageNumber - 1;	//	offset always one less current page
	
			const response = await storeController.paginatePurchasesIdSearch(
				searchedId,
				offset,
				pageSize,
			);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data) {
				setPagedData(buildTableData(response.data.content));
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return paginateIdSearch(pageNumber);
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
			setNetworkRequest(false);
		}
	};
  
	const paginateDateSearch = async (pageNumber) => {
		try {
			setNetworkRequest(true);
			setPagedData([]);
			const offset = pageNumber - 1;	//	offset always one less current page
			
			const response = await storeController.paginatePurchasesDateSearch(
				searchedDate.startDate.toISOString(), 
				searchedDate.endDate.toISOString(),
				offset,
				pageSize,
			);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data) {
				setPagedData(buildTableData(response.data.content));
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return paginateDateSearch(pageNumber);
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
			setNetworkRequest(false);
		}
	};

	const handleCloseModal = () => {
		setShowConfirmModal(false);
		setShowInputModal(false);
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
				setEntityToEdit(entity);
				setDisplayMsg(`Delete item ${entity.itemName}?`);
				setShowConfirmModal(true);
                break;
            case 'updateVendor':
				setDropDownMsg("Please select Vendor")
				setShowDropDownModal(true);
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
                break;
            case 'search':
                break;
        }
	}

	const updateVendor = async (vendor) => {
		setVendor(vendor);
		//	ask to update vendor
		setDisplayMsg(`Update vendor to ${vendor.name}?`);
		setConfirmDialogEvtName('updateVendor');
		setShowConfirmModal(true);
	};
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'deleteItem':
				//	TODO: delte item
				console.log('deleting.....');
                break;
            case 'updateVendor':
				//	TODO: Update vendor
				console.log('editing vendor.....');
                break;
        }
	}

	const idSearch = async (id) => {
		try {
			/*	text returned from input dialog is always a string but we can use a couple of techniques to convert it to a valid number
				Technique 1: use the unary plus operator which is what i've adopted below
				Technique 2: multiply by a number. 
				etc	*/
			if(!+id){
				toast.error('Please enter a valid number');
				return;
			}
			setNetworkRequest(true);
			setPagedData([]);
			setCurrentPage(1);
			setTotalItemsCount(0);
			setSearchMode(1);

			setSearchedId(id);
			setSearchedDate(null);
			setValue('startDate', null);
			setValue('endDate', null);
	
			const response = await storeController.paginatePurchasesIdSearch(
				id,
				0,
				pageSize,
			);
	
			//  check if the request to fetch indstries doesn't fail before setting values to display
			if (response && response.data) {
				setPagedData(buildTableData(response.data.content));
				setTotalItemsCount(response.data.page.totalElements);
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return idSearch(id);
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
			setNetworkRequest(false);
		}
	}

	const onsubmit = async (data) => {
		try {
			if (data.startDate && data.endDate) {
				setNetworkRequest(true);
				setCurrentPage(1);
				setSearchMode(0);
				setTotalItemsCount(0);
				data.startDate.setHours(0);
				data.startDate.setMinutes(0);
				data.startDate.setSeconds(0);
	
				data.endDate.setHours(23);
				data.endDate.setMinutes(59);
				data.endDate.setSeconds(59);

				setSearchedId(0);
				setSearchedDate(data);
	
				const response = await storeController.paginatePurchasesDateSearch(data.startDate.toISOString(), data.endDate.toISOString(), 0, pageSize);
				if(response && response.data){
					setPagedData(buildTableData(response.data.content));
					setTotalItemsCount(response.data.page.totalElements);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return onsubmit(data);
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
			dtoItem.expDate = item.expDate;
			dtoItem.qtyPerPkg = item.qtyPerPkg;
			dtoItem.unitStockPrice = item.unitStockPrice;
			dtoItem.pkgStockPrice = item.pkgStockPrice;
			dtoItem.sectionName = item.tractName;
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
		objectProps: ['itemName', 'qty', 'qtyType', 'qtyPerPkg', 'unitStockPrice', 'pkgStockPrice', 'expDate', "purchaseAmount", 'sectionName', 
			"vendorName", "cashPurchaseAmount", "creditPurchaseAmount", 'id'],
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
					<OffcanvasMenu menuItems={purchasesOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
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
				<div
					className="border py-4 px-5 bg-white-subtle rounded-4"
					style={{ boxShadow: "black 3px 2px 5px" }}
				>
					<Row className="align-items-center">
						<Col sm lg="4" className="mt-3 mt-md-0">
							<Form.Label className="fw-bold">Start Date</Form.Label>
							<Controller
								name="startDate"
								control={control}
								render={({ field }) => (
									<Datetime
										{...field}
										timeFormat={false}
										closeOnSelect={true}
										dateFormat="DD/MM/YYYY"
										inputProps={{
											placeholder: "Choose start date",
											className: "form-control",
											readOnly: true, // Optional: makes input read-only
										}}
										onChange={(date) => {
											setValue("endDate", date.toDate());
											field.onChange(date ? date.toDate() : null);
										}}
										/*	react-hook-form is unable to reset the value in the Datetime component because of the below bug.
											refs:
												*	https://stackoverflow.com/questions/46053202/how-to-clear-the-value-entered-in-react-datetime
												*	https://stackoverflow.com/questions/69536272/reactjs-clear-date-input-after-clicking-clear-button
											there's clearly a rendering bug in component if you try to pass a null or empty value in controlled component mode: 
											the internal input still got the former value entered with the calendar (uncontrolled ?) despite the fact that that.state.value
											or field.value is null : I've been able to "patch" it with the renderInput prop :*/
										renderInput={(props) => {
											return <input {...props} value={field.value ? props.value : ''} />
										}}
									/>
								)}
							/>
							<ErrorMessage source={errors.startDate} />
						</Col>
						<Col sm lg="4" className="mt-3 mt-md-0">
							<Form.Label className="fw-bold">End Date</Form.Label>
							<Controller
								name="endDate"
								control={control}
								render={({ field }) => (
									<Datetime
										{...field}
										timeFormat={false}
										closeOnSelect={true}
										dateFormat="DD/MM/YYYY"
										inputProps={{
											placeholder: "Choose end date",
											className: "form-control",
											readOnly: true, // Optional: makes input read-only
										}}
										onChange={(date) =>
											field.onChange(date ? date.toDate() : null)
										}
										isValidDate={(current) => {
											// Ensure end date is after start date
											return (
											!startDate || current.isSameOrAfter(startDate, "day")
											);
										}}
										/*	react-hook-form is unable to reset the value in the Datetime component because of the below bug.
											refs:
												*	https://stackoverflow.com/questions/46053202/how-to-clear-the-value-entered-in-react-datetime
												*	https://stackoverflow.com/questions/69536272/reactjs-clear-date-input-after-clicking-clear-button
											there's clearly a rendering bug in component if you try to pass a null or empty value in controlled component mode: 
											the internal input still got the former value entered with the calendar (uncontrolled ?) despite the fact that that.state.value
											or field.value is null : I've been able to "patch" it with the renderInput prop :*/
										renderInput={(props) => {
											return <input {...props} value={field.value ? props.value : ''} />
										}}
									/>
								)}
							/>
							<ErrorMessage source={errors.endDate} />
						</Col>
						<Col sm lg="3" className="align-self-end text-center mt-3">
							<Button className="w-100" onClick={handleSubmit(onsubmit)} disabled={networkRequest}>
								{ (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
								{ (!networkRequest) && `Search` }
							</Button>
						</Col>
					</Row>
				</div>
				<div className="row mt-2">
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
				<DropDownDialog
					show={showDropDownModal}
					handleClose={handleDropDownCloseModal}
					handleConfirm={updateVendor}
					message={dropDownMsg}
					options={vendorOptions}
				/>
			</div>
		</>
	);
};

export default PurchasesWindow;
