import React, { useState } from "react";
import { Offcanvas, Nav } from "react-bootstrap";
import { CgMenuLeft } from "react-icons/cg";
import { useLocation } from "react-router-dom";
import IMAGES from "../assets/Images";

const OffcanvasMenu = ({ menuItems, menuItemClick = () => {} }) => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const location = useLocation();

	return (
		<>
			<div variant="dark" 
				style={{boxShadow: '4px 4px 4px #9E9E9E', maxWidth: '50px'}}
				className="m-2 p-2 rounded bg-success text-white rounded-5 d-flex justify-content-center" onClick={handleShow}>
				<CgMenuLeft size={"30px"} />
			</div>

			<Offcanvas show={show} onHide={handleClose} placement="start">
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>
						<img src={IMAGES.logo} width={"120px"} />
					</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<Nav className="flex-column">
						{menuItems &&
							menuItems.map(({ label, onClickParams }) => (
								<Nav.Link
									key={label}
									className="mb-2"
									onClick={(e) => {
										handleClose();
										menuItemClick(onClickParams, e);
									}}
								>
									{label}
								</Nav.Link>
							))
						}
					</Nav>
				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
};
export default OffcanvasMenu;
