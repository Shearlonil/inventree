import React from "react";

const ErrorMessage = ({ source }) => {
	return (
		<>
			{source && (
				<span className="text-danger animate__animated animate__headShake animate__repeat-3 fs-6">
					{source.message}
				</span>
			)}
		</>
	);
};

export default ErrorMessage;
