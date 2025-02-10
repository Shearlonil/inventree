import React from "react";
import IMAGES from "../assets/Images";

const PageNotFound = () => {
	const { logo } = IMAGES;
    return (
        <div className="mt-auto mb-auto">
            <div className="align-self-center justify-self-center">
                <div className="container mx-auto">
                    <main className="form-signin m-auto" style={{ minWidth: "320px" }}>
                        <div className="text-center text-dark">
                            <img className="mb-4" src={logo} alt="" width="100%" />
                            <h1>PAGE NOT FOUND</h1>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PageNotFound;
