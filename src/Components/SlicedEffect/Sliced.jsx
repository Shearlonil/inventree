import React from "react";
import "./Sliced.css";

const Sliced = ({ children }) => {
	return (
		<section className="wrapper">
			<div className="top">{children}</div>
			<div className="bottom" aria-hidden="true">
				{children}
			</div>
		</section>
	);
};

export default Sliced;
