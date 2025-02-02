import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import IMAGES from "../assets/Images";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function NavBar() {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);

	const handleToggle = () => {
		setExpanded(!expanded);
	};

	const handleNavSelect = () => {
		setExpanded(false); // Close the navbar on selection (for mobile)
	};

	return (
		<Navbar
			collapseOnSelect={true}
			expanded={expanded}
			onToggle={handleToggle}
			expand="lg"
			className="bg-light py-3 shadow-sm navbar-light"
		>
			<Container>
				<Navbar.Brand>
					<Link onClick={handleNavSelect} to={"/"}>
						<img src={IMAGES.logo} alt="" width={"100px"} />
					</Link>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto">
						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/");
							}}
						>
							Home
						</Nav.Link>
						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/cashier-window");
							}}
						>
							Cashier Window
						</Nav.Link>

						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/acct-voucher-creation");
							}}
						>
							Voucher Creation
						</Nav.Link>

						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/mono-transaction");
							}}
						>
							Mono Transaction
						</Nav.Link>
						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/purchases");
							}}
						>
							Purchases Window
						</Nav.Link>
						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/finance");
							}}
						>
							Finance
						</Nav.Link>
						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/dashboard");
							}}
						>
							Dashboard
						</Nav.Link>
						<NavDropdown title="Store" id="basic-nav-dropdown">
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/store/item/reg/0");
								}}
							>
								New Entry
							</NavDropdown.Item>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/store/item/restock/0");
								}}
							>
								Restock
							</NavDropdown.Item>
							<NavDropdown.Divider />
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/store/item/dispensary");
								}}
							>
								Dispensary
							</NavDropdown.Item>
						</NavDropdown>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

export default NavBar;
