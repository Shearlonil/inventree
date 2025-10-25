import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Select from "react-select";
import numeral from 'numeral';

import { useAuth } from "../../../app-context/auth-user-context";
import ConfirmDialog from "../../../Components/DialogBoxes/ConfirmDialog";
import { schema } from '../../../Utils/yup-schema-validator/stock-journal';
import handleErrMsg from '../../../Utils/error-handler';
import SVG from '../../../assets/Svg';
import { Form } from 'react-bootstrap';
import itemController from '../../../Controllers/item-controller';
import { Item } from '../../../Entities/Item';
import { ThreeDotLoading } from '../../../Components/react-loading-indicators/Indicator';
import inventoryController from '../../../Controllers/inventory-controller';

const QtyTransfer = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const [networkRequest, setNetworkRequest] = useState(false);
    //  for items
    const [itemOptions, setItemOptions] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [selectedSourceProduct, setSelectedSourceProduct] = useState(null);
    const [selectedDestProduct, setSelectedDestProduct] = useState(null);
    const [transferData, setTransferData] = useState(null);

    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState("");

    const {
        register,
        handleSubmit,
        resetField,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            //  Set default selection
			source_product: null,
			dest_product: null,
			quantity_val: 0,
            source_store_qty: 0,
            source_sales_qty: 0,
            dest_store_qty: 0,
            dest_sales_qty: 0,
            transfer_to: "store",
        },
    });
                
    useEffect( () => {
        if(user.hasAuth('EDIT_ITEM_QUANTITY')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            const response = await itemController.fetchInStockGrossItems();
            
            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( i => {
                    const item = new Item();
                    item.id = i.id;
                    item.itemName = i.itemName;
                    item.qty = i.qty;
                    item.pkgName = i.pkgName;
                    item.storeQty = i.storeQty;
                    arr.push(item);
                } );
				setItemOptions(arr.map( item => ({label: item.itemName, value: item})));
                setItemsLoading(false);
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

    //  Handle item selection change
    const handleSourceProductChange = (selectedItem) => {
        setSelectedSourceProduct(selectedItem.value);

        // Set default store quantity which is unit
        setValue("source_store_qty", selectedItem.value.storeQty);
        setValue("source_sales_qty", selectedItem.value.qty);
    };

    const handleDestProductChange = (selectedItem) => {
        setSelectedDestProduct(selectedItem.value);

        // Set default store quantity which is unit
        setValue("dest_store_qty", selectedItem.value.storeQty);
        setValue("dest_sales_qty", selectedItem.value.qty);
    }
	
	const handleConfirmOK = async () => {
        setShowConfirmModal(false);
        try {
			setNetworkRequest(true);
            /*  ItemDTO is used to receive this object on Java back-end.
                itemName is used to hold transfor_to field,
                tractId is used to hold destination product id
                id is used to hold source product id
                status is expected (NotNull)
            */
            const item = {
                id: transferData.source_product.value.id,
                itemName: transferData.transfer_to,
                qty: transferData.quantity_val,
                tractId: transferData.dest_product.value.id,
                status: true,
                qtyType: 'null'
            }
            await inventoryController.qtyTransfer(item);
            reset();
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
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
    }

    const handleCloseModal = () => setShowConfirmModal(false);

    const onSubmit = async (data) => {
        if(data.source_product.value.id === data.dest_product.value.id){
            toast.error("Source and Destination cannot be same product");
            return;
        }
        const totalQty = numeral(data.source_sales_qty).add(data.source_store_qty).value();
        if (numeral(data.quantity_val).value() > numeral(totalQty).value()) {
            toast.error("Transfer quantity more than available quantity");
            return;
        }
        setTransferData(data);
        setDisplayMsg(`Transfer ${data.quantity_val} unit from ${data.source_product.label} to ${data.dest_product.label}`);
        setShowConfirmModal(true);
    }

	const reset = () => {
		resetField('source_product');
		resetField('dest_product');
		resetField('quantity_val');
		resetField('source_store_qty');
		resetField('source_sales_qty');
		resetField('dest_store_qty');
		resetField('dest_sales_qty');
		resetField('transfer_to');
	}

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Transfer Of Materials</span>
                        <img src={SVG.trolly_white} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Transfer quantities from one item to another
                </span>
                <span className='text-center m-1'>
                    NOTE: Store quantities are deducted first and if not enough, sales quanities are included.
                </span>
            </div>

            <div className="container row mx-auto my-3 p-3 rounded bg-light shadow border">
                <h4 className="mb-4 text-danger fw-bold">Source:-</h4>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Item:</p>
                    <Controller
                        name="source_product"
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
                                    handleSourceProductChange(val);
                                }}
                            />
                        )}
                    />
                    <small className="text-danger">{errors.source_product?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Transfer:</p>
                    <input
                        type="number"
                        className="form-control mb-2 shadow-sm"
                        placeholder="Transfer Quantity"
                        {...register("quantity_val")}
                    />
                    <small className="text-danger">{errors.quantity_val?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Store Quantity:</p>
                    <input
                        type="number"
                        className="form-control mb-2 shadow-sm"
                        placeholder=""
                        {...register("source_store_qty")}
                        disabled
                    />
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Sales Quantity:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder=""
                        {...register("source_sales_qty")}
                        disabled
                    />
                </div>
            </div>

            <div className="container row mx-auto my-4 p-3 rounded bg-light shadow border">
                <h4 className="mb-4 text-primary fw-bold">Destination:-</h4>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Item:</p>
                    <Controller
                        name="dest_product"
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
                                    handleDestProductChange(val);
                                }}
                            />
                        )}
                    />
                    <small className="text-danger">{errors.dest_product?.message}</small>
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Store Quantity:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder=""
                        {...register("dest_store_qty")}
                        disabled
                    />
                    <Form.Check
                        type="radio"
                        label="Transfer to Store"
                        value="store"
                        {...register("transfer_to")}
                        name="transfer_to"
                    />
                </div>

                <div className="col-md-3 col-12 mb-3">
                    <p className="h5">Sales Quantity:</p>
                    <input
                        type="text"
                        className="form-control mb-2 shadow-sm"
                        placeholder=""
                        {...register("dest_sales_qty")}
                        disabled
                    />
                    <Form.Check
                        type="radio"
                        label="Transfer to Sales"
                        value="sales"
                        {...register("transfer_to")}
                        name="transfer_to"
                    />
                </div>

                <div className="col-md-3 col-12 mb-3 align-self-center">
                    <button className="btn btn-outline-success w-100" onClick={handleSubmit(onSubmit)}>
                        { (networkRequest) && <ThreeDotLoading color="green" size="small" /> }
                        { (!networkRequest) && <span className="fs-5">Transfer</span> }
                    </button>
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
        </div>
    )
}

export default QtyTransfer;