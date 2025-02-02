import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import IMAGES from "../assets/Images";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../app-context/auth-user-context";

function NavBar() {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);

	const { authUser, logout } = useAuth();
	const user = authUser();

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
					<Nav className="mx-auto gap-2">
						<Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/");
							}}
							className={`navbar-nav nav-item p-2 ${
								location.pathname === "/" &&
								"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
							}`}
						>
							Home
						</Nav.Link>

						{user && <NavDropdown title="View" id="basic-nav-dropdown">
							<NavDropdown title="Items">
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/items/store");
									}}
									className={`nav-item ${
										location.pathname.startsWith("/items/store") &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Store
								</NavDropdown.Item>
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/items/sales");
									}}
									className={`nav-item ${
										location.pathname.startsWith("/items/sales") &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Sales/Shelf
								</NavDropdown.Item>
							</NavDropdown>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/packaging");
								}}
								className={`nav-item ${
									location.pathname.startsWith("/packaging") &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Packaging
							</NavDropdown.Item>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/sections");
								}}
								className={`nav-item ${
									location.pathname.startsWith("/sections") &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Sections
							</NavDropdown.Item>
						</NavDropdown>}

						{user && <NavDropdown title="Store" id="basic-nav-dropdown">
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/store/item/reg/0");
								}}
								className={`nav-item ${
									location.pathname.startsWith("/store/item/reg") &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								New Entry
							</NavDropdown.Item>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/store/item/restock/0");
								}}
								className={`nav-item ${
									location.pathname.startsWith("/store/item/restock") &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Restock
							</NavDropdown.Item>
							<NavDropdown.Divider />
							{user.hasAuth('DISPENSE') && <NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/store/item/dispensary");
								}}
								className={`nav-item ${
									location.pathname === "/login" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Dispensary
							</NavDropdown.Item>}
							<NavDropdown.Divider />
							{user.hasAuth('REPORT_WINDOW') && <NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/purchases");
								}}
								className={`nav-item ${
									location.pathname === "/purchases" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Purchases
							</NavDropdown.Item>}
						</NavDropdown>}

						{user && <Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/outposts");
							}}
							className={`navbar-nav nav-item p-2 ${
								location.pathname === "/outposts" &&
								"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
							}`}
						>
							Outposts
						</Nav.Link>}

						{user && <NavDropdown title="Transaction" id="basic-nav-dropdown">
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/contacts/vendors");
								}}
								className={`nav-item ${
									location.pathname === "/contacts/vendors" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Sections
							</NavDropdown.Item>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/transaction/cashier");
								}}
								className={`nav-item ${
									location.pathname === "/transaction/cashier" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Cashier
							</NavDropdown.Item>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/transaction/mono");
								}}
								className={`nav-item ${
									location.pathname === "/transaction/mono" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Unified
							</NavDropdown.Item>
						</NavDropdown>}

						{user && <Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/acct-voucher-creation");
							}}
						>
							Voucher Creation
						</Nav.Link>}

						{user && <Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/finance");
							}}
							className={`navbar-nav nav-item p-2 ${
								location.pathname === "/finance" &&
								"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
							}`}
						>
							Finance
						</Nav.Link>}

						{user && <Nav.Link
							onClick={() => {
								handleNavSelect();
								navigate("/dashboard");
							}}
							className={`navbar-nav nav-item p-2 ${
								location.pathname === "/dashboard" &&
								"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
							}`}
						>
							Dashboard
						</Nav.Link>}

						{user && <NavDropdown title="Contacts" id="basic-nav-dropdown">
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/contacts/customers");
								}}
								className={`nav-item ${
									location.pathname === "/contacts/customers" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Customers
							</NavDropdown.Item>
							<NavDropdown.Item 
								onClick={() => {
									handleNavSelect();
									navigate("/contacts/vendors");
								}}
								className={`nav-item ${
									location.pathname === "/contacts/vendors" &&
									"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
								}`}
							>
								Vendors
							</NavDropdown.Item>
						</NavDropdown>}
					</Nav>

					{!user && ( <Nav.Link
						eventKey={6}
						onClick={() => navigate("/login")}
						className={`navbar-nav nav-item p-2 ${
							location.pathname === "/login" &&
							"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
						}`}
					>
						Login
					</Nav.Link> )}
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

export default NavBar;
