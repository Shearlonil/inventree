import React, { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../Components/ErrorMessage';
import { schema } from '../../Utils/yup-schema-validator/dispensary-schema';
import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import TableMain from '../../Components/TableView/TableMain';
import ReactMenu from '../../Components/ReactMenu';
import handleErrMsg from '../../Utils/error-handler';
import { useAuth } from '../../app-context/auth-user-context';
import genericController from '../../Controllers/generic-controller';
import { DispensaryItem } from '../../Entities/DispensaryItem';
import PaginationLite from '../../Components/PaginationLite';
import storeController from '../../Controllers/store-controller';
import { ThreeDotLoading } from '../../Components/react-loading-indicators/Indicator';


const defaultQtyType = 'unit';

const Dispensary = () => {
    const navigate = useNavigate();
    const { dispensary_id } = useParams();
        
    const { handleRefresh, logout } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            //  Set default selection
			product: null,
			quantity_val: 0,
			store_qty: 0,
            store_qty_type: "unit", 
            dispense_qty_type: 'unit'
        },
    });
    
    /*	Flag to indicate network fetch for dispensary record and it's item details to populate table in order to continue data input.
        If true, then disable save button.	*/
    const [networkRequest, setNetworkRequest] = useState(false);
    
    const [stockRecId, setStockRecId] = useState(dispensary_id);
    const [entityToEdit, setEntityToEdit] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedStoreQtyType, setSelectedStoreQtyType] = useState("unit");
    
    //  for items
    const [itemOptions, setItemOptions] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);

    //  for tracts
    const [tractOptions, setTractOptions] = useState([]);
    const [tractsLoading, setTractsLoading] = useState(true);

    //  for tracts
    const [outpostOptions, setOutpostOptions] = useState([]);
    const [outpostsLoading, setOutpostsLoading] = useState(true);
        
    //	for pagination
    const [pageSize] = useState(10);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [items, setItems] = useState([]);
          
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);

	const dispensaryOffCanvasMenu = [
		{ label: "Search By Purchase No.", onClickParams: {evtName: 'searchByNo'} },
		{ label: "Export to PDF", onClickParams: {evtName: 'exportToPDF'} },
	];

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'deleteItem'} },
        {
            name: 'Edit', onClickParams: {evtName: 'editItem' }
        },
    ];
            
    useEffect( () => {
        if(dispensary_id > 0){
            initializeWithDispensaryRec();
        }else {
            initialize();
        }
    }, [dispensary_id]);

	const initialize = async () => {
		try {
			resetPageStates();
            //  find active outposts, tracts and items with available store qty
            const urls = [ '/api/items/dispensary/active', '/api/tracts/active', '/api/outposts/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: storeItemsRequest, 1: tractsRequest, 2: outpostsRequest } = response;

            //	check if the request to fetch store items doesn't fail before setting values to display
            if(storeItemsRequest){
                const dispensaryItems = storeItemsRequest.data.filter(item => item.dtoQtyMgrs.length > 0).map(item => new DispensaryItem(item));
                setItemsLoading(false);
				setItemOptions(dispensaryItems.map( item => ({label: item.name, value: item})));
            }

            //	check if the request to fetch tracts doesn't fail before setting values to display
            if(tractsRequest){
				setTractsLoading(false);
                setTractOptions(tractsRequest.data.map( tract => ({label: tract.name, value: tract.id})));
            }

            //	check if the request to fetch outposts doesn't fail before setting values to display
            if(outpostsRequest){
				setTractsLoading(false);
                setTractOptions(outpostsRequest.data.map( outpost => ({label: outpost.name, value: outpost.id})));
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

	const initializeWithDispensaryRec = async () => {
		try {
			setNetworkRequest(true);
			resetPageStates();
	
			const unverifiedDispensaryRequest = await storeController.findUnverifiedDispensaryById(dispensary_id);

            //  find active outposts, tracts and items with available store qty
            const urls = [ '/api/items/dispensary/active', '/api/tracts/active', '/api/outposts/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: storeItemsRequest, 1: tractsRequest, 2: outpostsRequest } = response;

            //	check if the request to fetch store items doesn't fail before setting values to display
            if(storeItemsRequest){
                const dispensaryItems = storeItemsRequest.data.filter(item => item.dtoQtyMgrs.length > 0).map(item => new DispensaryItem(item));
                setItemsLoading(false);
				setItemOptions(dispensaryItems.map( item => ({label: item.name, value: item})));
            }

            //	check if the request to fetch tracts doesn't fail before setting values to display
            if(tractsRequest){
				setTractsLoading(false);
                setTractOptions(tractsRequest.data.map( tract => ({label: tract.name, value: tract.id})));
            }

            //	check if the request to fetch outposts doesn't fail before setting values to display
            if(outpostsRequest){
				setTractsLoading(false);
                setTractOptions(outpostsRequest.data.map( outpost => ({label: outpost.name, value: outpost.id})));
            }
	
			//	check if the request to fetch item doesn't fail before setting values to display
			if (unverifiedDispensaryRequest && unverifiedDispensaryRequest.data) {
				setItems(buildTableData(unverifiedDispensaryRequest.data));
				setTotalItemsCount(unverifiedDispensaryRequest.data.length);
			}
	
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return initializeWithDispensaryRec();
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
        
        //	setup table data from fetched stock record
        const buildTableData = (arr = []) => {
            const tableArr = [];
            arr.forEach(item => {
                tableArr.push({
                    id: item.itemId,
                    name: item.itemName,
                    itemDetailId: item.itemDetailId,
                    dispensaryId: item.dispensaryId,
                    qty: item.qty,
                    qtyType: item.qtyType,
                });
            });
            /*	sorting the array is IMPORTANT as it prevents the items array from behaving unexpectedly
                when working with pagination.
                At first, when the pagination number is first clicked, the unexpected behaviour is, the 
                elements in the items array are rearranged from the order the were initially	*/
            tableArr.sort((a , b) => a.itemDetailId - b.itemDetailId);
            return tableArr;
        };

	const resetPageStates = () => {
		setItems([]);
		setPagedData([]);
		setTotalItemsCount(0);
		setCurrentPage(1);
		setStockRecId(dispensary_id);
		setEntityToEdit(null);
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(items.slice(startIndex, startIndex + pageSize));
    };

    //  Handle item selection change
    const handleProductChange = (selectedItem) => {
        setSelectedProduct(selectedItem.value);

        // Set default store quantity which is unit
        setValue('store_qty_type', defaultQtyType);
        setValue('dispense_qty_type', defaultQtyType);
        setValue("store_qty", selectedItem.value.unitQty);
    };

    //  Handle store qty type switch
    const handleStoreQtyUnitTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedStoreQtyType(newType);
        
        if (selectedProduct) {
            setValue("store_qty", newType === "pkg" ? selectedProduct.pkgQty : selectedProduct.unitQty);
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByNo':
				//  setDisplayMsg("Please enter Purchases No.");
				//  setShowInputModal(true);
                break;
            case 'exportToPDF':
                break;
            case 'search':
                break;
        }
	}

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'deleteItem':
                break;
            case 'editItem':
                break;
        }
    };

    const onSubmit = (data) => {
        console.log(data);
        //  is item already added to table?
        const index = items.findIndex(item => item.id === data.product.value.id);
        if(index >= 0){
            toast.error('item already exist, consider editing it');
            return;
        }
        //  dispensed qty > store qty (unit or pkg)?
        if( (data.dispense_qty_type === 'unit' && data.quantity_val > data.product.value.unitQty) 
            ||
            (data.dispense_qty_type === 'pkg' && data.quantity_val > data.product.value.pkgQty)){
                toast.error('Dispensed quantity is greater than available quantity');
                return;
        }
        const dispensedItem = {
            id: data.product.value.id,
            name: data.product.value.name,
            qty: data.quantity_val,
            qtyType: data.dispense_qty_type,
        };
        setItems([...items, dispensedItem]);
        //	maintain current page
        setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
        //	update total items count
        setTotalItemsCount(totalItemsCount + 1);

        // clears the input fields after save
        reset();
    };
        
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Total Qty', 'Type', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['name', 'qty', 'qtyType'],
        //	React Menu
        menus: {
            ReactMenu,
            menuItems,
            menuItemClick: handleTableReactMenuItemClick,
        }
    };

    return (
        <div style={{minHeight: '75vh'}}>

            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<div>
					<OffcanvasMenu menuItems={dispensaryOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" />
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Dispensary</span>
						<img src={SVG.dispensary_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Dispense items in store to any section to increase sales quantity.
                    Please Note that Dispensary requires STORE ITEM VIEW PERMISSION
                </span>
			</div>
            <div className="container row mx-auto my-3 p-3 rounded bg-light shadow">
                <div className="col-md-4 col-12 mb-3">
                    <p className="h5 mb-2">Product:</p>
                    <Controller
                        name="product"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Select
                                required
                                placeholder="Select..."
                                className="text-dark"
                                options={itemOptions}
                                isLoading={itemsLoading}
                                value={value}
                                onChange={(val) => {
                                    onChange(val);
                                    handleProductChange(val);
                                }}
                            />
                        )}
                    />
                    <ErrorMessage source={errors.product} />

                </div>
                {/*  */}

                <div className="col-md-4 col-12 mb-3">
                    <p className="h5 mb-2">Quantity:</p>
                    <input
                        type="number"
                        className="form-control mb-2"
                        placeholder="0"
                        {...register("quantity_val")}
                        min={0}
                        max={selectedStoreQtyType === "pkg" ? selectedProduct?.pkgQty : selectedProduct?.unitQty} // Set max dynamically
                        onChange={(e) => {
                            const maxQty = selectedStoreQtyType === "pkg" ? selectedProduct?.pkgQty : selectedProduct?.unitQty;
                            if (e.target.value > maxQty) {
                                setValue("quantity_val", maxQty); // Auto-correct if input exceeds available
                            }
                        }}
                    />

                    <div className="d-flex gap-3">
                        <Form.Check
                            type="radio"
                            label="Unit"
                            value="unit"
                            {...register("dispense_qty_type")}
                            name="dispense_qty_type"
                            // onChange={handleUnitTypeChange}
                        />
                        <Form.Check
                            type="radio"
                            label="Pkg"
                            value="pkg"
                            {...register("dispense_qty_type")}
                            name="dispense_qty_type"
                            // onChange={handleUnitTypeChange}
                        />
                    </div>
                </div>


                <div className="col-md-4 col-12 mb-3">
                    <p className="h5 mb-2">Store Qty:</p>
                    <input
                        type="number"
                        className="form-control mb-2"
                        placeholder="0"
                        {...register("store_qty")}
                        disabled
                    />

                    <div className="d-flex gap-3">
                        <Form.Check
                            type="radio"
                            label="Unit"
                            value="unit"
                            {...register("store_qty_type")}
                            name="store_qty_type"
                            onChange={handleStoreQtyUnitTypeChange}
                        />
                        <Form.Check
                            type="radio"
                            label="Pkg"
                            value="pkg"
                            {...register("store_qty_type")}
                            name="store_qty_type"
                            onChange={handleStoreQtyUnitTypeChange}
                        />
                    </div>
                </div>

                <div className="d-flex">
                    <button
                        className="btn btn-outline-success ms-auto"
                        onClick={handleSubmit(onSubmit)}
                    >
                        <span className="d-flex gap-2 align-items-center px-4">
                            <span className="fs-5">
                                { (networkRequest) && <ThreeDotLoading color="green" size="small" /> }
                                { (!networkRequest) && `Save` }
                            </span>
                        </span>
                    </button>
                </div>
            </div>

            <div className="container mt-4 p-3 shadow-sm border border-2 rounded-1">
                <div className="border bg-light my-3">
                    <TableMain tableProps={tableProps} tableData={pagedData} />
                    <div className="mt-3">
                        <PaginationLite
                            itemCount={totalItemsCount}
                            pageSize={pageSize}
                            setPageChanged={setPageChanged}
                            pageNumber={currentPage}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dispensary;