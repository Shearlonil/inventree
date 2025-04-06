import React from "react";
import { useNavigate } from "react-router-dom";
import { BsInstagram, BsTwitter, BsTwitterX, BsWhatsapp } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";

import IMAGES from "../assets/Images";
import SVG from "../assets/Svg";

const Footer = () => {
    const navigate = useNavigate();

    return (<>
        <div className="container-fluid">
            <footer className="row py-3 my-4 border-top d-flex justify-content-center gap-2">
                <div className="col-12 col-md-4 d-flex flex-column justify-content-center align-items-center gap-2">
                    <a href="/" className="me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
                        <img src={IMAGES.logo} width={"100"} alt="" />
                    </a>
                    <span className="text-body-secondary">&copy; 2024 Inventree, Inc</span>
                </div>
                <hr className="container d-md-none" />
                <div className="col-12 col-md-4 text-center d-flex flex-column flex-md-row align-items-center justify-content-center gap-2">
                    <p>
                        Powered by <i>Genius Computer Technologies</i>
                    </p>
                    <img src={IMAGES.logo_gct} height={"20px"} width={"70px"} alt="" />
                </div>

                <ul className="nav col-12 col-md-2 justify-content-center align-items-center list-unstyled d-flex justify-space-around">
                    <li className="ms-3"><a className="text-body-secondary" href="#"><BsWhatsapp size={30} /></a></li>
                </ul>

                <ul className="nav col-12 col-md-1 justify-content-center align-items-center list-unstyled d-flex justify-space-around">
                    <li className="ms-3"><img src={SVG.settings} height={"30px"} width={"70px"} alt="" onClick={() => { navigate("settings") }} /></li>
                </ul>
            </footer>
        </div>
    </>)
}

export default Footer;