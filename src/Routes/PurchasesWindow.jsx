import React from "react";
import { Table } from "react-bootstrap";
import ReactMenu from "../Components/ReactMenu";
import { FaReceipt } from "react-icons/fa";
import MyOffcanvasMenu from "../Components/MyOffcanvasMenu";
import { purchasesSubMenu } from "../../data";

const PurchasesWindow = () => {
	return (
		<>
			<MyOffcanvasMenu menuItems={purchasesSubMenu} />
			<div className="text-center my-5">
				<h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
					<span className="me-4">Purchases</span>
					<FaReceipt className="text-success" size={"30px"} />
				</h2>
			</div>
			<div className="container-fluid px-2">
				<Table id="myTable" striped bordered hover responsive>
					<thead>
						<tr>
							<th>#</th>
							<th className="text-nowrap">Item Name</th>
							<th className="text-nowrap">Total</th>
							<th className="text-nowrap">Package</th>
							<th className="text-nowrap">Qty/Package</th>
							<th className="text-nowrap">Unit Stock</th>
							<th className="text-nowrap">Unit Sales</th>
							<th className="text-nowrap">Pack Stock</th>
							<th className="text-nowrap">Pack Sales</th>
							<th className="text-nowrap">Exp. Date</th>
							<th className="text-nowrap">Department</th>
							<th className="text-nowrap">Total</th>
							<th className="text-nowrap">Vendor</th>
							<th className="text-nowrap">Cash</th>
							<th className="text-nowrap">Cr.</th>
							<th className="text-nowrap">Option</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 10 }).map((_, index) => (
							<tr key={index}>
								<td className="text-nowrap">{index + 1}</td>
								<td className="text-nowrap">Item A</td>
								<td className="text-nowrap">4500</td>
								<td className="text-nowrap">Unit</td>
								<td className="text-nowrap">34</td>
								<td className="text-nowrap">1</td>
								<td className="text-nowrap">1</td>
								<td className="text-nowrap">1</td>
								<td className="text-nowrap">1</td>
								<td className="text-nowrap">N/A</td>
								<td className="text-nowrap">Pharmacy</td>
								<td className="text-nowrap">4500000.00</td>
								<td className="text-nowrap">WORLDWIDE HEALTHCARE (GSK)</td>
								<td className="text-nowrap">4500000.00</td>
								<td className="text-nowrap">4500000.00</td>
								<td>
									<ReactMenu />
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		</>
	);
};

export default PurchasesWindow;
