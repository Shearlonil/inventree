import React from "react";
import SVG from "../../assets/Svg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app-context/auth-user-context";
import { Button } from "react-bootstrap";

const Dashboard = () => {
    const navigate = useNavigate();

    const { authUser, handleRefresh, logout } = useAuth();
    const user = authUser();

	return (
		<div className="py-2 py-md-4">
            <div className="container-md">
                <h1 className="fw-bold mt-4">
                    Hello{" "}
                    <span className="bungee-regular text-primary"> {user.username} </span>
                </h1>
                <hr />

				<h3 className="mt-5 fw-bold noto-sans-font">
					Quick<span className="text-success"> Menu</span>
				</h3>

                <div className="container mt-4 mb-4">
                    <div className="row g-2">
                        {user.hasAuth('RECEIPT_WINDOW') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('/dashboard/receipts')} style={{minHeight: '110px'}}>
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
                            <div className="btn p-3 border w-100" onClick={() => navigate('invoices')} style={{minHeight: '110px'}}>
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

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('sales/report')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-warning-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.report}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Sales Summary</span>
                                        <span className="text-muted">Generate Item sales report with custom dates and export to Excel/PDF</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('/dashboard/users/password/change')} style={{minHeight: '110px'}}>
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
                            <div className="btn p-3 border w-100" onClick={() => navigate('/inventory/item/unverified/new')} style={{minHeight: '110px'}}>
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

                        <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('/inventory/item/unverified/restock')} style={{minHeight: '110px'}}>
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

                        {user.hasAuth('USERS_WINDOW') && <div className="col-md-4 col-sm-12">
                            <div className="btn p-3 border w-100" onClick={() => navigate('/dashboard/users')} style={{minHeight: '110px'}}>
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
                            <div className="btn p-3 border w-100" onClick={() => navigate('/inventory/item/unverified/dispensary')} style={{minHeight: '110px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`p-2 bg-primary-subtle text-center rounded-3 onHover`} style={{boxShadow: 'black 3px 2px 5px'}}>
                                        <img
                                            style={{ width: "50px", height: "40px" }}
                                            src={SVG.dispensary}
                                            alt=""
                                        />
                                    </div>
                                    <div className="d-flex flex-column text-start">
                                        <span className="fs-6 noto-sans-font fw-bold">Unverified Dispensary</span>
                                        <span className="text-muted">View ongoing/unverified dispensary records.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-5">
						<div className="col-12 col-sm-6 my-2">
							<img
								src={SVG.profile_blue}
								style={{ width: "100%", maxHeight: "250px" }}
								alt=""
							/>
						</div>
						<div className="col-12 col-sm-6 my-2" id="branch">
							<h4 className="fw-normal text-center">Profile</h4>
							<div className="d-flex flex-column gap-2 list-group">
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									View your profile to see what's missing
								</p>
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									Update your profile
								</p>
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
                                    Profile  {" "}
									<span className="bg-danger-subtle px-1 rounded space-mono-regular small">
                                        deactivation
									</span>{" "}
									is only allowed by admin or supervisor with granted permission.
								</p>
							</div>
                            <Button variant="success" className="mt-3 w-50" onClick={() => navigate(`/dashboard/${user.username}/profile`)}>
                                View
                            </Button>
						</div>
					</div>
                </div>
            </div>
		</div>
	);
};

export default Dashboard;
