import React, { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../Components/OffcanvasMenu';
import SVG from '../../assets/Svg';
import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import vedorController from '../../Controllers/vendor-controller';
import customerController from '../../Controllers/customer-controller';
import TableMain from '../../Components/TableView/TableMain';
import PaginationLite from '../../Components/PaginationLite';
import ReactMenu from '../../Components/ReactMenu';
import { Contact } from '../../Entities/Contact';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import InputDialog from '../../Components/DialogBoxes/InputDialog';

const ContactTrash = () => {
    const navigate = useNavigate();
    const { contacts } = useParams();
            
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
    
    const [vendors, setVendors] = useState([]);
        
    const [showFormModal, setShowFormModal] = useState(false);
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);

    const vendorsOffCanvasMenu = [
        { label: "Search By Name", onClickParams: {evtName: 'searchByName'} },
        { label: "Sort By Name", onClickParams: {evtName: 'sortByName'} },
        { label: "Show All", onClickParams: {evtName: 'showAll'} },
    ];

    useEffect( () => {
        if(user.hasAuth('CONTACTS_WINDOWS')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contanct your supervisor");
            navigate('/404');
        }
    }, [contacts]);

	const initialize = async () => {
		try {
            let response;
            if(contacts === 'vendors'){
                response = await vedorController.fetchAllActive();
            }else {
                response = await customerController.fetchAllActive();
            }

            if (response && response.data && response.data.length > 0) {
                const arr = [];
                response.data.forEach( vendor => arr.push(new Contact(vendor)) );
				setVendors(arr);
                setFilteredVendors(arr);
				setTotalItemsCount(response.data.length);
            }
		} catch (error) {
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
		setShowFormModal(false);
    };

    const resetPage = () => {
        setDisplayMsg("");
		setEntityToEdit(null);
        setShowConfirmModal(false);
		setShowInputModal(false);
		setShowFormModal(false);
        setConfirmDialogEvtName(null);
    };
	
	const handleInputOK = async (str) => {
        let arr = [];
		switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = vendors.filter(vendor => vendor.name.toLowerCase().includes(str));
                setFilteredVendors(arr);
                setTotalItemsCount(arr.length);
                break;
        }
	}

    const handleTableReactMenuItemClick = async (onclickParams, entity, e) => {
        switch (onclickParams.evtName) {
            case 'restore':
				//	ask if sure to delete
				setEntityToEdit(entity);
				setDisplayMsg(`Restore vendor ${entity.name}?`);
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowConfirmModal(true);
                break;
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter Vendor Name");
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowInputModal(true);
                break;
            case 'showAll':
                setFilteredVendors(vendors);
                setTotalItemsCount(vendors.length);
                break;
            case 'sortByName':
                filteredVendors.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredVendors.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredVendors.slice(startIndex, startIndex + pageSize));
    };
	
	const handleConfirmOK = async () => {
		setShowConfirmModal(false);
		try {
			setNetworkRequest(true);
			switch (confirmDialogEvtName) {
				case 'deleteVendor':
					await vedorController.deleteVendor(entityToEdit.id);
					//	find index position of deleted item in items arr
					let indexPos = filteredVendors.findIndex(i => i.id == entityToEdit.id);
					if(indexPos > -1){
						//	cut out deleted item found at index position
						filteredVendors.splice(indexPos, 1);
						setFilteredVendors([...filteredVendors]);
						/*  MAINTAIN CURRENT PAGE.  */
						setTotalItemsCount(totalItemsCount - 1);
                        if(pagedData.length <= 1){
                            if(totalItemsCount >= pageSize){
                                setCurrentPage(currentPage - 1);
                            }
                        }
						toast.success('Delete successful');
					}
                    //  update in vendors arr also
                    indexPos = vendors.findIndex(i => i.id === data.id);
                    if(indexPos > -1){
                        //	replace old item found at index position in items array with edited one
                        vendors.splice(indexPos, 1);
                        setVendors([...vendors]);
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
    
    const updateVendor = async (data) => {
        try {
            setNetworkRequest(true);
            //  network request to update data
            const response = await vedorController.updateVendor(data);
            if(response && response.status === 200){
                //	find index position of edited item in filtered vendors arr
                let indexPos = filteredVendors.findIndex(i => i.id === data.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    filteredVendors.splice(indexPos, 1, data);
                    setFilteredVendors([...filteredVendors]);
                    const startIndex = (currentPage - 1) * pageSize;
                    setPagedData(filteredVendors.slice(startIndex, startIndex + pageSize));
                    toast.success('Update successful');
                }
                //  update in vendors arr also
                indexPos = vendors.findIndex(i => i.id === data.id);
                if(indexPos > -1){
                    //	replace old item found at index position in items array with edited one
                    vendors.splice(indexPos, 1, data);
                    setVendors([...vendors]);
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
					return updateVendor(data);
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
        headers: ['Vendor Name', 'Phone No', 'Address', 'E-Mail', 'Card No.', 'Balance', 'Options'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['name', 'phoneNo', 'address', 'email', 'loyaltyCardNo', 'ledgerBalance'],
        //	React Menu
        menus: {
            ReactMenu,
            menuItems,
            menuItemClick: handleTableReactMenuItemClick,
        }
    };

    return (
        <div className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={vendorsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Trash ({contacts === 'vendors' ? 'Vendors' : 'Customers'})</span>
                        <img src={SVG.customers_filled_white} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Vendors are your liabilities.
                    View, Restore deleted {contacts === 'vendors' ? 'Vendors' : 'Customers'}.
                </span>
            </div>

            <div className="container mt-4 p-3 shadow-sm border border-2 rounded-1">
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

export default ContactTrash;
