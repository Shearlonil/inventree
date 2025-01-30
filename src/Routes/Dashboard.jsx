import React from "react";
import SVG from "../assets/Svg";
import { Link, useNavigate } from "react-router-dom";
import { BiMoney } from "react-icons/bi";
import { CgAddR } from "react-icons/cg";
import { useAuth } from "../app-context/auth-user-context";

const Dashboard = () => {
    const navigate = useNavigate();

    const { authUser, handleRefresh, logout } = useAuth();
    const user = authUser();

	const { Finance_1 } = SVG;
	return (
		<div className="py-2 py-md-4">
            <div className="container-md">
                <h1 className="fw-bold mt-4">
                    Hello{" "}
                    <span className="bungee-regular text-primary"> {user.userName} </span>
                </h1>
                <hr />

				<h3 className="mt-5 fw-bold noto-sans-font">
					Quick<span className="text-success"> Menu</span>
				</h3>

                <div className="container mt-4 mb-4">
                    <div className="row g-2">
                        {user.hasAuth('RECEIPT_WINDOW') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-danger-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.receipt}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Receipts</span>
                                        <span className="text-muted">View generated receipts by number or date.</span>
                                    </div>
                                </div>
                            </div>
                        </div>}

                        {user.hasAuth('INVOICE_WINDOW') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-primary-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.invoice_coloured}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Invoices</span>
                                        <span className="text-muted">View generated invoices by number or date. Also invoices without receipts.</span>
                                    </div>
                                </div>
                            </div>
                        </div>}

                        {user.hasAuth('REPORT_WINDOW') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-warning-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.report}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Reports</span>
                                        <span className="text-muted">reports include but not limited to Sales report, stock summary, cash sales etc.</span>
                                    </div>
                                </div>
                            </div>
                        </div>}

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-danger-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.key}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Change Password</span>
                                        <span className="text-muted">Change your password.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('/store/item/ongoing/new')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-primary-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.stock_rec_colored}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Unverified Stock Record Entries</span>
                                        <span className="text-muted">View ongoing/unverified stock records.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {user.hasAuth('CREATE_ACCOUNT') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-warning-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.add_user}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Add Users</span>
                                        <span className="text-muted">Create users and add necessary account priviliges.</span>
                                    </div>
                                </div>
                            </div>
                        </div>}

                        {user.hasAuth('USERS_WINDOW') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-danger-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.users}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">View Users</span>
                                        <span className="text-muted">View user accounts, active or inactive.</span>
                                    </div>
                                </div>
                            </div>
                        </div>}

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('post-a-job')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-primary-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.profile_blue}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Profile</span>
                                        <span className="text-muted">View and edit your profile.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('/store/item/ongoing/restock')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-warning-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.stock_rec_monochrome}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Unverified Restock Entries</span>
                                        <span className="text-muted">View ongoing/unverified restock records.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		</div>
	);
};

export default Dashboard;
