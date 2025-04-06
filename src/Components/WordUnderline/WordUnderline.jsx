import React from "react";
import "./WordUnderline.css";

const WordUnderline = ({ children }) => {
	return (
		<div>
			<h1>
				<span class="underlined underline-clip">{children}</span>
				{/* <br />& Collect <span class="underlined underline-mask">Rare</span>
				<br />
				<span class="underlined underline-overflow">NFTs</span> */}
			</h1>
		</div>
	);
};

export default WordUnderline;
