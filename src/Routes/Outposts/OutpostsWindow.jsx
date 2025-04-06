import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import outpostController from '../../Controllers/outpost-controller';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ReactMenu from '../../Components/ReactMenu';
import { Outpost } from '../../Entities/Outpost';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';

const OutpostsWindow = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Rename', onClickParams: {evtName: 'rename' } },
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'Stock Summary', onClickParams: {evtName: 'stockSummary'} },
    ];
    
    const [networkRequest, setNetworkRequest] = useState(false);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entityToEdit, setEntityToEdit] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
    //  for drop down dialog
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [outpostOptions, setOutpostOptions] = useState([]);
        
    //	for pagination
    const [pageSize] = useState(10);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [outposts, setOutposts] = useState([]);
        
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredOutposts, setFilteredOutposts] = useState([]);

    const outpostsOffCanvasMenu = [
        { label: "Create", onClickParams: {evtName: 'create'} },
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
        { label: "Trash", onClickParams: {evtName: 'trash'} },
    ];

    useEffect( () => {
        initialize();
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            const response = await outpostController.findAllActive();

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( outpost => arr.push(new Outpost(outpost)) );
				setOutposts(arr);
                setFilteredOutposts(arr);
				setTotalItemsCount(response.data.length);
                //  set outpost options for drop down dialog in case of delete operation
				setOutpostOptions(arr.map( outpost => ({label: outpost.name, value: outpost})));
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
        setShowConfirmModal(false);
		setShowInputModal(false);
		setShowDropDownModal(false);
    };

    const resetPage = () => {
		setEntityToEdit(null);
        setConfirmDialogEvtName(null);
        handleCloseModal();
    };

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'delete':
                if(user.hasAuth('DELETE_OUTPOST')){
                    if(entity && entity.id === 1){
                        toast.error("Operation not allowed on default Outpost");
                        return;
                    }
                    //	ask if sure to delete
                    setEntityToEdit(entity);
                    setDisplayMsg(`Delete outpost ${entity.name}? You'll be requested to select destination for items in this outpost.`);
                    setConfirmDialogEvtName(onclickParams.evtName);
                    setShowConfirmModal(true);
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
            case 'rename':
                if(user.hasAuth('UPDATE_OUTPOST')){
                    if(entity && entity.id === 1){
                        toast.error("Operation not allowed on default Outpost");
                        return;
                    }
                    setEntityToEdit(entity);
                    setConfirmDialogEvtName(onclickParams.evtName);
                    setDisplayMsg(`Enter Unique Outpost name`);
                    setShowInputModal(true);
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
            case 'stockSummary':
                window.open(`/outposts/stock/${entity.id}`, '_blank')?.focus();
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter Outpost Name");
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowInputModal(true);
                break;
            case 'trash':
                navigate('/outposts/trash');
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
            case 'create':
                if(user.hasAuth('CREATE_OUTPOST')){
                    setConfirmDialogEvtName(onclickParams.evtName);
                    setDisplayMsg(`Enter Unique Outpost name`);
                    setShowInputModal(true);
                }else {
                    toast.error("Account doesn't support this operation. Please contact your supervisor");
                    return;
                }
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredOutposts.slice(startIndex, startIndex + pageSize));
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
            case 'create':
                createOutpost(str);
                break;
            case 'rename':
                renameOutpost(str);
                break;
        }
	}
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		switch (confirmDialogEvtName) {
            case 'delete':
                setShowDropDownModal(true);
                break;
        }
	}
    
    const createOutpost = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await outpostController.create(name);
            if(response && response.data){
                const outpost = new Outpost(response.data);
                const arr = [...filteredOutposts, outpost];
                outposts.push(outpost);
                setOutposts(outpost);
                setFilteredOutposts([...arr]);
                /*  GO TO PAGE WHERE NEW OUTPOST IS.  */
                setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
                setTotalItemsCount(totalItemsCount + 1);
                toast.success('Outpost creation successful');
            }
            resetPage();
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return createOutpost(name);
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
    
    const renameOutpost = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await outpostController.rename(entityToEdit.id, name);
            if(response && response.status === 200){
                entityToEdit.name = name;
                //	find index position of edited item in filtered outposts arr
                let indexPos = filteredOutposts.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in outposts array with edited one
                    filteredOutposts.splice(indexPos, 1, entityToEdit);
                    setFilteredOutposts([...filteredOutposts]);
                    const startIndex = (currentPage - 1) * pageSize;
                    setPagedData(filteredOutposts.slice(startIndex, startIndex + pageSize));
                    toast.success('Update successful');
                }
                //  update in outposts arr also
                indexPos = outposts.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in outposts array with edited one
                    outposts.splice(indexPos, 1, entityToEdit);
                    setOutposts([...outposts]);
                }
            }
            resetPage();
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return renameOutpost(name);
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
    
    const deleteOutpost = async (destinationOutpost) => {
        setShowDropDownModal(false);
        if(entityToEdit.id === destinationOutpost.id){
            toast.error('Deleted Outpost and Destination Outpost cannot be same');
            return;
        }
        try {
            setNetworkRequest(true);
            
            await outpostController.deleteOutpost(entityToEdit.id, destinationOutpost.id);
            //	find index position of deleted item in items arr
            let indexPos = filteredOutposts.findIndex(o => o.id == entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                filteredOutposts.splice(indexPos, 1);
                setFilteredOutposts([...filteredOutposts]);
                /*  MAINTAIN CURRENT PAGE.  */
                setTotalItemsCount(totalItemsCount - 1);
                if(pagedData.length <= 1){
                    if(totalItemsCount >= pageSize){
                        setCurrentPage(currentPage - 1);
                    }
                }
                toast.success('Delete successful');
            }
            //  update in outposts arr also
            indexPos = outposts.findIndex(o => o.id === entityToEdit.id);
            if(indexPos > -1){
                //	replace old item found at index position in items array with edited one
                outposts.splice(indexPos, 1);
                setOutposts([...outposts]);
            }

            //  Remove deleted outpost from outpost options also, we don't want to have a deleted outpost as an option where items will be moved to :)
            indexPos = outpostOptions.findIndex(o => o.value.id === entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                outpostOptions.splice(indexPos, 1);
                setOutpostOptions([...outpostOptions]);
            }

            resetPage();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return deleteOutpost(destinationOutpost);
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
        headers: ['Outpost Name', 'Reg. Date', 'Creator', 'Options'],
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
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={outpostsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Outposts</span>
                        <img src={SVG.branch_colored_two} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Outposts are branches which are locations, other than the main office, where a business is conducted.
                    Create, delete (with exceptions to default outpost - HQ) outposts as necessary.
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
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={deleteOutpost}
                message={'Select destination Outpost where items will be moved to'}
                options={outpostOptions}
            />
        </div>
    );
};

export default OutpostsWindow;
