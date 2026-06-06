import { useEffect, useRef, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Select from "react-select";
import numeral from 'numeral';

import { useAuthUser } from '../../../app-context/user-context';
import ConfirmDialog from "../../../Components/DialogBoxes/ConfirmDialog";
import { qtyAdjustmentSchema } from '../../../Utils/yup-schema-validator/stock-journal';
import handleErrMsg from '../../../Utils/error-handler';
import SVG from '../../../assets/Svg';
import { Form } from 'react-bootstrap';
import { Item } from '../../../Entities/Item';
import { ThreeDotLoading } from '../../../Components/react-loading-indicators/Indicator';
import useInventoryController from '../../../Controllers/inventory-controller-hook';
import useItemController from '../../../Controllers/item-controller-hook';

const QtyAdjustment = () => {
    const controllerRef = useRef(new AbortController());

    const navigate = useNavigate();
    const location = useLocation();
    
    const { fetchActiveGrossItems } = useItemController();
	const { qtyAdjustment } = useInventoryController();
    const { authUser } = useAuthUser();
    const user = authUser();

    const [networkRequest, setNetworkRequest] = useState(false);
    //  for items
    const [itemOptions, setItemOptions] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);
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
        resolver: yupResolver(qtyAdjustmentSchema),
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
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
    }, [location.pathname]);

    const initialize = async () => {
        try {
            setNetworkRequest(true);
            controllerRef.current = new AbortController();
            const response = await fetchActiveGrossItems(controllerRef.current.signal);
            
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
            setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    };

    //  Handle item selection change
    const handleSourceProductChange = (selectedItem) => {
        // Set default store quantity which is unit
        setValue("source_store_qty", selectedItem.value.storeQty);
        setValue("source_sales_qty", selectedItem.value.qty);
    };
    
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
                itemName: transferData.source_product.label,
                qty: transferData.quantity_val,
                status: true,
                qtyType: 'null'
            }
            await qtyAdjustment(item, controllerRef.current.signal);
            /*  Update quantity   */
            let indexPos = itemOptions.findIndex(i => i.value.id === item.id);
            if(indexPos > -1){
                let newQty = item.qty;
                const totalQty = numeral(transferData.source_sales_qty).add(transferData.source_store_qty).value();
                if(totalQty > newQty){
                    //  quantity reduction
                    let diff = numeral(totalQty).subtract(newQty).value();
                    const storeQty = itemOptions[indexPos].value.storeQty;
                    if(storeQty > 0){
                        const newStoreQty = Math.max(0, numeral(storeQty).subtract(diff).value());
                        itemOptions[indexPos].value.storeQty = newStoreQty;
                        diff = Math.max(0, numeral(diff).subtract(storeQty).value());
                    }
                    if(diff > 0){
                        itemOptions[indexPos].value.qty -= diff;
                    }
                }else {
                    //  quantity increment
                    let diff = numeral(newQty).subtract(totalQty).value();
                    itemOptions[indexPos].value.storeQty += diff;
                }
            }
            reset();
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    }

    const handleCloseModal = () => setShowConfirmModal(false);

    const onSubmit = async (data) => {
        const totalQty = numeral(data.source_sales_qty).add(data.source_store_qty).value();
        if (numeral(data.quantity_val).value() === numeral(totalQty).value()) {
            toast.error("New quantity and total quantities are equal.");
            return;
        }
        setTransferData(data);
        setDisplayMsg(`Set new quantity to ${data.quantity_val} unit for ${data.source_product.label}`);
        setShowConfirmModal(true);
    }

    const reset = () => {
        resetField('source_product');
        resetField('quantity_val');
        resetField('source_store_qty');
        resetField('source_sales_qty');
    }

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Quantity Adjustment</span>
                        <img src={SVG.trolly_white} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Adjust item quantities as needed
                </span>
                <span className='text-center m-1'>
                    NOTE: In case of increment, store quantities are always used. If desired location is sales, then you can dispense from store.
                </span>
                <span className='text-center mb-1'>
                    In case of decrement, store quantities are deducted first and if not enough, sales quanities are included.
                    This further affects outpost quantities
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
                    <p className="h5">Quantity:</p>
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
                        type="text"
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
            
                <div className="d-flex">
                    <button
                        className={`btn btn-outline-success ms-auto ${networkRequest ? 'disabled' : ''}`}
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
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
        </div>
    )
}

export default QtyAdjustment;