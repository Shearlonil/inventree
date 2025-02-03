import React from "react";
import IMAGES from "../assets/Images";
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";

const Footer = () => {

    return (<>
        <div className="container">
            <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
                <div className="col-md-4 d-flex align-items-center">
                    <a href="/" className="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
                        <img src={IMAGES.logo} width={"100"} alt="" />
                    </a>
                    <span className="mb-3 mb-md-0 text-body-secondary">&copy; 2024 Inventree, Inc</span>
                </div>

                <div className="col-md-4 text-center d-flex gap-2">
                    <p>
                        Powered by <i>Genius Computer Technologies</i>
                    </p>
                    <img src={IMAGES.logo_gct} width={"70px"} alt="" />
                </div>

                <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
                    <li className="ms-3"><a className="text-body-secondary" href="#">
                        <BsTwitter size={30} />
                    </a></li>
                    <li className="ms-3"><a className="text-body-secondary" href="#"><BsInstagram size={30} /></a></li>
                    <li className="ms-3"><a className="text-body-secondary" href="#"><FaFacebook size={30} /></a></li>
                </ul>
            </footer>
        </div>
    </>)
}

export default Footer;