import React, { useState } from "react";
import {
	Button,
	Col,
	Form,
	Modal,
	Offcanvas,
	Row,
	Table,
} from "react-bootstrap";
import Select from "react-select";
import { BiLeftIndent } from "react-icons/bi";
import { RxPinLeft } from "react-icons/rx";
import { CgMenuLeft } from "react-icons/cg";

//
import StoreTable from "../Components/StoreComp/StoreTable";
import StoreFormInputs from "../Components/StoreComp/StoreFormInputs";
import MyOffcanvasMenu from "../Components/MyOffcanvasMenu";

const Store = () => {
	const [show, setShow] = useState(false);

	const [showModal, setShowModal] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const handleCloseModal = () => {
		setShowModal(false);
	};
	const handleShowModal = () => setShowModal(true);

	return (
		<>
			{/* Offcanvas Sidebar for small screens */}
			<div>
				<MyOffcanvasMenu
					handleShowModal={handleShowModal}
					handleCloseModal={handleCloseModal}
				/>
			</div>
			<div className="container-fluid row">
				{/* Sidebar for large screens */}
				<aside
					className="col-4 p-3 d-none d-md-block bg-light shadow-sm"
					// style={{ width: "450px", overflowY: "auto" }}
				>
					<h5>Form Input</h5>
					<StoreFormInputs />
				</aside>

				{/* Main Content */}
				<main className="p-3 col-md-8 col-12">
					<StoreTable />
				</main>

				<Modal show={showModal} onHide={handleCloseModal}>
					<Modal.Header closeButton>
						<Modal.Title>Add Item</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<StoreFormInputs />
					</Modal.Body>
					<Modal.Footer></Modal.Footer>
				</Modal>
			</div>
		</>
	);
};

export default Store;
