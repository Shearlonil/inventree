import React from 'react';
import { Table } from 'react-bootstrap';
import { GrTransaction } from 'react-icons/gr';
import { TbSum } from 'react-icons/tb';

import SVG from '../assets/Svg';

const LedgerDisplay = () => {
    return (
        <div className='container my-4'>
            {/* <h3 className="mb-4"><span>Ledger Summary</span></h3> */}
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<div>
					{/* <OffcanvasMenu menuItems={dispensaryOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" /> */}
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Accounting Ledgers</span>
						<img src={SVG.dispensary_filled_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    Dispense items in store to any section to increase sales quantity.
                    Please Note that Dispensary requires STORE ITEM VIEW PERMISSION
                </span>
			</div>
            <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle mt-1">
                <div className="row g-4"> {/* Adds gap between sections */}
                    {[
                        { label: "Name", value: "ELBE PHARMA LTD (LEKAN) ELBE PHARMA LTD (LEKAN) ELBE PHARMA LTD (LEKAN)" },
                        { label: "Creator", value: "pharmQAY" },
                        { label: "Date", value: "10-08-2022 09:35:32" },
                        { label: "Parent", value: "VENDORS" },
                        { label: "Status", value: "Active" }
                    ].map((item, index) => (
                        <div key={index} className="col-12 col-md-6">
                            <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                <span className="fw-bold text-md-end h5 me-2">{item.label}:</span>
                                <span>{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-info-subtle shadow my-4 p-3 rounded-4">
                <h3 className="fw-bold h5">Date Range:</h3> <br />
                <div className=' d-flex flex-column flex-md-row gap-3 justify-content-center'>
                    <div className='p-3 rounded-4 w-100 bg-light'>
                        <p><span className='fw-bold'>Start</span>: Tue Nov 12:00:00:00 CAT 2024</p>
                    </div>
                    <div className='p-3 rounded-4 w-100 bg-light'>
                        <p><span className='fw-bold'>End</span>: Tue Nov 12:00:00:00 CAT 2024</p>
                    </div>
                </div>
            </div>
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle" style={{ minHeight: "700px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow">
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th>First Name</th>
                                <th>Last</th>
                                <th>Phone No.:</th>
                                <th>Gender</th>
                                <th>Role</th>
                                <th>Username</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* <p>No content in table</p> */}
                            {Array.from({ length: 10 }).map((_, index) => (
                                <tr className='' key={index}>
                                    <td>Joy</td>
                                    <td>Samuel</td>
                                    <td>7012345678</td>
                                    <td>F</td>
                                    <td>Sales Assistant</td>
                                    <td>Joy</td>
                                    <td className='text-center'>
                                        <span className='fw-bold'>Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <div className='container my-3 p-3'>
                        <div className='d-flex flex-wrap gap-3 justify-content-between align-items-center mx-auto'>
                            <div className="">
                                <p className='fw-bold h5 text-success'>Balance:</p>
                                <h5><span>$680000</span></h5>
                            </div>
                            <div className="">
                                <p className='fw-bold h5 text-danger'>Dr.:</p>
                                <h5><span>$680000</span></h5>
                            </div>
                            <div className="">
                                <p className='fw-bold h5 text-warning'>Cr.:</p>
                                <h5><span>$680000</span></h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LedgerDisplay;
