import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

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

const SalesWindow = () => {
    const navigate = useNavigate();
    const { salesMode } = useParams();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Edit', onClickParams: {evtName: 'rename' } },
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'Move', onClickParams: {evtName: 'move'} },
        { name: 'Change Packaging', onClickParams: {evtName: 'updatePkg'} },
        { name: 'View', onClickParams: {evtName: 'viewItems'} },
    ];
    
    const [networkRequest, setNetworkRequest] = useState(false);
    const [mode, setMode] = useState(salesMode);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    //  for drop down dialog
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [pkgOptions, setPkgOptions] = useState([]);
        
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
        { label: "Sales Price Markup", onClickParams: {evtName: 'salesPriceMarkup'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
    ];
            
    useEffect( () => {
        if(user.hasAuth('SECTIONS_WINDOW')){
            switch (salesMode) {
                case 'low':
                    fetchLowStockItems();
                    break;
                case 'nostock':
                    fetchOutOfStockItems();
                    break;
                default:
                    fetchInStockSalesItems();
                    break;
            }
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const fetchInStockSalesItems = async () => {
		try {
            setNetworkRequest(true);
            const response = await itemController.fetchInStockSalesItems();
            setMode('Available Stock');

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    const item = new Item();
                    item.id = i.id;
                    item.itemName = i.itemName;
                    item.restockLevel = i.restockLevel;
                    item.creationDate = i.creationDate;
                    item.qtyPerPkg = i.qtyPerPkg;
                    item.qty = i.qty;
                    item.pkgName = i.pkgName;
                    item.tractName = i.tractName;
                    item.unitSalesPrice = i.unitSalesPrice;
                    item.packSalesPrice = i.packSalesPrice;
                    arr.push(item);
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
					return fetchInStockSalesItems();
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
            const response = await itemController.fetchLowStockSalesItems();
            setMode('Low Stock');

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    const item = new Item();
                    item.id = i.id;
                    item.itemName = i.itemName;
                    item.restockLevel = i.restockLevel;
                    item.creationDate = i.creationDate;
                    item.qtyPerPkg = i.qtyPerPkg;
                    item.qty = i.qty;
                    item.pkgName = i.pkgName;
                    item.tractName = i.tractName;
                    item.unitSalesPrice = i.unitSalesPrice;
                    item.packSalesPrice = i.packSalesPrice;
                    arr.push(item);
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
            const response = await itemController.fetchOutOfStockSalesItems();
            setMode('Out Of Stock');

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    const item = new Item();
                    item.id = i.id;
                    item.itemName = i.itemName;
                    item.restockLevel = i.restockLevel;
                    item.creationDate = i.creationDate;
                    item.qtyPerPkg = i.qtyPerPkg;
                    item.qty = i.qty;
                    item.pkgName = i.pkgName;
                    item.tractName = i.tractName;
                    item.unitSalesPrice = i.unitSalesPrice;
                    item.packSalesPrice = i.packSalesPrice;
                    arr.push(item);
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
    };

    const resetPage = () => {
		setEntityToEdit(null);
        setConfirmDialogEvtName(null);
        handleCloseModal();
    };

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
                if(entity.isDefault){
                    toast.error("Operation not allowed on default Item");
                    return;
                }
                //	ask if sure to delete
                setEntityToEdit(entity);
                setDisplayMsg(`Delete Item ${entity.name}? You'll be requested to select destination for items in this Item.`);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowConfirmModal(true);
                break;
            case 'rename':
                if(entity && entity.id <= 2){
                    toast.error("Operation not allowed on default Item");
                    return;
                }
                setEntityToEdit(entity);
                setConfirmDialogEvtName(onclickParams.evtName);
                setDisplayMsg(`Enter Unique Item name`);
                setShowInputModal(true);
                break;
            case 'viewItems':
                window.open(`/item/${entity.name}/items`, '_blank')?.focus();
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
                await fetchInStockSalesItems()
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
                break;
            case 'salesPriceMarkup':
                break;
            case 'trash':
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredItems.slice(startIndex, startIndex + pageSize));
    };
	
	const handleInputOK = async (str) => {
        let arr = [];
		switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = items.filter(item => item.itemName.toLowerCase().includes(str));
                setFilteredItems(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
            case 'create':
                createPkg(str);
                break;
            case 'rename':
                renameItem(str);
                break;
        }
	}
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'delete':
                setShowDropDownModal(true);
                break;
        }
	}
    
    const createPkg = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await itemController.create(name);
            if(response && response.data){
                const pkg = new Item();
                pkg.id = response.data.id;
                pkg.name = response.data.name;
                pkg.creationDate = response.data.creationDate;
                pkg.itemsCount = 0;
                pkg.username = user.username;

                const arr = [...filteredItems, pkg];
                items.push(pkg);
                setItems(pkg);
                setFilteredItems([...arr]);
                /*  GO TO PAGE WHERE NEW PKG IS.  */
                setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
                setTotalItemsCount(totalItemsCount + 1);
                toast.success('Pkg creation successful');
            }
            resetPage();
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return createPkg(name);
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
    
    const renameItem = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await itemController.rename(entityToEdit.id, name);
            if(response && response.status === 200){
                entityToEdit.name = name;
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
					return renameItem(name);
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
    
    const deletePkg = async (destinationPkg) => {
        setShowDropDownModal(false);
        if(entityToEdit.id === destinationPkg.id){
            toast.error('Deleted Item and Destination Item cannot be same');
            return;
        }
        try {
            setNetworkRequest(true);
            
            await itemController.deletePkg(entityToEdit.id, destinationPkg.id);
            //	find index position of deleted item in items arr
            let indexPos = filteredItems.findIndex(t => t.id == entityToEdit.id);
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
            indexPos = items.findIndex(t => t.id === entityToEdit.id);
            if(indexPos > -1){
                //	replace old item found at index position in items array with edited one
                items.splice(indexPos, 1);
                setItems([...items]);
            }

            //  Remove deleted Pkg from Pkg options also, we don't want to have a deleted Pkg as an option where items will be moved to :)
            indexPos = pkgOptions.findIndex(t => t.value.id === entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                pkgOptions.splice(indexPos, 1);
                setPkgOptions([...pkgOptions]);
            }

            /*  find destination pkg from filtered items array to update itemsCount for table display. Since both filtered and items arrays hold the same 
                objects (array from response.data), UPDATING THE itemsCount prop of the object found in filtered items array reflects in the items array  */
            let item = filteredItems.find(t => t.id == destinationPkg.id);
            if(item){
                item.itemsCount += entityToEdit.itemsCount;
            }

            resetPage();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return deletePkg(destinationPkg);
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
    
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Restock Level', 'Reg. Date', 'Qty/Pkg', 'Unit Qty', 'Pkg Qty', 'Packaging', 'Section', 'Unit Sales Price', 'Pkg Sales Price', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'restockLevel', 'creationDate', 'qtyPerPkg', 'qty', 'pkgQty', 'pkgName', 'tractName', 'unitSalesPrice', 'packSalesPrice'],
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
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Items</span>
                        <img src={SVG.shopping_items} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Item is the science, art and technology of enclosing or protecting products for distribution, storage, sale, and use.
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
                handleConfirm={deletePkg}
                message={'Select destination Section where items will be moved to'}
                options={pkgOptions}
            />
        </div>
    );
};

export default SalesWindow;