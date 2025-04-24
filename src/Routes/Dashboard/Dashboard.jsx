import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app-context/auth-user-context";
import { Button } from "react-bootstrap";
import { PieChart, Pie, Cell } from "recharts";
import { subDays } from "date-fns";
import { toast } from "react-toastify";

import handleErrMsg from "../../Utils/error-handler";
import SVG from "../../assets/Svg";
import transactionsController from "../../Controllers/transactions-controller";

const Dashboard = () => {
    const navigate = useNavigate();

    const { authUser, handleRefresh, logout } = useAuth();
    const user = authUser();
    
    const [networkRequest, setNetworkRequest] = useState(false);

    const [salesChartData, setSalesChartData] = useState([ { name: "Fetching Data", value: 1, color: "#0088FE" } ]);
      
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8a2be2"];
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        
        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
        
    useEffect( () => {
        initialize();
    }, []);
    
    const initialize = async () => {
        try {
            setNetworkRequest(true);
            const endDate = new Date();
            endDate.setHours(23, 59, 59);
            
            const startDate = subDays(endDate, 7);
            startDate.setHours(0, 0, 0);
            const response = await transactionsController.summarizeSalesRecords(startDate.toISOString(), endDate.toISOString());
            if(response && response.data && response.data.length > 0){
                const arr = [];
                response.data.sort( (a, b) => b.soldOutQty - a.soldOutQty );
                let count = 0;
                while (count < 5 && count < response.data.length) {
                    const obj = {
                        name : response.data[count].itemName,
                        value : response.data[count].soldOutQty,
                        color: COLORS[count],
                    }
                    arr.push(obj);
                    count++;
                }
                setSalesChartData(arr);
            }else {
                setSalesChartData([
                    {
                        name: "No Data",
                        value: 1,
                        color: COLORS[4]
                    }
                ])
            }

            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            //	Incase of 500 (Invalid Token received!), perform refresh
            try {
                if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
                    await handleRefresh();
                    return initialize();
                }
                // Incase of 401 Unauthorized, navigate to 404
                if(error.response?.status === 401){
                    navigate('/404');
                }
                // display error message
                toast.error(handleErrMsg(error).msg);
            } catch (error) {
                // if error while refreshing, logout and delete all cookies
                logout();
            }
        }
    };

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

                        {user.hasAuth('SALES_RECORD') && <div className="col-md-4 col-sm-12">
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
                        </div>}

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
                    
                    <div className="row d-flex justify-content-center mt-5">
                        <h1 className="text-center space-mono-bold fw-bold" style={{textShadow: "1px 2px 2px black", fontSize: '50px'}}>
                            <span className="text-success">Sales </span>
                            <span className="text-primary">Chart</span>
                        </h1>
                    </div>
                    <div className="row mt-3">
                        <div className="col-12 col-sm-6 my-2 d-flex justify-content-center">
                            <PieChart width={420} height={420}>
                                <Pie
                                    data={salesChartData}
                                    cx={200}
                                    cy={200}
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={200}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {salesChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </div>
                        <div className="col-12 col-sm-6 my-2">
                            <div className="d-flex align-items-start justify-content-center flex-column h-100 gap-3">
                                <h2 className="fw-bold space-mono-bold">TOP 5 ITEMS IN THE LAST 7 DAYS</h2>
                                {salesChartData.map((entry, index) => (
                                    <div className="d-flex gap-3" key={`cell-${index}`}>
                                        <div style={{height: '20px', width: '20px', backgroundColor: `${entry.color}`}}></div>
                                        <span>{`${entry.name}`}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row mt-5">
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
						<div className="col-12 col-sm-6 my-2">
							<img
								src={SVG.profile_blue}
								style={{ width: "100%", maxHeight: "250px" }}
								alt=""
							/>
						</div>
					</div>
                </div>
            </div>
		</div>
	);
};

export default Dashboard;
