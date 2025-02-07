import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { restockSchema } from "../../Utils/yup-schema-validator/store-form-schema";
import ErrorMessage from "../ErrorMessage";
import { useAuth } from "../../app-context/auth-user-context";
import genericController from "../../Controllers/generic-controller";
import handleErrMsg from '../../Utils/error-handler';
import { ItemRegDTO } from "../../Entities/ItemRegDTO";
import { format } from "date-fns";
import { Packaging } from "../../Entities/Packaging";
import { Vendor } from '../../Entities/Vendor';
import { Tract } from '../../Entities/Tract';
import { ThreeDotLoading } from "../react-loading-indicators/Indicator";

const RestockForm = (props) => {
	const { data, fnSave, dbItemOptions, networkRequest }  = props;

	const navigate = useNavigate();

	// for pkg
	const [pkgOptions, setPkgOptions] = useState([]);
	const [pkgLoading, setPkgLoading] = useState(true);

	// for vendors
	const [vendorOptions, setVendorOptions] = useState([]);
	const [vendorsLoading, setVendorsLoading] = useState(true);

	const { handleRefresh, logout } = useAuth();

	const {
		register,
		handleSubmit,
		control,
		setValue,
		reset,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(restockSchema),
		defaultValues: {
			item: null,
			total_qty: 0,
			qty_per_pkg: 0,
			unit_stock: 0,
			unit_sales: 0,
			pkg_stock_price: 0,
			pkg_sales_price: 0,
			amount_paid: 0,
			qty_type: null,
			vendor: null,
			expDate: null,
		},
	});

    useEffect( () => {
		initialize();
    }, []);

	const initialize = async () => {
		try {
            const urls = [ '/api/pkg/active', '/api/vendors/active' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: pkgRequest, 1: vendorRequest } = response;

            //	check if the request to fetch pkg doesn't fail before setting values to display
            if(pkgRequest){
                setPkgLoading(false);
				setPkgOptions(pkgRequest.data.map( pkg => ({label: pkg.name, value: pkg.id})));
            }

            //	check if the request to fetch vendors doesn't fail before setting values to display
            if(vendorRequest){
				setVendorsLoading(false);
                setVendorOptions(vendorRequest.data.map( vendor => ({label: vendor.name, value: vendor.id})));
            }

			if(data){
				setValue("total_qty", data.qty);
				setValue("qty_per_pkg", data.qtyPerPkg);
				setValue("unit_stock", data.unitStockPrice);
				setValue("unit_sales", data.unitSalesPrice);
				setValue("pkg_stock_price", data.pkgStockPrice);
				setValue("pkg_sales_price", data.pkgSalesPrice);
				setValue("amount_paid", data.cashPurchaseAmount);
				setValue("item", {value: data.id, label: data.itemName});
				setValue("qty_type", {value: data.pkg.id, label: data.pkg.name});
				setValue("vendor", {value: data.vendor.id, label: data.vendor.name});
				setValue("expDate", data.expDate);
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
		if(props.data?.itemDetailId){
			//	if data has itemDetailId, then update mode
			setItem(props.data, formData);
			await fnSave(props.data);
		}else {
			// 	else, create new item
			const item = new ItemRegDTO();
			setItem(item, formData);
			await fnSave(item);
			//	only reset when new item is added and not edited
			reset();
		}
	};

	const setItem = (item, formData) => {
		item.itemName = formData.item.label;
        item.id = formData.item.value;
		item.qty = formData.total_qty;
		item.expDate = formData.expDate ? format(formData.expDate, "yyyy-MM-dd") : null;
		item.qtyPerPkg = formData.qty_per_pkg;
		item.unitStockPrice = formData.unit_stock;
		item.unitSalesPrice = formData.unit_sales;
		item.pkgStockPrice = formData.pkg_stock_price;
		item.pkgSalesPrice = formData.pkg_sales_price;
		item.cashPurchaseAmount = formData.amount_paid;

		const pkg = new Packaging();
		pkg.id = formData.qty_type.value;
		pkg.name = formData.qty_type.label;
		item.pkg = pkg;

		const vendor = new Vendor();
		vendor.id = formData.vendor.value;
		vendor.name = formData.vendor.label;
		item.vendor = vendor;
        
        //  setting a dummy tract to bypass backend ItemRegDTO as it's not needed for restock
        const tract = new Tract();
        tract.id = 1;
        tract.name = "";
        item.tract = tract;
	}

	return (
		<>
			<Form className="d-flex flex-column gap-2">

				<Form.Group className="mb-3" controlId="item_name">
					<Row>
						<Col sm={"12"} md="12">
                            <Controller
                                name="item"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        required
                                        placeholder="Select Item..."
                                        className="text-dark col-12"
                                        options={dbItemOptions}
                                        onChange={(val) => onChange(val)}
                                        value={value}
                                    />
                                )}
                            />
                            <ErrorMessage source={errors.item} />
						</Col>
					</Row>
				</Form.Group>
				<Form.Group className="mb-3" controlId="item_name">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Total Qty</Form.Label>
						</Col>
						<div className="row">
							<div className="col-6">
								<Form.Control
									type="number"
									placeholder="0"
									{...register("total_qty")}
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
											className="text-dark col-12"
											options={pkgOptions}
											isLoading={pkgLoading}
											onChange={(val) => onChange(val)}
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
							<Form.Control
								type="number"
								placeholder="0"
								{...register("qty_per_pkg")}
							/>
							<ErrorMessage source={errors.qty_per_pkg} />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="exp_date">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Exp Date:</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Controller
								name="expDate"
								control={control}
								render={({ field }) => (
									<Datetime
										{...field}
										timeFormat={false}
										closeOnSelect={true}
										dateFormat="DD/MM/YYYY"
										inputProps={{
											placeholder: "Choose exp. date",
											className: "form-control",
											readOnly: true, // Optional: makes input read-only
										}}
										value={field.value ? new Date(field.value) : null}
										onChange={(date) => field.onChange(date ? date.toDate() : null)}
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
						</Col>
					</Row>
				</Form.Group>
				<Form.Group className="mb-3" controlId="unit_stock">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Unit Stock</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control
								type="number"
								placeholder="0"
								{...register("unit_stock")}
							/>
							<ErrorMessage source={errors.unit_stock} />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="unit_sales">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Unit Sales</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control
								type="number"
								placeholder="0"
								{...register("unit_sales")}
							/>
							<ErrorMessage source={errors.unit_sales} />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="pkg_stock_price">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Package Stock</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control
								type="number"
								placeholder="0"
								{...register("pkg_stock_price")}
							/>
							<ErrorMessage source={errors.pkg_stock_price} />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="pkg_sales_price">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Package Sales</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control
								type="number"
								placeholder="0"
								{...register("pkg_sales_price")}
							/>
							<ErrorMessage source={errors.pkg_sales_price} />
						</Col>
					</Row>
				</Form.Group>

				<h5 className="mt-3">Vendor</h5>

				<Controller
					name="vendor"
					control={control}
					render={({ field: { onChange, value } }) => (
						<Select
							required
							name="vendor"
							placeholder="Choose Vendor..."
							className="text-dark col-12"
							options={vendorOptions}
							isLoading={vendorsLoading}
							onChange={(val) => onChange(val)}
							value={value}
						/>
					)}
				/>
				<ErrorMessage source={errors.vendor} />

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

export default RestockForm;
