import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FaStoreAlt } from "react-icons/fa";

//
import StoreTable from "../Components/StoreComp/StoreTable";
import StoreFormInputs from "../Components/StoreComp/StoreFormInputs";
import MyOffcanvasMenu from "../Components/MyOffcanvasMenu";
import { storeSubMenu } from "../../data";

const Store = () => {
	// const [show, setShow] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const handleCloseModal = () => {
		setShowModal(false);
	};
	const handleShowModal = () => setShowModal(true);

	return (
		<>
			{/* Offcanvas Sidebar for small screens */}
			<div>
				<MyOffcanvasMenu
					menuItems={storeSubMenu}
					handleShowModal={handleShowModal}
					handleCloseModal={handleCloseModal}
				/>
			</div>
			<div className="container-fluid row">
				<div className="text-center my-5">
					<h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
						<span className="me-4">Store</span>
						<FaStoreAlt className="text-warning" size={"30px"} />
					</h2>
				</div>
				{/* Sidebar for large screens */}
				<aside className="col-4 p-3 d-none d-md-block bg-light shadow-sm vh-100">
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
