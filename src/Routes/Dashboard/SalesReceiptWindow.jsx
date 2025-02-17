import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import Select from "react-select";
import { Table } from 'react-bootstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import { CgUserAdd } from 'react-icons/cg';
import { IoReceipt } from 'react-icons/io5';
import { LuReceipt } from 'react-icons/lu';

const receiptObj = [
    { id: 1, name: "Pharmacy", label: "Pharmacy", availableQtyPkg: 10, availableQtyUnit: 100, unitsPerPkg: 10 },
    { id: 2, name: "Hotel", label: "Hotel", availableQtyPkg: 5, availableQtyUnit: 50, unitsPerPkg: 10 },
    { id: 3, name: "SuperMarket", label: "SuperMarket", availableQtyPkg: 8, availableQtyUnit: 80, unitsPerPkg: 10 },
];

const SalesReceiptWindow = () => {
    const { control, formState: { errors } } = useForm({ resolver: yupResolver(dispensaryPageSchema) })
    return (
        <div>
            <div className="container-fluid">
                <div className="text-center my-5">
                    <h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
                        <span className="me-4">Sales Receipt</span>
                        <LuReceipt className="text-danger" size={"30px"} />
                    </h2>
                </div>
                <div className='row justify-content-center' id='user-window'>
                    <div className="d-md-none mb-3">
                        <p className="h5 mb-2">Receipt No.: </p>
                        <Controller
                            name="receipt_no"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <Select
                                    required
                                    placeholder="Select..."
                                    className="text-dark"
                                    options={receiptObj}
                                    onChange={(val) => val.value}
                                />
                            )}
                        />
                        <ErrorMessage source={errors.receipt_no} />
                    </div>

                    <div className="d-none d-md-block col-12 col-md-2 p-4 d-flex flex-column gap-2 rounded bg-light shadow-sm border overflow-md-auto border" style={{ minHeight: "80vh", maxHeight: '80vh', overflow: 'scroll' }}>
                        <h4 className='mb-3'>Reciept ID:-</h4>
                        <Table id="myTable" className="rounded-2" hover responsive>
                            <tbody>
                                {/* <tr> */}
                                {Array.from({ length: 20 }).map((_, index) => (
                                    <tr className='' key={index}>
                                        <td>456455</td>
                                    </tr>
                                ))}
                                {/* </tr> */}
                            </tbody>
                        </Table>
                        {/*  */}

                    </div>

                    <div className="col-12 col-md-9 p-3 shadow-sm border border-2 rounded-3 ms-1 overflow-md-auto">
                        <div className="shadow p-4 border rounded-3 bg-success-subtle mb-3">
                            <h4>Receipt Details:- </h4>
                            <div className="row g-4"> {/* Adds gap between sections */}
                                {[
                                    { label: "Cashier", value: "Titilayo" },
                                    { label: "Customer", value: "Customer" },
                                    { label: "Date", value: "10-08-2022 09:35:32" },
                                    { label: "Status", value: "Active" },
                                    { label: "Payment Mode", value: "TRANSFER = 700.00" },
                                ].map((item, index) => (
                                    <div key={index} className="col-12 col-md-6">
                                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                                            <span className="fw-bold text-md-end h5">{item.label}:</span>
                                            <span>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle">
                            <h4>Invoice Details:- </h4>
                            <div className="row g-4"> {/* Adds gap between sections */}
                                {[
                                    { label: "Name", value: "ELBE PHARMA LTD (LEKAN)" },
                                    { label: "Creator", value: "pharmQAY" },
                                    { label: "Date", value: "10-08-2022 09:35:32" },
                                    { label: "Parent", value: "VENDORS" },
                                    { label: "Status", value: "Active" }
                                ].map((item, index) => (
                                    <div key={index} className="col-12 col-md-6">
                                        <div className="p-3 shadow rounded-4 bg-light d-flex justify-content-between">
                                            <span className="fw-bold text-md-end h5">{item.label}:</span>
                                            <span>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Table id="myTable" className="rounded-2 border mt-4" striped hover responsive>
                            <thead>
                                <tr className="shadow-sm">
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Type:</th>
                                    <th>Price (x1)</th>
                                    <th>Discount</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* <p>No content in table</p> */}
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <tr className='' key={index}>
                                        <td>Joy</td>
                                        <td>1.00</td>
                                        <td>Unitt</td>
                                        <td>701.00</td>
                                        <td>0</td>
                                        <td>123</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {/* <div className="border border rounded-3 p-1 bg-light my-3 shadow">
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
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SalesReceiptWindow;