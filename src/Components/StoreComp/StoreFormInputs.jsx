import React from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

const StoreFormInputs = () => {
	const selectOption = [
		{ value: "pharmarcy", label: "Pharmarcy" },
		{ value: "hotel", label: "Hotel" },
		{ value: "superMarket", label: "SuperMarket" },
	];
	const unitOption = [
		{ value: "kg", label: "KG" },
		{ value: "ton", label: "TON" },
		{ value: "gram", label: "Gram(s)" },
	];

	return (
		<>
			<Form className="d-flex flex-column gap-2">
				<Select
					required
					placeholder="Choose Store..."
					className="shadow-sm"
					options={selectOption}
					onChange={""}
				/>

				<h3 className="mt-3">Item Properties</h3>

				<Form.Group className="mb-3" controlId="item_name">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Name</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="text" placeholder="Item Name" />
						</Col>
					</Row>
				</Form.Group>
				<Form.Group className="mb-3" controlId="item_name">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Total Qty</Form.Label>
						</Col>
						<div className="d-flex gap-3">
							<Form.Control
								type="text"
								placeholder="Item Name"
								style={{ width: "50%" }}
							/>
							<Select
								required
								placeholder="Choose Store..."
								className="shadow-sm"
								options={unitOption}
								onChange={""}
								style={{ width: "50%" }}
							/>
						</div>
					</Row>
				</Form.Group>
				<Form.Group className="mb-3" controlId="qty_package">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Qty/Package</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="number" placeholder="0" />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="exp_date">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Exp Date:</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="number" placeholder="0" />
						</Col>
					</Row>
				</Form.Group>
				<Form.Group className="mb-3" controlId="unit_stock">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Unit Stock</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="number" placeholder="0" />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="unit_sales">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Unit Sales</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="number" placeholder="0" />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="package_stock">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Package Stock</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="number" placeholder="0" />
						</Col>
					</Row>
				</Form.Group>

				<Form.Group className="mb-3" controlId="package_sales">
					<Row>
						<Col sm={"12"} md="4">
							<Form.Label>Package Sales</Form.Label>
						</Col>
						<Col sm={"12"} md="8">
							<Form.Control type="number" placeholder="0" />
						</Col>
					</Row>
				</Form.Group>

				<Button variant="primary" type="submit">
					Submit
				</Button>
			</Form>
		</>
	);
};

export default StoreFormInputs;
