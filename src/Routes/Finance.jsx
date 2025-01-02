import React from "react";
import SVG from "../assets/Svg";
import { Link } from "react-router-dom";
import { BiMoney } from "react-icons/bi";
import { CgAddR } from "react-icons/cg";

const Finance = () => {
	const { Finance_1 } = SVG;
	return (
		<>
			<div className="text-center my-5">
				<h2 className="my-4 text-center display-6 p-3 bg-light-subtle d-inline rounded-4 shadow">
					<span className="me-4">Finance</span>
					<BiMoney className="text-black" size={"30px"} />
				</h2>
			</div>

			<div className="container my-4 border rounded-3">
				<div className="row d-flex align-items-stretch">
					{Array.from({ length: 10 }).map((_, index) => (
						<div key={index} className="col-4 p-3">
							<div className="p-3 border rounded-3">
								<div className="row mx-auto">
									<div className="col-12 col-md-4 bg-info-subtle">
										<img src={Finance_1} width="100" height={"150px"} />
									</div>
									<div className="col-12 col-md-8 my-auto">
										<div>
											<div className="d-flex justify-content-between">
												<h4>A header</h4>
												<p className="fw-bold">#330</p>
											</div>
											<div className="d-flex flex-column gap-2 p-1">
												<Link
													className="text-decoration-none text-secondary"
													to={""}
												>
													Link 1: Lorem ipsum.
												</Link>
												<Link
													className="text-decoration-none text-secondary"
													to={""}
												>
													Link 2: Lorem ipsum.
												</Link>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
					<div className="col-4 p-3">
						<div className="p-3 border rounded-3 h-100">
							<div className="d-flex flex-column align-items-center justify-content-center h-100">
								<CgAddR size={"70px"} />
								<p>Add new</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Finance;
