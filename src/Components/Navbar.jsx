import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { toast } from "react-toastify";
import NavDropdown from "react-bootstrap/NavDropdown";

import IMAGES from "../assets/Images";
import { useAuth } from "../app-context/auth-user-context";
import handleErrMsg from "../Utils/error-handler";
import ConfirmDialog from "./DialogBoxes/ConfirmDialog";
import { ThreeDotLoading } from "./react-loading-indicators/Indicator";

function NavBar() {
	const navigate = useNavigate();
	const [expanded, setExpanded] = useState(false);

	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [displayMsg, setDisplayMsg] = useState("");

	const { authUser, logout } = useAuth();
	const user = authUser();

	const handleToggle = () => {
		setExpanded(!expanded);
	};

	const handleNavSelect = () => {
		setExpanded(false); // Close the navbar on selection (for mobile)
	};

	const handleCloseModal = () => {
		setShowConfirmModal(false);
	};

	const confirmLogout = () => {
		setDisplayMsg(`Logout of application?`);
		setShowConfirmModal(true);
	};

	const handleLogout = async () => {
		// call logout endpoint
		try {
			setShowConfirmModal(false);
			setIsLoggingOut(true);
			await logout();
			setIsLoggingOut(false);
		} catch (error) {
			// display error message
			toast.error(handleErrMsg(error).msg);
			setIsLoggingOut(false);
		}
	};

	return (
		<>
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
								<NavDropdown title="Items" className="ms-2" drop="end">
									<NavDropdown.Item 
										onClick={() => {
											handleNavSelect();
											navigate("/items/store");
										}}
										className={`nav-item ${
											location.pathname === ("/items/store") &&
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
											location.pathname === ("/items/sales") &&
											"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
										}`}
									>
										Sales/Shelf
									</NavDropdown.Item>
									<NavDropdown.Item 
										onClick={() => {
											handleNavSelect();
											navigate("/items/gross");
										}}
										className={`nav-item ${
											location.pathname === ("/items/gross") &&
											"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
										}`}
									>
										Gross
									</NavDropdown.Item>
									<NavDropdown.Item 
										onClick={() => {
											handleNavSelect();
											navigate("/items/sales-record");
										}}
										className={`nav-item ${
											location.pathname === ("/items/sales-record") &&
											"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
										}`}
									>
										Sales Record
									</NavDropdown.Item>
									<NavDropdown.Item 
										onClick={() => {
											handleNavSelect();
											navigate("/items/trash");
										}}
										className={`nav-item ${
											location.pathname === ("/items/trash") &&
											"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
										}`}
									>
										Trash
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
								{user && user.hasAuth('SECTIONS_WINDOW') && <NavDropdown.Item 
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
								</NavDropdown.Item>}
							</NavDropdown>}

							{user && <NavDropdown title="Inventory" id="basic-nav-dropdown">
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/inventory/item/reg/0");
									}}
									className={`nav-item ${
										location.pathname.startsWith("/inventory/item/reg") &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									New Entry
								</NavDropdown.Item>
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/inventory/item/restock/0");
									}}
									className={`nav-item ${
										location.pathname.startsWith("/inventory/item/restock") &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Restock
								</NavDropdown.Item>
								<NavDropdown.Divider />
								{user.hasAuth('DISPENSE') && <NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/inventory/item/dispensary/0");
									}}
									className={`nav-item ${
										location.pathname.startsWith("/inventory/item/dispensary") &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Dispensary
								</NavDropdown.Item>}
								<NavDropdown.Divider />
								{user.hasAuth('REPORT_WINDOW') && <NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/inventory/purchases");
									}}
									className={`nav-item ${
										location.pathname === "/inventory/purchases" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Purchases History
								</NavDropdown.Item>}
								{<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/inventory/stock-summary");
									}}
									className={`nav-item ${
										location.pathname === "/inventory/stock-summary" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Stock Summary
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
										navigate("/transaction/section");
									}}
									className={`nav-item ${
										location.pathname === "/transaction/section" &&
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
									Pool
								</NavDropdown.Item>
							</NavDropdown>}

							{user && user.hasAuth('FINANCE') && <NavDropdown title="Finance" id="basic-nav-dropdown">
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/finance/income-statement");
									}}
									className={`nav-item ${
										location.pathname === "/finance/income-statement" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Income Statement
								</NavDropdown.Item>
								
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/finance/profit-loss");
									}}
									className={`nav-item ${
										location.pathname === "/finance/profit-loss" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Profit & Loss Account
								</NavDropdown.Item>
								
								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/finance/trading-account");
									}}
									className={`nav-item ${
										location.pathname === "/finance/trading-account" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Trading Account
								</NavDropdown.Item>
								<NavDropdown.Divider />

								<NavDropdown title="Account Vouchers" className="ms-2" drop="end">
									<NavDropdown.Item 
										onClick={() => {
											handleNavSelect();
											navigate("/finance/vouchers/create");
										}}
										className={`nav-item ${
											location.pathname === "/finance/vouchers/create" &&
											"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
										}`}
									>
										Create
									</NavDropdown.Item>
									<NavDropdown.Item 
										onClick={() => {
											handleNavSelect();
											navigate("/finance/vouchers/0/view");
										}}
										className={`nav-item ${
											location.pathname === "/finance/vouchers/0/view" &&
											"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
										}`}
									>
										View
									</NavDropdown.Item>
								</NavDropdown>

								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/finance/groups");
									}}
									className={`nav-item ${
										location.pathname === "/finance/groups" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Account Groups
								</NavDropdown.Item>

								<NavDropdown.Item 
									onClick={() => {
										handleNavSelect();
										navigate("/finance/ledgers");
									}}
									className={`nav-item ${
										location.pathname === "/finance/ledgers" &&
										"activeLink text-success link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold"
									}`}
								>
									Account Ledgers
								</NavDropdown.Item>
							</NavDropdown>}

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

							{user && user.hasAuth('CONTACTS_WINDOWS') && <NavDropdown title="Contacts" id="basic-nav-dropdown">
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

						{user && (
							<Nav.Link
								className={`navbar-nav nav-item p-2 link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover fw-bold ${
									isLoggingOut && "disabled"} ${user && 'text-danger'}`}
								eventKey={8}
								onClick={() => confirmLogout()}
							>
								{isLoggingOut && ( <ThreeDotLoading color="#0000ff" size="small" /> )}
								{user && `Logout`}
							</Nav.Link>
						)}
					</Navbar.Collapse>
				</Container>
			</Navbar>
			<ConfirmDialog
				show={showConfirmModal}
				handleClose={handleCloseModal}
				handleConfirm={handleLogout}
				message={displayMsg}
			/>
		</>
	);
}

export default NavBar;
