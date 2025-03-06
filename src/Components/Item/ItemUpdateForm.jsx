import React, { useEffect } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import "react-datetime/css/react-datetime.css";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';

import { itemUpdateSchema } from "../../Utils/yup-schema-validator/store-form-schema";
import ErrorMessage from "../ErrorMessage";
import { ThreeDotLoading } from "../react-loading-indicators/Indicator";
import numeral from "numeral";

//	ref:	https://help.nextar.com/tutorial/stock-control
const ItemUpdateForm = (props) => {
	const { data, fnSave, networkRequest }  = props;

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(itemUpdateSchema),
		defaultValues: {
			item_name: "",
			restock_level: 0,
			unit_sales: 0,
			pkg_sales_price: 0,
		},
	});

    useEffect( () => {
		if(data){
            setValue("item_name", data.itemName);
            setValue("unit_sales", numeral(data.unitSalesPrice).value());
            setValue("pkg_sales_price", numeral(data.pkgSalesPrice).value());
            setValue("restock_level",numeral( data.restockLevel).value());
        }
    }, []);

	const onSubmit = async (formData) => {
		props.data.itemName = formData.item_name;
		props.data.restockLevel = formData.restock_level;
		props.data.unitSalesPrice = formData.unit_sales;
		props.data.pkgSalesPrice = formData.pkg_sales_price;
		await fnSave(props.data);
	};

	return (
		<>
			<Form className="d-flex flex-column gap-2">
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
				<Form.Group className="mb-3" controlId="restock_level">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Restock Level</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Controller
								name="restock_level"
								control={control}
								render={({ field: { onChange, value } }) => (
									<Form.Control
										type="number"
										placeholder="0"
										onChange={(val) => onChange(val) }
										value={value}
									/>
								)}
							/>
							<ErrorMessage source={errors.restock_level} />
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

export default ItemUpdateForm;
