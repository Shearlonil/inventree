import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { schema } from "../../Utils/yup-schema-validator/store-form-schema";
import ErrorMessage from "../ErrorMessage";
import { useAuth } from "../../app-context/auth-user-context";
import genericController from "../../Controllers/generic-controller";
import handleErrMsg from '../../Utils/error-handler';
import { ItemRegDTO } from "../../Entities/ItemRegDTO";
import { format } from "date-fns";
import { Packaging } from "../../Entities/Packaging";
import { Vendor } from '../../Entities/Vendor';
import { Tract } from '../../Entities/Tract';
import storeController from "../../Controllers/store-controller";
import { OribitalLoading } from "../react-loading-indicators/Indicator";

const StoreFormInputs = (props) => {
	const { submitData, data, stockRecId }  = props;

	const navigate = useNavigate();

	const [networkRequest, setNetworkRequest] = useState(false);

	// for tracts
	const [tractOptions, setTractOptions] = useState([]);
	const [tractsLoading, setTractsLoading] = useState(true);

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
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			total_qty: 0,
			qty_per_pkg: 0,
			unit_stock: 0,
			unit_sales: 0,
			pkg_stock_price: 0,
			pkg_sales_price: 0,
			amount_paid: 0,
		},
	});

    useEffect( () => {
		initialize();
    }, []);

	const initialize = async () => {
		try {
            const urls = [ '/api/pkg/all', '/api/vendors/active', '/api/tracts/all' ];
            const response = await genericController.performGetRequests(urls);
            const { 0: pkgRequest, 1: vendorRequest, 2: tractRequest } = response;

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

            //	check if the request to fetch tracts doesn't fail before setting values to display
            if(tractRequest){
				setTractsLoading(false);
                setTractOptions(tractRequest.data.map( tract => ({label: tract.name, value: tract.id})));
            }

			if(data){
				setValue("item_name", data.itemName);
				setValue("total_qty", data.qty);
				setValue("qty_per_pkg", data.qtyPerPkg);
				setValue("unit_stock", data.unitStockPrice);
				setValue("unit_sales", data.unitSalesPrice);
				setValue("pkg_stock_price", data.pkgStockPrice);
				setValue("pkg_sales_price", data.pkgSalesPrice);
				setValue("amount_paid", data.cashPurchaseAmount);
				setValue("section", {value: data.tract.id, label: data.tract.name});
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
				console.log(error);
			}
		}
	};

	const onSubmit = async (formData) => {
		try {
			if(props.data?.id){
				//	if data has id, then update mode
				setItem(props.data, formData);
				const stock_rec_id = await save(props.data);
				submitData(stock_rec_id, props.data);
			}else {
				// 	else, create new item
				const item = new ItemRegDTO();
				setItem(item, formData);
				const stock_rec_id = await save(item);
				submitData(stock_rec_id, item);
			}
		} catch (error) {
			toast.error(handleErrMsg(error).msg);
		}
	};

	const setItem = (item, formData) => {
		item.itemName = formData.item_name;
		item.qty = formData.total_qty;
		item.expDate = formData.expDate ? format(formData.expDate, "yyyy-MM-dd") : null;
		item.qtyPerPkg = formData.qty_per_pkg;
		item.unitStockPrice = formData.unit_stock;
		item.unitSalesPrice = formData.unit_sales;
		item.pkgStockPrice = formData.pkg_stock_price;
		item.pkgSalesPrice = formData.pkg_sales_price;
		item.sectionName = formData.section;
		item.cashPurchaseAmount = formData.amount_paid;

		const pkg = new Packaging();
		pkg.id = formData.qty_type.value;
		pkg.name = formData.qty_type.label;
		item.pkg = pkg;

		const vendor = new Vendor();
		vendor.id = formData.vendor.value;
		vendor.name = formData.vendor.label;
		item.vendor = vendor;

		const tract = new Tract();
		tract.id = formData.section.value;
		tract.name = formData.section.label;
		item.tract = tract;
	}

	const save = async (item) => {
		try {
			if(item.id){
				await storeController.updateStockRecItem(item);
			}else {
				let response = await storeController.persistStockRecItem(stockRecId, item);
				if(response && response.status === 200){
					item.id = response.data.items[0].id;
					item.itemDetailId = response.data.items[0].itemDetailId;
					return response.data.id;
				}
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return save(item);
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
			throw error;
		}
	}

	return (
		<>
			<Form className="d-flex flex-column gap-2">
				<Controller
					name="section"
					control={control}
					render={({ field: { onChange, value } }) => (
						<Select
							required
							placeholder="Choose Section..."
							className="text-dark col-12"
							options={tractOptions}
							isLoading={tractsLoading}
							onChange={(val) => onChange(val)}
							value={value}
						/>
					)}
				/>
				<ErrorMessage source={errors.section} />

				<h5 className="mt-3">Item Properties</h5>

				<Form.Group className="mb-3" controlId="item_name">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Name</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control
								type="text"
								placeholder="Item Name"
								{...register("item_name")}
							/>
							<ErrorMessage source={errors.item_name} />
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
											placeholder="Unit..."
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

				{/* <Form.Group className="mb-3 mt-3" controlId="purchase_mode">
					<Row>
						<div className="row">
							<div className="col-6">
								<Form.Label>Purchase Mode</Form.Label>
							</div>
							<div className="col-6 p-0">
								<Controller
									name="purchase_mode"
									control={control}
									render={({ field: { onChange } }) => (
										<Select
											required
											name="purchase_mode"
											placeholder="Unit..."
											className="text-dark col-12"
											options={purchasesOptions}
											onChange={(val) => onChange(val.value)}
										/>
									)}
								/>

								<ErrorMessage source={errors.purchase_mode} />
							</div>
						</div>
					</Row>
				</Form.Group> */}

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
					{ networkRequest && <OribitalLoading color="#ffffff" size="medium" variant="spokes" /> }
					{ !networkRequest && `Save` }
				</Button>
			</Form>
		</>
	);
};

export default StoreFormInputs;
