import React, { useState } from "react";
import { Button, Col, Form, Offcanvas, Row, Table } from "react-bootstrap";
import Select from "react-select";
import { BiLeftIndent } from "react-icons/bi";
import { RxPinLeft } from "react-icons/rx";
import { CgMenuLeft } from "react-icons/cg";

//
import StoreTable from "../Components/StoreComp/StoreTable";
import StoreFormInputs from "../Components/StoreComp/StoreFormInputs";

const Store = () => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<div className="d-flex flex-column flex-md-row vh-100">
			{/* Sidebar for large screens */}
			<aside
				className="d-none d-md-block bg-light p-3 shadow-sm"
				style={{ width: "450px", overflowY: "auto" }}
			>
				<h5>Form Input</h5>
				<StoreFormInputs />
			</aside>

			{/* Offcanvas Sidebar for small screens */}
			<div>
				<Button variant="dark" className="d-md-none m-2" onClick={handleShow}>
					<div className="d-flex align-items-center gap-2">
						{/* <BiLeftIndent /> */}
						{/* <RxPinLeft /> */}
						<CgMenuLeft />
						<span>Item Menu</span>
					</div>
				</Button>
			</div>
			<Offcanvas show={show} onHide={handleClose}>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Form Input</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<StoreFormInputs />
				</Offcanvas.Body>
			</Offcanvas>

			{/* Main Content */}
			<main className="flex-grow-1 p-3">
				<StoreTable />
			</main>
		</div>
	);
};

export default Store;
