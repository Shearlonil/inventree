import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ReactMenu from '../../Components/ReactMenu';
import { Tract } from '../../Entities/Tract';
import InputDialog from '../../Components/DialogBoxes/InputDialog';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import DropDownDialog from '../../Components/DialogBoxes/DropDownDialog';
import tractController from '../../Controllers/tract-controller';

const TractsWindow = () => {
    const navigate = useNavigate();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();

    //	menus for the react-menu in table
    const menuItems = [
        { name: 'Rename', onClickParams: {evtName: 'rename' } },
        { name: 'Delete', onClickParams: {evtName: 'delete'} },
        { name: 'View Items', onClickParams: {evtName: 'viewItems'} },
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
    const [tractOptions, setTractOptions] = useState([]);
        
    //	for pagination
    const [pageSize] = useState(10);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [tracts, setTracts] = useState([]);
        
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredTracts, setFilteredTracts] = useState([]);

    const tractsOffCanvasMenu = [
        { label: "Create", onClickParams: {evtName: 'create'} },
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
    ];
            
    useEffect( () => {
        if(user.hasAuth('SECTIONS_WINDOW')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, []);

	const initialize = async () => {
		try {
            setNetworkRequest(true);
            const response = await tractController.fetchAllActive();

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( tract => arr.push(new Tract(tract)) );
				setTracts(arr);
                setFilteredTracts(arr);
				setTotalItemsCount(response.data.length);
                //  set tract options for drop down dialog in case of delete operation
				setTractOptions(arr.map( tract => ({label: tract.name, value: tract})));
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
                if(entity.isDefault){
                    toast.error("Operation not allowed on default Section");
                    return;
                }
                //	ask if sure to delete
                setEntityToEdit(entity);
                setDisplayMsg(`Delete Section ${entity.name}? You'll be requested to select destination for items in this Section.`);
                setConfirmDialogEvtName(onclickParams.evtName);
                setShowConfirmModal(true);
                break;
            case 'rename':
                if(entity && entity.id <= 2){
                    toast.error("Operation not allowed on default Section");
                    return;
                }
                setEntityToEdit(entity);
                setConfirmDialogEvtName(onclickParams.evtName);
                setDisplayMsg(`Enter Unique Section name`);
                setShowInputModal(true);
                break;
            case 'viewItems':
                window.open(`/sections/${entity.name}/items`, '_blank')?.focus();
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter Section Name");
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowInputModal(true);
                break;
            case 'trash':
                navigate('/tracts/trash');
                break;
            case 'showAll':
                setFilteredTracts(tracts);
                setTotalItemsCount(tracts.length);
                break;
            case 'sortByName':
                filteredTracts.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredTracts.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
            case 'create':
                setConfirmDialogEvtName(onclickParams.evtName);
                setDisplayMsg(`Enter Unique Section name`);
                setShowInputModal(true);
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredTracts.slice(startIndex, startIndex + pageSize));
    };
	
	const handleInputOK = async (str) => {
        let arr = [];
		switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = tracts.filter(tract => tract.name.toLowerCase().includes(str));
                setFilteredTracts(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
            case 'create':
                createTract(str);
                break;
            case 'rename':
                renameTract(str);
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
    
    const createTract = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await tractController.create(name);
            if(response && response.data){
                const tract = new Tract();
                tract.id = response.data.id;
                tract.name = response.data.name;
                tract.isDefault = response.data.isDefault;
                tract.creationDate = response.data.creationDate;
                tract.itemsCount = 0;
                tract.username = user.username;

                const arr = [...filteredTracts, tract];
                tracts.push(tract);
                setTracts(tract);
                setFilteredTracts([...arr]);
                /*  GO TO PAGE WHERE NEW TRACT IS.  */
                setCurrentPage(Math.ceil((totalItemsCount + 1) / pageSize));
                setTotalItemsCount(totalItemsCount + 1);
                toast.success('Tract creation successful');
            }
            resetPage();
            handleCloseModal();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return createTract(name);
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
    
    const renameTract = async (name) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await tractController.rename(entityToEdit.id, name);
            if(response && response.status === 200){
                entityToEdit.name = name;
                //	find index position of edited item in filtered tracts arr
                let indexPos = filteredTracts.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in tracts array with edited one
                    filteredTracts.splice(indexPos, 1, entityToEdit);
                    setFilteredTracts([...filteredTracts]);
                    const startIndex = (currentPage - 1) * pageSize;
                    setPagedData(filteredTracts.slice(startIndex, startIndex + pageSize));
                    toast.success('Update successful');
                }
                //  update in tracts arr also
                indexPos = tracts.findIndex(i => i.id === entityToEdit.id);
                if(indexPos > -1){
                    //	replace old item found at index position in tracts array with edited one
                    tracts.splice(indexPos, 1, entityToEdit);
                    setTracts([...tracts]);
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
					return renameTract(name);
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
    
    const deleteTract = async (destinationTract) => {
        setShowDropDownModal(false);
        if(entityToEdit.id === destinationTract.id){
            toast.error('Deleted Section and Destination Section cannot be same');
            return;
        }
        try {
            setNetworkRequest(true);
            
            await tractController.deleteTract(entityToEdit.id, destinationTract.id);
            //	find index position of deleted item in items arr
            let indexPos = filteredTracts.findIndex(t => t.id == entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                filteredTracts.splice(indexPos, 1);
                setFilteredTracts([...filteredTracts]);
                /*  MAINTAIN CURRENT PAGE.  */
                setTotalItemsCount(totalItemsCount - 1);
                if(pagedData.length <= 1){
                    if(totalItemsCount >= pageSize){
                        setCurrentPage(currentPage - 1);
                    }
                }
                toast.success('Delete successful');
            }
            //  update in tracts arr also
            indexPos = tracts.findIndex(t => t.id === entityToEdit.id);
            if(indexPos > -1){
                //	replace old item found at index position in items array with edited one
                tracts.splice(indexPos, 1);
                setTracts([...tracts]);
            }

            //  Remove deleted Tract from Tract options also, we don't want to have a deleted Tract as an option where items will be moved to :)
            indexPos = tractOptions.findIndex(t => t.value.id === entityToEdit.id);
            if(indexPos > -1){
                //	cut out deleted item found at index position
                tractOptions.splice(indexPos, 1);
                setTractOptions([...tractOptions]);
            }

            /*  find destination tract from filtered tracts array to update itemsCount for table display. Since both filtered and tracts arrays hold the same 
                objects (array from response.data), UPDATING THE itemsCount prop of the object found in filtered tracts array reflects in the tracts array  */
            let item = filteredTracts.find(t => t.id == destinationTract.id);
            if(item){
                item.itemsCount += entityToEdit.itemsCount;
            }

            resetPage();
            setNetworkRequest(false);
        } catch (error) {
			//	Incase of 500 (Invalid Token received!), perform refresh
			try {
				if(error.response?.status === 500 && error.response?.data.message === "Invalid Token received!"){
					await handleRefresh();
					return deleteTract(destinationTract);
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
        headers: ['Section Name', 'Reg. Date', 'Creator', 'No of Items', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['name', 'creationDate', 'username', 'itemsCount'],
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
                    <OffcanvasMenu menuItems={tractsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Sections</span>
                        <img src={SVG.department} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Sections are departments within the organization. Manage sections by creating, updating and deleting as needed.
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
                handleConfirm={deleteTract}
                message={'Select destination Section where items will be moved to'}
                options={tractOptions}
            />
        </div>
    );
};

export default TractsWindow;
