import React, { useState } from "react";
import { Offcanvas, Button, Nav, Navbar } from "react-bootstrap";
import { BiMenu } from "react-icons/bi";
import { CgMenuLeft } from "react-icons/cg";

const OffcanvasMenu = ({ handleShowModal, handleCloseModal }) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<>
			<Button variant="dark" className="d-md-none m-2" onClick={handleShow}>
				<div className="d-flex align-items-center gap-2">
					{/* <BiLeftIndent /> */}
					{/* <RxPinLeft /> */}
					<CgMenuLeft />
				</div>
			</Button>

			<Offcanvas show={show} onHide={handleClose} placement="start">
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Menu</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<Nav className="flex-column">
						<Button
							onClick={() => {
								handleShowModal();
								handleClose();
							}}
						>
							Show Popup Form
						</Button>
						<Nav.Link href="#home" className="mb-2" onClick={handleClose}>
							Home
						</Nav.Link>
						<Nav.Link href="#about" className="mb-2" onClick={handleClose}>
							About
						</Nav.Link>
						<Nav.Link href="#services" className="mb-2" onClick={handleClose}>
							Services
						</Nav.Link>
						<Nav.Link href="#contact" className="mb-2" onClick={handleClose}>
							Contact
						</Nav.Link>
					</Nav>
				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
};
export default OffcanvasMenu;
