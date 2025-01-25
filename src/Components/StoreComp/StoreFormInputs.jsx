import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import { schema } from "../../Utils/yup-schema-validator/store-form-schema";
import { sectionOption, packagingOptions, purchasesOptions } from "../../../data";
import ErrorMessage from "../ErrorMessage";

const StoreFormInputs = (props) => {
	const { submitData }  = props;

	const {
		register,
		handleSubmit,
		control,
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

	const onSubmit = (data) => {
		submitData(data);
	};

	return (
		<>
			<Form className="d-flex flex-column gap-2">
				<Controller
					name="section"
					control={control}
					render={({ field: { onChange } }) => (
						<Select
							required
							name="section"
							placeholder="Choose Section..."
							className="text-dark col-12"
							options={sectionOption}
							onChange={(val) => onChange(val.value)}
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
									render={({ field: { onChange } }) => (
										<Select
											required
											name="qty_type"
											placeholder="Unit..."
											className="text-dark col-12"
											options={packagingOptions}
											onChange={(val) => onChange(val.value)}
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
											placeholder: "Choose start date",
											className: "form-control",
											readOnly: true, // Optional: makes input read-only
										}}
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
					render={({ field: { onChange } }) => (
						<Select
							required
							name="vendor"
							placeholder="Choose Vendor..."
							className="text-dark col-12"
							options={sectionOption}
							onChange={(val) => onChange(val.value)}
						/>
					)}
				/>
				<ErrorMessage source={errors.vendor} />

				<Form.Group className="mb-3 mt-3" controlId="purchase_mode">
					<Row>
						<div className="row">
							<div className="col-6">
								<Form.Label>Purchases Mode</Form.Label>
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
				</Form.Group>

				<Form.Group className="mb-3" controlId="amount_paid">
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
					onClick={handleSubmit(onSubmit)}
				>
					Save
				</Button>
			</Form>
		</>
	);
};

export default StoreFormInputs;
