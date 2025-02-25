import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../../Components/OffcanvasMenu';
import SVG from '../../../assets/Svg';
import { useAuth } from '../../../app-context/auth-user-context';
import handleErrMsg from '../../../Utils/error-handler';
import userController from '../../../Controllers/user-controller';
import TableMain from '../../../Components/TableView/TableMain';
import PaginationLite from '../../../Components/PaginationLite';
import ReactMenu from '../../../Components/ReactMenu';
import User from '../../../Entities/User';
import ConfirmDialog from '../../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../../Components/DialogBoxes/InputDialog';
import { OribitalLoading } from '../../../Components/react-loading-indicators/Indicator';

const UserTrash = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Restore', onClickParams: {evtName: 'restore'} },
    ];
    
    const [networkRequest, setNetworkRequest] = useState(false);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
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
        
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const usersOffCanvasMenu = [
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Users", onClickParams: {evtName: 'usersPage'} },
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
            let response = await userController.trashedUsers();

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
		// setEntityToEdit(null);
        setShowConfirmModal(false);
		setShowInputModal(false);
    };

    const resetPage = () => {
        setDisplayMsg("");
		setEntityToEdit(null);
        setShowConfirmModal(false);
		setShowInputModal(false);
        setConfirmDialogEvtName(null);
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

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'restore':
				//	ask if sure to delete
				setEntityToEdit(entity);
				setDisplayMsg(`Restore ${entity.username}?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
        }
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
            case 'usersPage':
                navigate('/dashboard/users');
                break;
            case 'showAll':
                setFilteredUsers(users);
                setTotalItemsCount(users.length);
                break;
            case 'sortByName':
                filteredUsers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredUsers.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredUsers.slice(startIndex, startIndex + pageSize));
    };
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		try {
			setNetworkRequest(true);
			switch (confirmDialogEvtName) {
				case 'restore':
                    await userController.restoreUser(entityToEdit.username);
					//	find index position of restored item in items arr
					let indexPos = filteredUsers.findIndex(o => o.username == entityToEdit.username);
					if(indexPos > -1){
						//	cut out restored item found at index position
						filteredUsers.splice(indexPos, 1);
						setFilteredUsers([...filteredUsers]);
						/*  MAINTAIN CURRENT PAGE.  */
						setTotalItemsCount(totalItemsCount - 1);
                        if(pagedData.length <= 1){
                            if(totalItemsCount >= pageSize){
                                setCurrentPage(currentPage - 1);
                            }
                        }
						toast.success('Outpost successfully restored');
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
            resetPage();
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
        <div style={{minHeight: '75vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={usersOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Trash (users)</span>
                        <img src={SVG.users_slash_filled} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View, Restore deleted users.
                </span>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>

            <div className={`container mt-4 p-3 shadow-sm border border-2 rounded-1 ${networkRequest ? 'disabledDiv' : ''}`}>
                <div className="border bg-light my-3">
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
        </div>
    );
};

export default UserTrash;
