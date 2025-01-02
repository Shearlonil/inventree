import React from "react";
import "./Sliced.css";

const Sliced = ({ children }) => {
	return (
		<>
			<section class="wrapper">
				<div class="top">Sliced</div>
				<div class="bottom" aria-hidden="true">
					{children}
				</div>
			</section>
		</>
	);
};

export default Sliced;
