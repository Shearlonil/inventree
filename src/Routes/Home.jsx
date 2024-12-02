import React from "react";
import SVG from "../Assets/Svg";
import { HomeWrapper } from "../Components/Styles/HomeStyles";

import { IoIosRefresh } from "react-icons/io";

const Home = () => {
	return (
		<HomeWrapper>
			<div className="container-md my-4 p-3 py-5 bg-secondary-subtle rounded">
				<h2 className="space-mono-regular mb-2  bg-light d-inline-block rounded">
					Inventree
				</h2>
				<div className="row">
					<div className="col-12 col-md-6 my-auto">
						<h1
							className="space-mono-bold fw-bold display-5 mb-3"
							style={{ textTransform: "capitalize" }}
						>
							Simple Smart Store App + Accounting Software for small businesses
						</h1>
						<div>
							<button className="btn btn-lg btn-warning">Get Started</button>
						</div>
					</div>
					<div className="col-12 col-md-6">
						<img
							src={SVG.svg_1}
							width="100%"
							style={{ minHeight: "400px" }}
							alt=""
						/>
					</div>
				</div>
			</div>

			<div className="container" id="section-2">
				<div className="row">
					<div className="col-12 col-md-8 p-2" id="child-1">
						<div className="p-3 h-100 py-auto bg-primary rounded d-flex flex-column justify-content-around">
							<h2 className="fw-bold">Client Store Name</h2>
							<p>App Mode: Single/Multi Tier</p>
							<div>
								<button className="btn btn-outline-warning">Get Started</button>
							</div>
						</div>
					</div>

					<div className="col-12 col-md-4 p-2" id="child-2">
						<div className="p-3 h-100 py-auto bg-warning rounded d-flex flex-column justify-content-around">
							<h2 className="fw-bold">Incomplete Transactions</h2>
							<div>
								<div className="d-flex justify-content-between">
									<span className="space-mono-bold h2">"3"</span>
									<span>
										<IoIosRefresh size={"40"} />
									</span>
								</div>
							</div>
							<p>Invoices with receipts</p>
						</div>
					</div>
				</div>
			</div>
		</HomeWrapper>
	);
};

export default Home;
