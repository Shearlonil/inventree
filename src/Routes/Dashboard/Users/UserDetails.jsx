import React, { useEffect, useState } from 'react';
import { object, date, ref } from "yup";
import "react-datetime/css/react-datetime.css";
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';

import SVG from '../../../assets/Svg';
import { OribitalLoading } from '../../../Components/react-loading-indicators/Indicator';
import { useAuth } from '../../../app-context/auth-user-context';
import userController from '../../../Controllers/user-controller';
import User from '../../../Entities/User';
import genericController from '../../../Controllers/generic-controller';
import ToggleSwitch from '../../../Components/ToggleSwitch';
import handleErrMsg from '../../../Utils/error-handler';

const UserDetails = () => {
    const navigate = useNavigate();
    const { username } = useParams();
		
	const { handleRefresh, logout, authUser } = useAuth();
	const user = authUser();
      
    const [networkRequest, setNetworkRequest] = useState(false);
    
    //  for tracts
    const [userAuths, setUserAuths] = useState([]);
    const [allAuths, setAllAuths] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
                
    useEffect( () => {
        if(user.hasAuth('AUTH_WINDOW')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            //  find user and authorities
            const urls = [ `/api/users/find/${username}`, `/api/authorities/${username}`, `/api/authorities/find/all`];
            const response = await genericController.performGetRequests(urls);
            const { 0: user, 1: userAuths, 2: allAuths } = response;
            
            //	check if the request to fetch user doesn't fail before setting values to display
            if(user && user.data){
                const u = new User();
                u.username = user.data.username;
                u.firstName = user.data.firstName;
                u.lastName = user.data.lastName;
                u.sex = user.data.sex;
                u.phoneNo = user.data.phoneNo;
                u.email = user.data.email;
                u.regDate = user.data.dateOfReg;
                u.accCreatorId = user.data.accCreator.username;
                switch (user.data.level) {
                    case 1:
                        u.level = 'Admin';
                        break;
                    case 2:
                        u.level = 'Supervisor';
                        break;
                    case 3:
                        u.level = 'Sales Assistant';
                        break;
                }
                setSelectedUser(u);
            }

            //	check if the request to fetch userAuths doesn't fail
            if(userAuths && userAuths.data){
                setUserAuths(userAuths.data);
            }

            //	check if the request to fetch userAuths doesn't fail
            if(allAuths && allAuths.data){
                setAllAuths(allAuths.data);
            }
            // const response = await userController.findUserAuths(username);
            setNetworkRequest(false);
		} catch (error) {
            setNetworkRequest(false);
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return initialize();
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
	};

    const toggle = async (checked, auth) => {
        try {
            const text = auth.name.split(' ').join('_');
            if(user.hasAuth(text) && user.hasAuth('EDIT_AUTH')){
                await userController.updateUserAuth(username, checked, auth.code);
            }else {
                toast.error("Forbidden. Your account doesn't support granting this permission. Please contact your supervisor");
                throw new Error("Forbidden. Your account doesn't support granting this permission. Please contact your supervisor");
            }
        } catch (error) {
            //	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return toggle(checked, auth);
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
			} catch (error) {
                // if error while refreshing, logout and delete all cookies
				logout();
			}
            throw error;
        }
    };

    const buildAuths = (userAuths) => allAuths.map(auth => {
        const text = auth.name.split('_').join(' ');
        const found = userAuths.findIndex(userAuth => userAuth.code === auth.code);

        return <div className="col-12 col-md-4" key={text}>
            <span className="list-group-item list-group-item-action shadow-sm rounded-2 p-2 px-2 bg-white border rounded-3 d-flex justify-content-between">
                {text}
                <ToggleSwitch
                    data={auth}
                    checkedTxt="Granted" 
                    unCheckedTxt="Revoked" 
                    ticked={found >= 0 ? true : false} 
                    onChangeFn={toggle} />
            </span>
        </div>
    });

    return (
        <div className='container my-4'>
            {/* <h3 className="mb-4"><span>Ledger Summary</span></h3> */}
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
				<div>
					{/* <OffcanvasMenu menuItems={dispensaryOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant="danger" /> */}
				</div>
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Permissions</span>
						<img src={SVG.profile_lock_white} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    View list of granted permissions/authorities for any particular account. Add, update permissions as required
                    Please Note, this page requires AUTH PERMISSION
                </span>
			</div>

            <div className="justify-content-center d-flex mt-2">
                {networkRequest && <OribitalLoading color='red' />}
            </div>
            
            <div className="shadow p-4 border rounded-3 bg-warning-subtle mt-3 mb-3">
                <h4>User Details:- </h4>
                <div className="row g-4"> {/* Adds gap between sections */}
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">First Name:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>{selectedUser?.firstName}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Last Name:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>{selectedUser?.lastName}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Level:</span>
                            <span className='pe-2 fw-bold text-primary'>{selectedUser?.level}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Username:</span>
                            <span style={{overflow: 'scroll', textAlign: "right" }} className='pe-2 text-danger h3 fw-bold'>{selectedUser?.username}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Phone No.:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                {selectedUser?.phoneNo}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">E-mail:</span>
                            <span style={{overflow: 'scroll' }}>
                                {selectedUser?.email}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Sex:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                {selectedUser?.sex}
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Creator:</span>
                            <span className='pe-2 text-primary fw-bold'>
                                {selectedUser?.accCreatorId}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
                    
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "700px" }}>
                <div className="border border rounded-3 p-1 my-3 shadow bg-white"> {/*  bg-white */}
                    <div className="container">
                        <div className="row g-4 mt-1 mb-4"> {/* Adds gap between sections */}
                            {!networkRequest && buildAuths(userAuths)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
