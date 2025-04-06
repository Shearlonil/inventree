import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import OffcanvasMenu from '../../../Components/OffcanvasMenu';
import SVG from '../../../assets/Svg';
import { useAuth } from '../../../app-context/auth-user-context';
import handleErrMsg from '../../../Utils/error-handler';
import TableMain from '../../../Components/TableView/TableMain';
import PaginationLite from '../../../Components/PaginationLite';
import InputDialog from '../../../Components/DialogBoxes/InputDialog';
import { OribitalLoading } from '../../../Components/react-loading-indicators/Indicator';
import pkgController from '../../../Controllers/pkg-controller';
import { Item } from '../../../Entities/Item';

const PkgItemsView = () => {
    const navigate = useNavigate();
    const { pkgName } = useParams();
            
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
    
    const [networkRequest, setNetworkRequest] = useState(false);

    //	for input dialog
    const [showInputModal, setShowInputModal] = useState(false);
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    //	for confirmation dialog
    const [displayMsg, setDisplayMsg] = useState("");
        
    //	for pagination
    const [pageSize] = useState(20);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [pkgItems, setPkgItems] = useState([]);
        
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
    const [filteredPkgItems, setFilteredPkgItems] = useState([]);

    const pkgsOffCanvasMenu = [
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
            const response = await pkgController.fetchPkgItems(pkgName);

            if (response && response.data && response.data.length > 0) {
                const arr = response.data.map(item => {
                    const i = new Item();
                    i.itemName = item.itemName;
                    i.creationDate = item.creationDate;
                    i.unitSalesPrice = item.unitSalesPrice;
                    i.packSalesPrice = item.packSalesPrice;
                    i.tractName = item.tractName;
                    return i;
                });
				setPkgItems(arr);
                setFilteredPkgItems(arr);
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

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'searchByName':
                setDisplayMsg("Enter Item Name");
				setConfirmDialogEvtName(onclickParams.evtName);
				setShowInputModal(true);
                break;
            case 'showAll':
                setFilteredPkgItems(pkgItems);
                setTotalItemsCount(pkgItems.length);
                break;
            case 'sortByName':
                filteredPkgItems.sort((a, b) => (a.itemName.toLowerCase() > b.itemName.toLowerCase()) ? 1 : ((b.itemName.toLowerCase() > a.itemName.toLowerCase()) ? -1 : 0));
                if(currentPage === 1){
                    setPagedData(filteredPkgItems.slice(0, 0 + pageSize));
                }
                setCurrentPage(1);
                break;
        }
	}
	
	const handleInputOK = async (str) => {
        let arr = [];
		switch (confirmDialogEvtName) {
            case 'searchByName':
                arr = pkgItems.filter(tract => tract.itemName.toLowerCase().includes(str));
                setFilteredPkgItems(arr);
                setTotalItemsCount(arr.length);
                setCurrentPage(1);
                break;
        }
	}

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(filteredPkgItems.slice(startIndex, startIndex + pageSize));
    };

    const handleCloseModal = () => {
        setDisplayMsg("");
		setShowInputModal(false);
    };
    
    const tableProps = {
        //	table header
        headers: ['Item Name', 'Reg. Date', 'Unit Sales Price', 'Unit Pkg Price', 'Section'],
        //	properties of objects as table data to be used to dynamically access the data(object) properties to display in the table body
        objectProps: ['itemName', 'creationDate', 'unitSalesPrice', 'packSalesPrice', 'tractName'],
    };

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div>
                    <OffcanvasMenu menuItems={pkgsOffCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
                </div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>{pkgName} Packaging</span>
                        <img src={SVG.department} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View items associated with a particular packaging.
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
            <InputDialog
                show={showInputModal}
                handleClose={handleCloseModal}
                handleConfirm={handleInputOK}
                message={displayMsg}
            />
        </div>
    );
};

export default PkgItemsView;
