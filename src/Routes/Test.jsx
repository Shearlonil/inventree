import React from "react";
import { Button, Form } from "react-bootstrap";
import { HiUser, HiOutlineCreditCard } from "react-icons/hi";

const CustomerDetailsPage = () => {
	return (
		<div className="d-flex flex-column flex-md-row bg-light vh-100">
			{/* Sidebar Section */}
			<div className="bg-primary text-white p-4 d-flex flex-column align-items-center w-100 w-md-30">
				{/* Customer Profile Section */}
				<div className="text-center mb-4">
					<HiUser size={80} className="mb-3" />
					<h4>John Doe</h4>
					<p className="text-light">Customer ID: #12345</p>
				</div>

				{/* Wallet Info */}
				<div className="mb-3 text-center">
					<p className="fw-bold">
						Wallet Balance: <span className="text-warning">₦1100.00</span>
					</p>
					<p>
						Discount: <span className="text-success">0%</span>
					</p>
				</div>

				{/* Footer Actions */}
				<div className="d-flex flex-column gap-3 w-100">
					<Button variant="outline-light">Edit Profile</Button>
					<Button variant="outline-light">View History</Button>
				</div>
			</div>

			{/* Main Content Section */}
			<div className="flex-grow-1 p-4">
				{/* Search Section */}
				<div className="mb-4">
					<h3 className="mb-3">Search Customer</h3>
					<div className="d-flex flex-column flex-sm-row gap-3">
						<Form.Control
							type="text"
							placeholder="Search by Name or Card Number"
						/>
						<Button variant="primary">Search</Button>
					</div>
				</div>

				{/* Payment Section */}
				<div className="mb-4">
					<h3 className="mb-3">Payment Mode</h3>
					<div className="d-flex flex-wrap gap-4 payment-mode-cards">
						{["Cash", "Transfer", "POS/ATM", "Wallet"].map((mode, index) => (
							<div
								key={index}
								className="d-flex flex-column gap-2 border p-3 rounded shadow-sm"
							>
								<Form.Check type="checkbox" label={mode} className="fw-bold" />
								<Form.Control type="number" placeholder="Enter Amount" />
							</div>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="d-flex justify-content-between align-items-center action-buttons">
					<Form.Check
						type="checkbox"
						label="Print Receipt"
						className="fw-bold"
					/>
					<div className="d-flex flex-column flex-sm-row gap-3">
						<Button variant="danger" className="btn">
							Cancel
						</Button>
						<Button variant="success" className="btn">
							Confirm
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerDetailsPage;
