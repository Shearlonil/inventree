import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable'

import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ReactMenu from '../../Components/ReactMenu';
import { Item } from '../../Entities/Item';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';
import itemController from '../../Controllers/item-controller';
import genericController from '../../Controllers/generic-controller';
import ItemUpdateForm from '../../Components/Item/ItemUpdateForm';

const StoreWindow = () => {
    applyPlugin(jsPDF);
    const navigate = useNavigate();
    const { salesMode } = useParams();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Edit', onClickParams: {evtName: 'editItem' } },
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'Move', onClickParams: {evtName: 'move'} },
        { name: 'Change Packaging', onClickParams: {evtName: 'updatePkg'} },
        { name: 'View', onClickParams: {evtName: 'viewItem'} },
    ];
    
    const [networkRequest, setNetworkRequest] = useState(false);
    const [mode, setMode] = useState(salesMode);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [dropDownMsg, setDropDownMsg] = useState("");
    //  for drop down dialog
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [pkgOptions, setPkgOptions] = useState([]);
    const [tractOptions, setTractOptions] = useState([]);
    //  To hold either pkgOptions or tractOptions for DropDownDialog
    const [options, setOptions] = useState([]);
    
    const [reportTitle, setReportTitle] = useState("Store Items");
    const [filename, setFilename] = useState("");
        
    //	for pagination
    const [pageSize] = useState(20);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [items, setItems] = useState([]);
    
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    const itemsOffCanvasMenu = [
        { label: "Available Stock", onClickParams: {evtName: 'availableStock'} },
        { label: "Low Stock", onClickParams: {evtName: 'lowStock'} },
        { label: "Out Of Stock", onClickParams: {evtName: 'outOfStock'} },
        { label: "Filter By Section", onClickParams: {evtName: 'filterBySection'} },
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Export to PDF", onClickParams: {evtName: 'pdfExport'} },
        { label: "Export to Excel", onClickParams: {evtName: 'xlsxExport'} },
    ];
            
    useEffect( () => {
        if(user.hasAuth('SECTIONS_WINDOW')){
            initialize();
            switch (salesMode) {
                case 'low':
                    fetchLowStockItems();
                    break;
                case 'nostock':
                    fetchOutOfStockItems();
                    break;
                default:
                    fetchInStockStoreItems();
                    break;
            }
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
        try {
            setNetworkRequest(true);
            const urls = [ '/api/pkg/active', '/api/tracts/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: pkgRequest, 1: tractRequest } = response;

            //	check if the request to fetch pkg doesn't fail before setting values to display
            if(pkgRequest){
				setPkgOptions(pkgRequest.data.map( pkg => ({label: pkg.name, value: pkg})));
            }

            //	check if the request to fetch vendors doesn't fail before setting values to display
            if(tractRequest){
                setTractOptions(tractRequest.data.map( tract => ({label: tract.name, value: tract})));
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

	const fetchInStockStoreItems = async () => {
		try {
            setNetworkRequest(true);
            const response = await itemController.fetchInStockStoreItems();
            setMode('Available Stock');

			setReportTitle(`Available Stock (Store)`);
			setFilename(`store_available_stock`);

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    arr.push(createItem(i));
                } );
				setItems(arr);
                setFilteredItems(arr);
				setTotalItemsCount(response.data.length);
            }
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return fetchInStockStoreItems();
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

	const fetchLowStockItems = async () => {
		try {
            setNetworkRequest(true);
            const response = await itemController.fetchLowStockStoreItems();
            setMode('Low Stock');

			setReportTitle(`Low Stock (Store)`);
			setFilename(`store_low_stock`);

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    arr.push(createItem(i));
                } );
				setItems(arr);
                setFilteredItems(arr);
				setTotalItemsCount(response.data.length);
                //  set pkg options for drop down dialog in case of delete operation
				setPkgOptions(arr.map( pkg => ({label: pkg.name, value: pkg})));
            }
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return fetchLowStockItems();
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

	const fetchOutOfStockItems = async () => {
		try {
            setNetworkRequest(true);
            const response = await itemController.fetchOutOfStockStoreItems();
            setMode('Out Of Stock');

			setReportTitle(`Out Of Stock (Store)`);
			setFilename(`store_out_of_stock`);

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    arr.push(createItem(i));
                } );
				setItems(arr);
                setFilteredItems(arr);
				setTotalItemsCount(response.data.length);
                //  set pkg options for drop down dialog in case of delete operation
				setPkgOptions(arr.map( pkg => ({label: pkg.name, value: pkg})));
            }
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return fetchOutOfStockItems();
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
		setShowDropDownModal(false);
        setShowFormModal(false);
    };

    const resetPage = () => {
		setEntityToEdit(null);
        setConfirmDialogEvtName(null);
        handleCloseModal();
    };
    
    const handleDropDown = async (entity) => {
        setShowDropDownModal(false);
        switch (confirmDialogEvtName) {
            case 'updatePkg':
                updatePkg(entity);
                break;
            case 'move':
                move(entity);
                break;
            case 'filterBySection':
                const arr = items.filter(item => item.tractName.toLowerCase() === entity.name.toLowerCase());
                setFilteredItems(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
        }
    };

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
                //	ask if sure to delete
                setEntityToEdit(entity);
                setDisplayMsg(`Move Item ${entity.itemName} to Trash?`);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowConfirmModal(true);
                break;
            case 'editItem':
                setEntityToEdit(entity);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowFormModal(true);
                break;
            case 'move':
                setEntityToEdit(entity);
                setConfirmDialogEvtName(onclickParams.evtName);
                setDropDownMsg(`Select destination Section for ${entity.itemName}`);
                setOptions(tractOptions);
                setShowDropDownModal(true);
                break;
            case 'updatePkg':
                setEntityToEdit(entity);
                setConfirmDialogEvtName(onclickParams.evtName);
                setDropDownMsg(`Select Packaging for ${entity.itemName}`);
                setOptions(pkgOptions);
                setShowDropDownModal(true);
                break;
            case 'viewItem':
                window.open(`/items/store/${entity.id}/qty-mgr`, '_blank')?.focus();
                break;
        }
    };

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
                filteredItems.sort(
                    (a, b) => (a.itemName.toLowerCase() > b.itemName.toLowerCase()) ? 1 : ((b.itemName.toLowerCase() > a.itemName.toLowerCase()) ? -1 : 0)
                );
                if(currentPage === 1){
                    setPagedData(filteredItems.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
            case 'create':
                setConfirmDialogEvtName(onclickParams.evtName);
                setDisplayMsg(`Enter Unique name`);
                setShowInputModal(true);
                break;
            case 'availableStock':
                await fetchInStockStoreItems()
                setCurrentPage(1);
                break;
            case 'lowStock':
                await fetchLowStockItems()
                setCurrentPage(1);
                break;
            case 'outOfStock':
                await fetchOutOfStockItems();
                setCurrentPage(1);
                break;
            case 'filterBySection':
                setConfirmDialogEvtName(onclickParams.evtName);
                setOptions(tractOptions);
                setDropDownMsg("Select Section");
                setShowDropDownModal(true);
                break;
            case 'pdfExport':
                pdfExport();
                break;
            case 'xlsxExport':
                xlsxExport();
                break;
        }
	};

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredItems.slice(startIndex, startIndex + pageSize));
    };
	
	const handleInputOK = async (str) => {
        let arr = [];
		switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = items.filter(item => item.itemName.toLowerCase().includes(str.toLowerCase()));
                setFilteredItems(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
            case 'create':
                break;
            case 'editItem':
                break;
        }
	};
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'delete':
                setShowDropDownModal(true);
                deleteItem();
                break;
        }
	};
    
    const move = async (tractEntity) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await itemController.changeTract(entityToEdit.id, tractEntity.id);
            if(response && response.status === 200){
                entityToEdit.tractName = tractEntity.name;
                //	find index position of edited item in filtered items arr
                let indexPos = filteredItems.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    filteredItems.splice(indexPos, 1, entityToEdit);
                    setFilteredItems([...filteredItems]);
                    const startIndex = (currentPage - 1) * pageSize;
                    setPagedData(filteredItems.slice(startIndex, startIndex + pageSize));
                    toast.success('Update successful');
                }
                //  update in items arr also
                indexPos = items.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    items.splice(indexPos, 1, entityToEdit);
                    setItems([...items]);
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
					return move(tractEntity);
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
    
    const updatePkg = async (pkgEntity) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await itemController.changePkg(entityToEdit.id, pkgEntity.id);
            if(response && response.status === 200){
                entityToEdit.pkgName = pkgEntity.name;
                //	find index position of edited item in filtered items arr
                let indexPos = filteredItems.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    filteredItems.splice(indexPos, 1, entityToEdit);
                    setFilteredItems([...filteredItems]);
                    const startIndex = (currentPage - 1) * pageSize;
                    setPagedData(filteredItems.slice(startIndex, startIndex + pageSize));
                    toast.success('Update successful');
                }
                //  update in items arr also
                indexPos = items.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    items.splice(indexPos, 1, entityToEdit);
                    setItems([...items]);
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
					return updatePkg(pkgEntity);
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
    
    const deleteItem = async () => {
        setShowDropDownModal(false);
        try {
            setNetworkRequest(true);
            
            await itemController.deleteItem(entityToEdit.id);
            //	find index position of deleted item in items arr
            let indexPos = filteredItems.findIndex(i => i.id == entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                filteredItems.splice(indexPos, 1);
                setFilteredItems([...filteredItems]);
                /*  MAINTAIN CURRENT PAGE.  */
                setTotalItemsCount(totalItemsCount - 1);
                if(pagedData.length <= 1){
                    if(totalItemsCount >= pageSize){
                        setCurrentPage(currentPage - 1);
                    }
                }
                toast.success('Delete successful');
            }
            //  update in items arr also
            indexPos = items.findIndex(i => i.id === entityToEdit.id);
            if(indexPos > -1){
                //	replace old item found at index position in items array with edited one
                items.splice(indexPos, 1);
                setItems([...items]);
            }

            resetPage();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return deleteItem();
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
	
	const fnSave = async (item) => {
		try {
			setNetworkRequest(true);
            //  add compulsory fields for Java ItemDTO
            item.status = true;
            item.qtyType = 'any';
			await itemController.updateItem(item);
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
            handleCloseModal();
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
        
    const pdfExport = () => {
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(20);

        const title = reportTitle;

        doc.text(title, marginLeft, 40);

        doc.autoTable({
            styles: { theme: 'striped' },
            margin: { top: 60 },
            body: filteredItems,
            columns: [
                // { header: 'Receipt No.', dataKey: 'receipt_id' },
                { header: 'Description', dataKey: 'itemName' },
                { header: 'Restock level', dataKey: 'restockLevel' },
                { header: 'Reg. Date', dataKey: 'creationDate' },
                { header: 'Qty/Pkg', dataKey: 'qtyPerPkg' },
                { header: 'Unit Qty', dataKey: 'qty' },
                { header: 'Pkg Qty', dataKey: 'pkgQty' },
                { header: 'Packaging', dataKey: 'pkgName' },
                { header: 'Section', dataKey: 'tractName' },
            ],
        });
        doc.save(`${filename}` + fileExtension);
    }
    
    const xlsxExport = () => {
        //  ref: https://codesandbox.io/p/sandbox/react-export-excel-wrdew?file=%2Fsrc%2FApp.js
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";

        const Heading = [ {itemName: "Description", restockLevel: "Restock Level", creationDate: "Reg. Date", qtyPerPkg: "Qty/Pkg", qty: "Unit Qty", pkgQty: "Pkg Qty", 
            pkgName: "Packaging", tractName: "Section" } ];
        
        const temp = [];
        filteredItems.forEach(t => {
            const a = {...t.toJSON()};
            delete a.id;
            delete a.barcode;
            delete a.qtyType;
            delete a.storeQty;
            delete a.pkgStockPrice;
            delete a.unitStockPrice;
            delete a.status;
            delete a.expDate;
            delete a.pkgSalesPrice;
            delete a.unitSalesPrice;
            temp.push(a);
        });
        console.log('temp data', temp);
        const wscols = [
            { wch: Math.max(...temp.map(datum => datum.itemName.length)) },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
        ];
        const ws = XLSX.utils.json_to_sheet(Heading, {
            header: ['itemName', 'restockLevel', 'creationDate', 'qtyPerPkg', 'qty', 'pkgQty', 'pkgName', 'tractName'],
            skipHeader: true,
            origin: 0 //ok
        });
        ws["!cols"] = wscols;
        XLSX.utils.sheet_add_json(ws, temp, {
            header: ['itemName', 'restockLevel', 'creationDate', 'qtyPerPkg', 'qty', 'pkgQty', 'pkgName', 'tractName'],
            skipHeader: true,
            origin: -1 //ok
        });
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const finalData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(finalData, `${filename}` + fileExtension);
    };

    const createItem = (i) => {
        const item = new Item();
        item.id = i.id;
        item.itemName = i.itemName;
        item.barcode = i.barcode;
        item.restockLevel = i.restockLevel;
        item.creationDate = i.creationDate;
        item.qtyPerPkg = i.qtyPerPkg;
        item.qty = i.qty;
        item.pkgName = i.pkgName;
        item.tractName = i.tractName;
        item.unitSalesPrice = i.unitPrice;
        item.pkgSalesPrice = i.pkgPrice;
        return item;
    }
    
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Restock Level', 'Reg. Date', 'Qty/Pkg', 'Unit Qty', 'Pkg Qty', 'Packaging', 'Section', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'restockLevel', 'creationDate', 'qtyPerPkg', 'qty', 'pkgQty', 'pkgName', 'tractName'],
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
                    <OffcanvasMenu menuItems={itemsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Store Items</span>
                        <img src={SVG.shopping_items} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View, Edit Store Items. View Item Quantity Managers <br />
                    NOTE: The AVG. Accounting valuation method is used to calculate Qty/Pkg found for all quantity managers
                </span>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className={`container mt-4 p-3 shadow-sm border border-2 rounded-1 ${networkRequest ? 'disabledDiv' : ''}`}>
                <span className={`text-danger fw-bold h5`}>{mode}</span>
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
                options={options}
            />

			<Modal show={showFormModal} onHide={handleCloseModal}>
				<Modal.Header closeButton>
					<Modal.Title className='text-success fw-bold'>Update Item</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ItemUpdateForm fnSave={fnSave} data={entityToEdit} networkRequest={networkRequest} />
				</Modal.Body>
				<Modal.Footer></Modal.Footer>
			</Modal>
        </div>
    );
};

export default StoreWindow;