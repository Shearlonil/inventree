import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {  Modal, Table } from "react-bootstrap";
import { BsPersonFillAdd } from "react-icons/bs";
import { toast } from "react-toastify";
import CryptoJS from 'crypto-js'

import ConfirmDialog from "../../../Components/DialogBoxes/ConfirmDialog";
import OffcanvasMenu from "../../../Components/OffcanvasMenu";
import UserForm from "../../../Components/Contacts/UserForm";
import { useAuth } from "../../../app-context/auth-user-context";
import handleErrMsg from "../../../Utils/error-handler";
import userController from "../../../Controllers/user-controller";
import User from "../../../Entities/User";
import ReactMenu from "../../../Components/ReactMenu";
import TableMain from "../../../Components/TableView/TableMain";
import PaginationLite from "../../../Components/PaginationLite";
import InputDialog from "../../../Components/DialogBoxes/InputDialog";
import { OribitalLoading } from "../../../Components/react-loading-indicators/Indicator";

const UsersWindow = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    const [networkRequest, setNetworkRequest] = useState(false);
    
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    
    //	for pagination
    const [pageSize] = useState(10);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [users, setUsers] = useState([]);
    
    const [showInputModal, setShowInputModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Delete', onClickParams: {evtName: 'deleteUser'} },
        { name: 'View', onClickParams: {evtName: 'view'} },
    ];
    
    const usersOffCanvasMenu = [
        { label: "Search By Username", onClickParams: {evtName: 'searchByUsername'} },
        { label: "Search By First Name", onClickParams: {evtName: 'searchByFirstName'} },
        { label: "Sort By Username", onClickParams: {evtName: 'sortByUsername'} },
        { label: "Sort By First Name", onClickParams: {evtName: 'sortByFirstName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
    ];

    useEffect( () => {
        if(user.hasAuth('USERS_WINDOW')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your admin");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            const response = await userController.findAllActive();

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( user => {
                    const u = new User();
                    //  u.id = user.id;
                    u.username = user.username;
                    u.firstName = user.firstName;
                    u.lastName = user.lastName;
                    u.sex = user.sex;
                    u.phoneNo = user.phoneNo;
                    u.email = user.email;
                    u.regDate = user.dateOfReg;
                    //  u.level = user.level;
                    switch (user.level) {
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
                    arr.push(u);
                } );
				setUsers(arr);
                setFilteredUsers(arr);
				setTotalItemsCount(response.data.length);
            }
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
    
    const handleCloseModal = () => {
        setDisplayMsg("");
		setEntityToEdit(null);
        setShowConfirmModal(false);
		setShowInputModal(false);
		setShowFormModal(false);
    };

    const handleShowFormModal = () => setShowFormModal(true);

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredUsers.slice(startIndex, startIndex + pageSize));
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByUsername':
                setDisplayMsg("Enter Username");
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowInputModal(true);
                break;
            case 'searchByFirstName':
                setDisplayMsg("Enter First name.");
				setConfirmDialogEvtName(onclickParams.evtName);
                setShowInputModal(true);
                break;
            case 'trash':
                navigate('/dashboard/users/trash');
                break;
            case 'showAll':
                setFilteredUsers(users);
                setTotalItemsCount(users.length);
                break;
            case 'sortByUsername':
                filteredUsers.sort((a, b) => (a.username > b.username) ? 1 : ((b.username > a.username) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredUsers.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
            case 'sortByFirstName':
                filteredUsers.sort((a, b) => (a.firstName > b.firstName) ? 1 : ((b.firstName > a.firstName) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredUsers.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
        }
	}

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'deleteUser':
				//	ask if sure to delete
				setEntityToEdit(entity);
				setDisplayMsg(`Delete user ${entity.username}?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
            case 'view':
                window.open(`${entity.username}/details`, '_blank')?.focus();
                break;
        }
    };
	
	const handleInputOK = async (str) => {
        let arr = [];
		switch (confirmDialogEvtName) {
            case 'searchByUsername':
                arr = users.filter(user => user.username.toLowerCase().includes(str));
                setFilteredUsers(arr);
                setTotalItemsCount(arr.length);
                break;
            case 'searchByFirstName':
                arr = users.filter(user => user.firstName.toLowerCase().includes(str));
                setFilteredUsers(arr);
                setTotalItemsCount(arr.length);
                break;
        }
	}
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		try {
			setNetworkRequest(true);
			switch (confirmDialogEvtName) {
				case 'deleteUser':
					await userController.deleteUser(entityToEdit.username);
					//	find index position of deleted item in items arr
					let indexPos = filteredUsers.findIndex(i => i.username == entityToEdit.username);
					if(indexPos > -1){
						//	cut out deleted item found at index position
						filteredUsers.splice(indexPos, 1);
						setFilteredUsers([...filteredUsers]);
						/*  MAINTAIN CURRENT PAGE.  */
						setTotalItemsCount(totalItemsCount - 1);
                        if(pagedData.length <= 1){
                            if(totalItemsCount >= pageSize){
                                setCurrentPage(currentPage - 1);
                            }
                        }
						toast.success('Delete successful');
					}
                    //  update in users arr also
                    indexPos = users.findIndex(i => i.username === data.username);
                    if(indexPos > -1){
                        //	replace old item found at index position in items array with edited one
                        users.splice(indexPos, 1);
                        setUsers([...users]);
                    }
					break;
			}
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return handleConfirmOK();
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
	}
    
    const createUser = async (data, formReset) => {
        var key  = CryptoJS.enc.Latin1.parse('q9kkkHAiIyGsXKQUJXSsxCNoV4vn7hAr');
        var iv   = CryptoJS.enc.Latin1.parse('d8_M37m9F0nVPBIW');  
        var encrypted = CryptoJS.AES.encrypt(
            data.password,
            key,
            {iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.ZeroPadding}
        );
        data.password = encrypted.toString();
		try {
			setNetworkRequest(true);
			await userController.create(data);
            switch (data.level) {
                case 1:
                    data.level = 'Admin';
                    break;
                case 2:
                    data.level = 'Supervisor';
                    break;
                case 3:
                    data.level = 'Sales Assistant';
                    break;
            }
            setUsers([...users, data]);
            setFilteredUsers([...filteredUsers, data]);
            //	maintain current page
            setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
            //	update total items count
            setTotalItemsCount(totalItemsCount + 1);
            formReset();
			setNetworkRequest(false);
		} catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return createUser(data);
				}
				// Incase of 401 Unauthorized, navigate to 404
				if(error.response?.status === 401){
					navigate('/404');
				}
				// display error message
				toast.error(handleErrMsg(error).msg);
				setNetworkRequest(false);
			} catch (error) {
				// if error while refreshing, logout and delete all cookies
				logout();
			}
		}
    };
        
    const tableProps = {
        //	table header
        headers: ['User Name', "First Name", "Last Name", "Sex", 'Phone No', 'E-Mail', 'Level', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['username', 'firstName', 'lastName', 'sex', 'phoneNo', 'email', 'level'],
        //	React Menu
        menus: {
            ReactMenu,
            menuItems,
            menuItemClick: handleTableReactMenuItemClick,
        }
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="container-fluid mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={usersOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Users</span>
                        <BsPersonFillAdd className="text-white" size={40} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Add new, edit/update, delete and search for users. Update user permissions/authorities on the fly
                </span>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className="row justify-content-center">
                {/* Form Section */}
                <div className="d-none d-md-block col-12 col-md-3 p-4 me-3 d-flex flex-column gap-3 bg-light shadow border rounded overflow-auto" >
                    <UserForm data={entityToEdit} networkRequest={networkRequest} fnCreate={createUser} />
                </div>

                {/* Table Section */}
                <div className="col-12 col-md-7 p-3 shadow-sm border border-2 rounded-3 ms-1 overflow-md-auto" style={{ minHeight: "700px" }}>
                    <div className={`border border rounded-3 p-1 bg-light my-3  ${networkRequest ? 'disabledDiv' : ''}`}>
                        <TableMain tableProps={tableProps} tableData={pagedData} />
                    </div>
                    <div className="mt-3">
                        <PaginationLite
                            itemCount={totalItemsCount}
                            pageSize={pageSize}
                            setPageChanged={setPageChanged}
                            pageNumber={currentPage}
                        />
                    </div>
                </div>
            </div>

            {/*  */}
            <div className="d-md-none" style={{ position: "fixed", bottom: "40px", right: "30px", cursor: "pointer", zIndex: 999}}>
                <div variant="dark"
                    style={{ boxShadow: '4px 4px 4px #9E9E9E', maxWidth: '50px' }}
                    className="m-2 p-2 rounded bg-success text-white rounded-5 d-flex justify-content-center" onClick={handleShowFormModal}>
                    <BsPersonFillAdd className="text-white" size={'25px'} />
                </div>
            </div>
            <ConfirmDialog
                show={showConfirmModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmOK}
                message={displayMsg}
            />
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={handleInputOK}
                message={displayMsg}
            />
            <Modal show={showFormModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UserForm data={entityToEdit} networkRequest={networkRequest} fnCreate={createUser} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UsersWindow;
