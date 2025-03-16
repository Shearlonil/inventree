import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ReactMenu from '../../Components/ReactMenu';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import outpostController from '../../Controllers/outpost-controller';
import { Outpost } from '../../Entities/Outpost';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';

const OutpostTrash = () => {
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
    
    const [outposts, setOutposts] = useState([]);
        
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredOutposts, setFilteredOutposts] = useState([]);

    const outpostsOffCanvasMenu = [
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
    ];

    useEffect( () => {
        initialize();
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            let response = await outpostController.trashedOutpost();

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( outpost => arr.push(new Outpost(outpost)) );
				setOutposts(arr);
                setFilteredOutposts(arr);
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
            case 'searchByName':
                arr = outposts.filter(outpost => outpost.name.toLowerCase().includes(str));
                setFilteredOutposts(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
        }
	}

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'restore':
				//	ask if sure to restore
				setEntityToEdit(entity);
				setDisplayMsg(`Restore ${entity.name}?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter Name");
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowInputModal(true);
                break;
            case 'showAll':
                setFilteredOutposts(outposts);
                setTotalItemsCount(outposts.length);
                break;
            case 'sortByName':
                filteredOutposts.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredOutposts.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredOutposts.slice(startIndex, startIndex + pageSize));
    };
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		try {
			setNetworkRequest(true);
			switch (confirmDialogEvtName) {
				case 'restore':
                    if(user.hasAuth('UPDATE_OUTPOST')){
                        await outpostController.restoreOutpost(entityToEdit.id);
                        //	find index position of restored item in items arr
                        let indexPos = filteredOutposts.findIndex(o => o.id == entityToEdit.id);
                        if(indexPos > -1){
                            //	cut out restored item found at index position
                            filteredOutposts.splice(indexPos, 1);
                            setFilteredOutposts([...filteredOutposts]);
                            /*  MAINTAIN CURRENT PAGE.  */
                            setTotalItemsCount(totalItemsCount - 1);
                            if(pagedData.length <= 1){
                                if(totalItemsCount >= pageSize){
                                    setCurrentPage(currentPage - 1);
                                }
                            }
                            toast.success('Outpost successfully restored');
                        }
                        //  update in outposts arr also
                        indexPos = outposts.findIndex(i => i.id === data.id);
                        if(indexPos > -1){
                            //	replace old item found at index position in items array with edited one
                            outposts.splice(indexPos, 1);
                            setOutposts([...outposts]);
                        }
                    }else {
                        toast.error("Account doesn't support this operation. Please contact your supervisor");
                        return;
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
        headers: ['Outpost Name', 'Date', 'Creator', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['name', 'creationDate', 'username'],
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
                    <OffcanvasMenu menuItems={outpostsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Trash (Outposts)</span>
                        <img src={SVG.branch_colored_two} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View, Restore deleted Outposts.
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

export default OutpostTrash;
