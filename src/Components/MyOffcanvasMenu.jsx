import React, { useState } from "react";
import { Offcanvas, Button, Nav } from "react-bootstrap";
import { CgMenuLeft } from "react-icons/cg";
import { useLocation } from "react-router-dom";

const MyOffcanvasMenu = ({ menuItems, handleShowModal, handleCloseModal }) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const location = useLocation();

	return (
		<>
			<Button variant="dark" className="m-2" onClick={handleShow}>
				<div className="d-flex align-items-center gap-2">
					<CgMenuLeft size={"30px"} />
				</div>
			</Button>

			<Offcanvas show={show} onHide={handleClose} placement="start">
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Menu</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<Nav className="flex-column">
						{location.pathname === "/store/item/reg/:stock_rec_id" && (
							<Button
								onClick={() => {
									handleShowModal();
									handleClose();
								}}
							>
								Show Popup Form
							</Button>
						)}

						{menuItems &&
							menuItems.map(({ label, path }) => (
								<Nav.Link
									key={label}
									href={`#${path}`}
									className="mb-2"
									onClick={() => {
										if(path === "/showForm"){
											handleShowModal();
										}
										handleClose();
									}}
								>
									{label}
								</Nav.Link>
							))
						}

						{!menuItems &&
							["Home", "About", "Services", "Contact"].map((menu) => (
								<Nav.Link
									href={`#${menu}`}
									className="mb-2"
									onClick={handleClose}
								>
									{menu}
								</Nav.Link>
							))
						}
					</Nav>
				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
};
export default MyOffcanvasMenu;
