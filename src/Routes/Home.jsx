import React from "react";
import SVG from "../assets/Svg";
import { HomeWrapper } from "../Components/Styles/HomeStyles";

import { IoIosRefresh } from "react-icons/io";
import { TbUsersGroup } from "react-icons/tb";
import { AiFillProduct } from "react-icons/ai";
import { FcCustomerSupport } from "react-icons/fc";
import { MdSell } from "react-icons/md";

const Home = () => {
	const { svg_1, svg_2, svg_3_red, svg_4 } = SVG;

	return (
		<HomeWrapper>
			<div className="container-fluid bg-secondary-subtle">
				<div className="container-md mb-4 p-4 rounded">
					<h2 className="space-mono-regular mb-2 px-1 d-inline-block rounded display-4">
						Inventree
					</h2>
					<div className="row">
						<div className="col-12 col-md-6 my-auto">
							<h1
								className="space-mono-bold fw-bold display-6 mb-3"
								style={{ textTransform: "capitalize" }}
							>
								Simple Smart Store App + Accounting Software for small
								businesses
							</h1>
							<div>
								<button className="btn btn-lg btn-warning">Get Started</button>
							</div>
						</div>
						<div className="col-12 col-md-6 text-center">
							<img
								src={svg_1}
								style={{ width: "80vh", maxWidth: "100%", minHeight: "400px" }}
								alt=""
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="container" id="section-2">
				<div className="row">
					<div className="col-12 col-md-8 p-2" id="child-1">
						<div className="p-3 h-100 py-auto bg-primary rounded d-flex flex-column justify-content-around">
							<h3 className="fw-bold">Client Store Name</h3>
							<p>
								<span className="fw-bold">App Mode:</span> Single/Multi Tier
							</p>
							<div>
								<button className="btn btn-outline-light fw-bold">
									Get Started
								</button>
							</div>
						</div>
					</div>

					<div className="col-12 col-md-4 p-2" id="child-2">
						<div className="p-3 h-100 py-auto bg-warning rounded d-flex flex-column justify-content-around">
							<h3 className="fw-bold">Incomplete Transactions</h3>
							<div>
								<div className="d-flex justify-content-between">
									<span className="space-mono-bold h2">"3"</span>
									<button className="btn">
										<IoIosRefresh size={"40"} />
									</button>
								</div>
							</div>
							<a className="text-decoration-none" href="">
								<p>Invoices with receipts</p>
							</a>
						</div>
					</div>
				</div>
			</div>

			<div className="container mb-3" id="section-3">
				<div className="row">
					<div className="col-6 col-md-4 col-lg-x3 p-2">
						<div className="bg-secondary-subtle rounded p-3">
							<div className="d-flex gap-4">
								<TbUsersGroup size={"20"} />
								<h6 className="fw-bold">Active Users</h6>
							</div>
							<p className="space-mono-bold bg-light-subtle d-inline-block px-1 rounded-2">
								2
							</p>
						</div>
					</div>
					<div className="col-6 col-md-4 col-lg-x3 p-2">
						<div className="bg-secondary-subtle rounded p-3">
							<div className="d-flex gap-4">
								<AiFillProduct size={"20"} />
								<h6 className="fw-bold">Active Items</h6>
							</div>
							<p className="space-mono-bold bg-light-subtle d-inline-block px-1 rounded-2">
								324
							</p>
						</div>
					</div>

					<div className="col-6 col-md-4 col-lg-x3 p-2">
						<div className="bg-secondary-subtle rounded p-3">
							<div className="d-flex gap-4">
								<FcCustomerSupport size={"20"} />
								<h6 className="fw-bold">Active Customers</h6>
							</div>
							<p className="space-mono-bold bg-light-subtle d-inline-block px-1 rounded-2">
								0
							</p>
						</div>
					</div>
					<div className="col-6 col-md-4 col-lg-x3 p-2">
						<div className="bg-secondary-subtle rounded p-3">
							<div className="d-flex gap-4">
								<MdSell size={"20"} />
								<h6 className="fw-bold">Active Vendors</h6>
							</div>
							<p className="space-mono-bold bg-light-subtle d-inline-block px-1 rounded-2">
								0
							</p>
						</div>
					</div>
				</div>
			</div>

			<hr className="container" />

			<div id="section-4" className="container my-3">
				<h3 className="text-center space-mono-bold mb-4">FEATURES</h3>
				<div className="child-1 mb-4">
					<div className="row">
						<div className="col-12 col-sm-6 my-2">
							<img
								src={svg_2}
								style={{ width: "80vh", maxWidth: "100%", maxHeight: "400px" }}
								alt=""
							/>
						</div>
						<div className="col-12 col-sm-6 my-2" id="branch">
							<h4 className="fw-normal text-center">Branch</h4>
							<div className="d-flex flex-column gap-2 list-group">
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									Outpost Management.
								</p>
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									Create, manage & track items.
								</p>
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									Outpost are like branches & with{" "}
									<span className="bg-info-subtle px-1 rounded space-mono-regular small">
										Inventree
									</span>{" "}
									you can create.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="child-2 my-4">
					<div className="row">
						<div className="col-12 col-sm-6 my-2 my-sm-auto" id="branch">
							<h4 className="fw-normal text-center mb-3">Vendor Management</h4>
							<div className="d-flex flex-column gap-2 list-group">
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									You can keep track of transactions with your Vendors without
									hassle
								</p>
							</div>
						</div>
						<div className="col-12 col-sm-6 my-2">
							<img
								src={svg_3_red}
								style={{ width: "80vh", maxWidth: "100%", maxHeight: "400px" }}
								alt=""
							/>
						</div>
					</div>
				</div>

				<div className="child-1 mb-4">
					<div className="row">
						<div className="col-12 col-sm-6 my-2">
							<img
								src={svg_4}
								style={{ width: "80vh", maxWidth: "100%", maxHeight: "400px" }}
								alt=""
							/>
						</div>
						<div className="col-12 col-sm-6 my-2 my-sm-auto" id="branch">
							<h4 className="fw-normal text-center mb-3">Wallet Management.</h4>
							<div className="d-flex flex-column gap-2 list-group">
								<p className="list-group-item list-group-item-action shadow-sm rounded-2 p-1 px-2">
									Customer can trust you with their money and use it later to
									purchase items.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</HomeWrapper>
	);
};

export default Home;
