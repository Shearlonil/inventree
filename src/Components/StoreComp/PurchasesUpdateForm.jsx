import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from "react-toastify";
import numeral from "numeral";
import { useNavigate } from "react-router-dom";

import { purchasesUpdateSchema } from "../../Utils/yup-schema-validator/store-form-schema";
import ErrorMessage from "../ErrorMessage";
import { useAuth } from "../../app-context/auth-user-context";
import handleErrMsg from '../../Utils/error-handler';
import { Packaging } from "../../Entities/Packaging";
import { Tract } from '../../Entities/Tract';
import { ThreeDotLoading } from "../react-loading-indicators/Indicator";
import pkgController from "../../Controllers/pkg-controller";

//	ref:	https://help.nextar.com/tutorial/stock-control
const PurchasesUpdateForm = (props) => {
    const { data, fnSave, networkRequest }  = props;

    const navigate = useNavigate();

    const { handleRefresh, logout } = useAuth();

    // for pkg
    const [pkgOptions, setPkgOptions] = useState([]);
    const [pkgLoading, setPkgLoading] = useState(true);

    //	for form calculation
    const [totalQty, setTotalQty] = useState(0);
    const [qtyType, setQtyType] = useState(null);
    const [qtyPerPkg, setQtyPerPkg] = useState(0);
    const [unitStockPrice, setUnitStockPrice] = useState(0);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        resetField,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(purchasesUpdateSchema),
        defaultValues: {
            total_qty: 0,
            qty_per_pkg: 0,
            unit_stock: 0,
            amount_paid: 0,
            qty_type: null,
        },
    });
    
    useEffect( () => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            const response = await pkgController.fetchAllActive();

            //	check if the request to fetch pkg doesn't fail before setting values to display
            if(response && response.data){
                setPkgLoading(false);
                setPkgOptions(response.data.map( pkg => ({label: pkg.name, value: pkg.id})));

                if(data){
                    const pkg = response.data.find(pkg => pkg.name.toLowerCase() === data.qtyType.toLowerCase());
                    const pkgType = {label: pkg.name, value: pkg.id};
                    setValue("qty_type", pkgType);
                    setValue("total_qty", data.qty);
                    setValue("qty_per_pkg", data.qtyPerPkg);
                    setValue("unit_stock", numeral(data.unitStockPrice).value());
                    setValue("amount_paid", numeral(data.cashPurchaseAmount).value());
    
                    //	update states for calculation
                    setTotalQty(data.qty);
                    setQtyPerPkg(data.qtyPerPkg);
                    setQtyType(pkgType);
                    setUnitStockPrice(data.unitStockPrice);
                }
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

    const onSubmit = async (formData) => {
        //	if data has itemDetailId, then update mode
        setItem(props.data, formData);
        await fnSave(props.data);
    };

    const setItem = (item, formData) => {
        //  item.itemName = formData.item.label;
        //  item.id = formData.item.value;
        item.qty = formData.total_qty;
        item.qtyPerPkg = formData.qty_per_pkg;
        item.unitStockPrice = formData.unit_stock;
        item.cashPurchaseAmount = formData.amount_paid;
        item.pkgStockPrice = numeral(item.qtyPerPkg).multiply(item.unitStockPrice).format('₦0,0.00')
        
        const pkg = new Packaging();
        pkg.id = formData.qty_type.value;
        pkg.name = formData.qty_type.label;
        item.pkg = pkg;
                
        //  setting a dummy tract with id 1 but retaining tract name for table display to bypass backend ItemRegDTO as it's not needed for restock
        const tract = new Tract();
        tract.id = 1;
        tract.name = item.tractName;
        item.tract = tract;
    }

    const handleTotalQtyChange = (e) => {
        setTotalQty(e.target.value);
        if(e.target.value == 0){
            calcAmountFromTotalQty(0);
            return;
        }
        calcAmountFromTotalQty(e.target.value);
    }

    const handleQtyPerPkgChange = (e) => {
        setQtyPerPkg(e.target.value);
        calcAmountFromQtyPerPkg(e.target.value);
    }

    const handleQtyTypeChange = (qtyType) => {
        setQtyType(qtyType);
        calcAmountFromQtyType(qtyType.label);
    }

    const handleUnitStockChange = (e) => {
        setUnitStockPrice(e.target.value);
        if(totalQty == 0 || qtyPerPkg == 0 || qtyType == null){
            return;
        }
        calcAmountFromUnitStock(e.target.value);
    }
    
    //  private helper function to calculate pkg stock amount from unitStockPrice
    const calcAmountFromUnitStock = (unitStockPrice) => {
        const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
        const amountPaid = qtyType.label.toLowerCase() === "unit" ? 
            numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
            numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
        setValue("amount_paid", numeral(amountPaid).value());
        //  calcSalesPricesFromUnitStock(unitStockPrice);
    }
    
    //  private helper function to calculate pkg stock amount and amount paid from totalQty
    const calcAmountFromTotalQty = (totalQty) => {
        if(unitStockPrice == 0 || qtyPerPkg == 0 || qtyType == null){
            return;
        }
        const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
        const amountPaid = qtyType.label.toLowerCase() === "unit" ? 
            numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
            numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00');
        setValue("amount_paid", numeral(amountPaid).value());
    }
    
    //  private helper function to calculate pkg stock amount and amount paid from qtyType
    const calcAmountFromQtyType = (qtyType) => {
        if(unitStockPrice == 0 || qtyPerPkg == 0 || totalQty == 0){
            return;
        }
        const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
        const amountPaid = qtyType.toLowerCase() === "unit" ? 
            numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
            numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00');
        setValue("amount_paid", numeral(amountPaid).value());
    }
    
    //  private helper function to calculate pkg stock amount and amount paid from qtyPerPkg
    const calcAmountFromQtyPerPkg = (qtyPerPkg) => {
        if(unitStockPrice == 0 || qtyType == null || totalQty == 0){
            return;
        }
        const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
        const amountPaid = qtyType.label.toLowerCase() === "unit" ? 
            numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
            numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00');
        setValue("amount_paid", numeral(amountPaid).value());
    }

    const reset = () => {
        resetField('item');
        resetField('total_qty');
        resetField('qty_per_pkg');
        resetField('unit_stock');
        resetField('amount_paid');
        resetField('qty_type');
    }

    return (
        <>
            <Form className="d-flex flex-column gap-2">
                <Form.Group className="mb-3" controlId="item_name">
                    <Row>
                        <h3 className="text-success">
                            {data?.itemName}
                        </h3>
                    </Row>
                    <Row>
                        <Col sm={"12"} md="4">
                            <Form.Label>Total Qty</Form.Label>
                        </Col>
                        <div className="row">
                            <div className="col-6">
                                <Controller
                                    name="total_qty"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            onChange={(val) => {
                                                handleTotalQtyChange(val);
                                                onChange(val);
                                            }}
                                            value={value}
                                        />
                                    )}
                                />
                                <ErrorMessage source={errors.total_qty} />
                            </div>
                            <div className="col-6 p-0">
                                <Controller
                                    name="qty_type"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Select
                                            required
                                            name="qty_type"
                                            placeholder="Packaging..."
                                            className="text-dark col-12 disabled"
                                            options={pkgOptions}
                                            isLoading={pkgLoading}
                                            onChange={(val) => {
                                                handleQtyTypeChange(val);
                                                onChange(val);
                                            }}
                                            value={value}
                                        />
                                    )}
                                />
                                <ErrorMessage source={errors.qty_type} />
                            </div>
                        </div>
                    </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="qty_package">
                    <Row>
                        <Col sm={"12"} md="4">
                            <Form.Label>Qty/Package</Form.Label>
                        </Col>
                        <Col sm={"12"} md="8">
                            <Controller
                                name="qty_per_pkg"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        onChange={(val) => {
                                            handleQtyPerPkgChange(val);
                                            onChange(val);
                                        }}
                                        value={value}
                                    />
                                )}
                            />
                            <ErrorMessage source={errors.qty_per_pkg} />
                        </Col>
                    </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="unit_stock">
                    <Row>
                        <Col sm={"12"} md="4">
                            <Form.Label>Unit Stock Price</Form.Label>
                        </Col>
                        <Col sm={"12"} md="8">
                            <Controller
                                name="unit_stock"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        onChange={(val) => {
                                            handleUnitStockChange(val);
                                            onChange(val);
                                        }}
                                        value={value}
                                    />
                                )}
                            />
                            <ErrorMessage source={errors.unit_stock} />
                        </Col>
                    </Row>
                </Form.Group>

                <Form.Group className="mb-3 mt-3" controlId="amount_paid">
                    <Row>
                        <Col sm={"12"} md="4">
                            <Form.Label>Amount Paid</Form.Label>
                        </Col>
                        <Col sm={"12"} md="8">
                            <Form.Control
                                type="number"
                                placeholder="0"
                                {...register("amount_paid")}
                            />
                            <ErrorMessage source={errors.amount_paid} />
                        </Col>
                    </Row>
                </Form.Group>

                <Button
                    className="w-75 mx-auto"
                    variant="primary"
                    disabled={networkRequest}
                    onClick={handleSubmit(onSubmit)}
                >
                    { (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
                    { (!networkRequest) && `Save` }
                </Button>
            </Form>
        </>
    );
};

export default PurchasesUpdateForm;
