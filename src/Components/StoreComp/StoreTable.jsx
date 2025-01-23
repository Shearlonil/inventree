import React from "react";
import { Table } from "react-bootstrap";

const StoreTable = () => {
	return (
		<>
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
						<th className="text-nowrap">Cash</th>
						<th className="text-nowrap">Vendor</th>
						<th className="text-nowrap">Cr.</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: 10 }).map((_, index) => (
						<tr key={index}>
							<td>{index + 1}</td>
							<td>Item A</td>
							<td>1</td>
							<td>4500</td>
							<td>Unit</td>
							<td>34</td>
							<td>1</td>
							<td>1</td>
							<td>1</td>
							<td>1</td>
							<td>N/A</td>
							<td>Pharmacy</td>
							<td>4500000.00</td>
							<td className="text-nowrap">WORLDWIDE HEALTHCARE (GSK)</td>
							<td>4500000.00</td>
							<td>4500000.00</td>
						</tr>
					))}
				</tbody>
			</Table>
		</>
	);
};

export default StoreTable;
