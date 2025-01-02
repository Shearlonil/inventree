import React from "react";
import { Form } from "react-bootstrap";

const ErrorMessage = ({ source }) => {
	return (
		<>
			{/* <Form.Control.Feedback
				className="animate__animated animate__headShake animate__repeat-3"
				type="invalid"
			>
				{source?.message}
			</Form.Control.Feedback> */}

			{source && (
				<span className="text-danger animate__animated animate__headShake animate__repeat-3 fs-6">
					{source.message}
				</span>
			)}
		</>
	);
};

export default ErrorMessage;
