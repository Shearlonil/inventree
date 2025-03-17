import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { storeItemRegSchema } from "../../Utils/yup-schema-validator/store-form-schema";
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
import numeral from "numeral";

//	ref:	https://help.nextar.com/tutorial/stock-control
const StoreItemRegForm = (props) => {
	const { data, fnSave, networkRequest }  = props;
	
	const navigate = useNavigate();
	
	const { handleRefresh, logout } = useAuth();

	// for tracts
	const [tractOptions, setTractOptions] = useState([]);
	const [tractsLoading, setTractsLoading] = useState(true);

	// for pkg
	const [pkgOptions, setPkgOptions] = useState([]);
	const [pkgLoading, setPkgLoading] = useState(true);

	// for vendors
	const [vendorOptions, setVendorOptions] = useState([]);
	const [vendorsLoading, setVendorsLoading] = useState(true);
	
	//	for form calculation
	const [totalQty, setTotalQty] = useState(0);
	const [qtyType, setQtyType] = useState(null);
	const [qtyPerPkg, setQtyPerPkg] = useState(0);
	const [unitStockPrice, setUnitStockPrice] = useState(0);
	const [markup, setMarkup] = useState(0);


	const {
		register,
		handleSubmit,
		control,
		setValue,
		resetField,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(storeItemRegSchema),
		defaultValues: {
			item_name: null,
			total_qty: 0,
			qty_per_pkg: 0,
			unit_stock: 0,
			unit_sales: 0,
			pkg_stock_price: 0,
			pkg_sales_price: 0,
			amount_paid: 0,
			markup: 0,
			section: null,
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
            const urls = [ '/api/pkg/active', '/api/vendors/active', '/api/tracts/active' ];
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
				const pkgType = {value: data.pkg.id, label: data.pkg.name};
				setValue("item_name", data.itemName);
				setValue("total_qty", data.qty);
				setValue("qty_per_pkg", data.qtyPerPkg);
				setValue("unit_stock", numeral(data.unitStockPrice).value());
				setValue("unit_sales", numeral(data.unitSalesPrice).value());
				setValue("pkg_stock_price", numeral(data.pkgStockPrice).value());
				setValue("pkg_sales_price", numeral(data.pkgSalesPrice).value());
				setValue("amount_paid",numeral( data.cashPurchaseAmount).value());
				setValue("section", {value: data.tract.id, label: data.tract.name});
				setValue("qty_type", pkgType);
				setValue("vendor", {value: data.vendor.id, label: data.vendor.name});
				setValue("expDate", data.expDate);

				//	update states for calculation
				setTotalQty(data.qty);
				setQtyPerPkg(data.qtyPerPkg);
				setQtyType(pkgType);
				setUnitStockPrice(data.unitStockPrice);
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
		if(props.data?.id){
			//	if data has id, then update mode
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
			setValue("pkg_stock_price", 0);
			return;
		}
		calcAmountFromUnitStock(e.target.value);
	}

	const handleMarkupChange = (e) => {
		setMarkup(e.target.value);
		if(unitStockPrice == 0 || e.target.value == 0){
			calcSalesPricesFromMarkup(0);
			setValue("markup", 0);
			return;
		}
		calcSalesPricesFromMarkup(e.target.value);
	}
	
	//  private helper function to calculate pkg stock amount from unitStockPrice
	const calcAmountFromUnitStock = (unitStockPrice) => {
		const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
		const amountPaid = qtyType.label.toLowerCase() === "unit" ? 
			numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
			numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
		setValue("pkg_stock_price", numeral(pkgAmount).value());
		setValue("amount_paid", numeral(amountPaid).value());
		calcSalesPricesFromUnitStock(unitStockPrice);
	}
	
	//  private helper function to calculate pkg stock amount and amount paid from totalQty
	const calcAmountFromTotalQty = (totalQty) => {
		if(unitStockPrice == 0 || qtyPerPkg == 0 || qtyType == null){
			setValue("pkg_stock_price", 0);
			return;
		}
		const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
		const amountPaid = qtyType.label.toLowerCase() === "unit" ? 
			numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
			numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00');
		setValue("pkg_stock_price", numeral(pkgAmount).value());
		setValue("amount_paid", numeral(amountPaid).value());
	}
	
	//  private helper function to calculate pkg stock amount and amount paid from qtyType
	const calcAmountFromQtyType = (qtyType) => {
		if(unitStockPrice == 0 || qtyPerPkg == 0 || totalQty == 0){
			setValue("pkg_stock_price", 0);
			return;
		}
		const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
		const amountPaid = qtyType.toLowerCase() === "unit" ? 
			numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
			numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00');
		setValue("pkg_stock_price", numeral(pkgAmount).value());
		setValue("amount_paid", numeral(amountPaid).value());
	}
	
	//  private helper function to calculate pkg stock amount and amount paid from qtyPerPkg
	const calcAmountFromQtyPerPkg = (qtyPerPkg) => {
		if(unitStockPrice == 0 || qtyType == null || totalQty == 0){
			setValue("pkg_stock_price", 0);
			return;
		}
		const pkgAmount = numeral(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00'); 
		const amountPaid = qtyType.label.toLowerCase() === "unit" ? 
			numeral(totalQty).multiply(unitStockPrice).format('₦0,0.00') :
			numeral(totalQty).multiply(qtyPerPkg).multiply(unitStockPrice).format('₦0,0.00');
		setValue("pkg_stock_price", numeral(pkgAmount).value());
		setValue("amount_paid", numeral(amountPaid).value());
	}
	
	//  private helper function to calculate sales prices from markup
	const calcSalesPricesFromMarkup = (markup) => {
		if(unitStockPrice == 0 || markup == 0){
			setValue("unit_sales", 0);
			setValue("pkg_sales_price", 0);
			return;
		}
		const calcMarkup = numeral(unitStockPrice).multiply(numeral(markup).divide(100).value()).value();
		/*	round unit sales price to the nearest multiple of 10
			https://www.geeksforgeeks.org/round-the-given-number-to-nearest-multiple-of-10/
			https://stackoverflow.com/questions/7948170/convert-number-to-the-nearest-multiple-of-10
			https://stackoverflow.com/questions/11022488/javascript-using-round-to-the-nearest-10
		*/
		const unitSalesPrice = Math.round(numeral(unitStockPrice).add(calcMarkup).value() / 10) * 10;
		const pkgSalesPrice = numeral(unitSalesPrice).multiply(qtyPerPkg);
		setValue("unit_sales", unitSalesPrice);
		setValue("pkg_sales_price", numeral(pkgSalesPrice).value());
	}
	
	//  private helper function to calculate sales prices from unit stock price
	const calcSalesPricesFromUnitStock = (unitStockPrice) => {
		if(unitStockPrice == 0 || markup == 0){
			setValue("unit_sales", 0);
			setValue("pkg_sales_price", 0);
			return;
		}
		const calcMarkup = numeral(unitStockPrice).multiply(numeral(markup).divide(100).value()).value();
		/*	round unit sales price to the nearest multiple of 10
			https://www.geeksforgeeks.org/round-the-given-number-to-nearest-multiple-of-10/
			https://stackoverflow.com/questions/7948170/convert-number-to-the-nearest-multiple-of-10
			https://stackoverflow.com/questions/11022488/javascript-using-round-to-the-nearest-10
		*/
		const unitSalesPrice = Math.round(numeral(unitStockPrice).add(calcMarkup).value() / 10) * 10;
		const pkgSalesPrice = numeral(unitSalesPrice).multiply(qtyPerPkg);
		setValue("unit_sales", unitSalesPrice);
		setValue("pkg_sales_price", numeral(pkgSalesPrice).value());
	}

	const reset = () => {
		resetField('section');
		resetField('item_name');
		resetField('total_qty');
		resetField('qty_per_pkg');
		resetField('unit_stock');
		resetField('unit_sales');
		resetField('pkg_stock_price');
		resetField('pkg_sales_price');
		resetField('amount_paid');
		resetField('qty_type');
		resetField('vendor');
		resetField('expDate');
	}

	return (
		<>
			<Form className="d-flex flex-column gap-2">

				<h5 className="mt-1 text-primary mb-0">Item Properties</h5>
				<hr className="mt-0" />

				<Controller
					name="section"
					control={control}
					render={({ field: { onChange, value } }) => (
						<Select
							required
							placeholder="Choose Section..."
							className="text-dark col-12 mb-3"
							options={tractOptions}
							isLoading={tractsLoading}
							onChange={(val) => onChange(val)}
							value={value}
						/>
					)}
				/>
				<ErrorMessage source={errors.section} />

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
				<Form.Group className="mb-3" controlId="total_qty">
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
											className="text-dark col-12"
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

				<h6 className="fw-bold text-primary mb-0">Stock Prices</h6>
				<hr className="mt-0" />
				
				<Form.Group className="mb-3" controlId="unit_stock">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Unit Stock</Form.Label>
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

				<Form.Group className="mb-3" controlId="markup">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Markup (%)</Form.Label>
						</Col>
						<Col sm={"12"} md="4">
							<Controller
								name="markup"
								control={control}
								render={({ field: { onChange } }) => (
									<Form.Control
										type="number"
										placeholder="0"
										onChange={(val) => {
											handleMarkupChange(val);
											onChange(val);
										}}
									/>
								)}
							/>
						</Col>
						<ErrorMessage source={errors.markup} />
					</Row>
				</Form.Group>

				<h6 className="fw-bold text-primary mb-0">Sales Prices</h6>
				<hr className="mt-0" />

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

				<h5 className="mt-3 text-primary">Vendor</h5>

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
					{ (networkRequest) && <ThreeDotLoading color="#ffffff" size="small" /> }
					{ (!networkRequest) && `Save` }
				</Button>
			</Form>
		</>
	);
};

export default StoreItemRegForm;
