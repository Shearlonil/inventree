import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import FileSaver from 'file-saver';
import jsPDF from 'jspdf';
import { autoTable, applyPlugin } from 'jspdf-autotable'

import SVG from '../../../assets/Svg'
import { OribitalLoading } from '../../../Components/react-loading-indicators/Indicator'
import PaginationLite from '../../../Components/PaginationLite';
import OffcanvasMenu from '../../../Components/OffcanvasMenu';
import DateDialog from '../../../Components/DialogBoxes/DateDialog';
import DropDownDialog from '../../../Components/DialogBoxes/DropDownDialog';
import handleErrMsg from '../../../Utils/error-handler';
import User from '../../../Entities/User';
import useGenericController from '../../../Controllers/generic-controller-hook';
import useInventoryController from '../../../Controllers/inventory-controller-hook';

const History = () => {
    const controllerRef = useRef(new AbortController());

    applyPlugin(jsPDF);
    const navigate = useNavigate();
    const location = useLocation();

    const { journalDateSearch, journalItemSearch, journalUserSearch } = useInventoryController();
    const { performGetRequests } = useGenericController();

    const [networkRequest, setNetworkRequest] = useState(false);
    
    const [displayMsg, setDisplayMsg] = useState("");
    const [filename, setFilename] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    //  for drop down entity dialog (users and items)
    const [confirmDialogEvtName, setConfirmDialogEvtName] = useState(null);
    const [entityLoading, setEntityLoading] = useState(true);
    const [showDropDownModal, setShowDropDownModal] = useState(false);
    const [entityOptions, setEntityOptions] = useState([]);
    //	for date dialog
    const [showDateModal, setShowDateModal] = useState(false);

    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
              
    //  data displayed
    const [data, setData] = useState([]);

	const offCanvasMenu = [
		{ label: "Search By Date", onClickParams: {evtName: 'dateSearch'} },
		{ label: "Search By Item", onClickParams: {evtName: 'itemSearch'} },
		{ label: "Searh By User", onClickParams: {evtName: 'userSearch'} },
		{ label: "Export To PDF", onClickParams: {evtName: 'pdfExport'} },
	];
    
    useEffect( () => {
        initialize();
        return () => {
            // This cleanup function runs when the component unmounts or when the dependencies of useEffect change (e.g., route change)
            controllerRef.current.abort();
        };
    }, [location.pathname]);
    
    const initialize = async () => {
        try {
            setNetworkRequest(true);
            controllerRef.current = new AbortController();
            const urls = [ `/api/users/active`, `/api/items/all` ];
            const response = await performGetRequests(urls, controllerRef.current.signal);
            const { 0: usersRequest, 1: itemsRequest } = response;
            
            if (usersRequest && usersRequest.data && usersRequest.data.length > 0) {
                const arr = [];
                usersRequest.data.filter(datum => {
                    if(datum.username.toLowerCase() === 'inventree'){
                        return false;
                    }
                    return true;
                }).forEach( user => {
                    const u = new User();
                    //  u.id = user.id;
                    u.username = user.username;
                    u.firstName = user.firstName;
                    u.lastName = user.lastName;
                    u.sex = user.sex;
                    u.phoneNo = user.phoneNo;
                    u.email = user.email;
                    u.regDate = user.dateOfReg;
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
                setUsers(arr.map(user => ({label: user.username, value: user})));
            }

            if (itemsRequest && itemsRequest.data) {
                const arr = [];
                itemsRequest.data.forEach( item => arr.push({label: item.itemName, value: item}) );
                setItems(arr);
            }

            setEntityLoading(false);
            setNetworkRequest(false);
        } catch (error) {
            setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
        }
    };

	const handleOffCanvasMenuItemClick = async (onclickParams, e) => {
		switch (onclickParams.evtName) {
            case 'dateSearch':
				setShowDateModal(true);
                break;
            case 'itemSearch':
                setConfirmDialogEvtName(onclickParams.evtName);
                setDisplayMsg("Select Item");
                setEntityOptions(items);
                setShowDropDownModal(true);
                break
            case 'userSearch':
                setConfirmDialogEvtName(onclickParams.evtName);
                setDisplayMsg("Select User");
                setEntityOptions(users);
				setShowDropDownModal(true);
                break;
            case 'pdfExport':
                if(data.length > 0){
                    pdfExport();
                }
        }
	}

	const handleCloseModal = () => {
		setShowDateModal(false);
		setShowDropDownModal(false);
	};
	
	const dateSearch = async (date) => {
        /*  Setting start date to 1 instead of 0 to avoid story that touch (1 hour lag from front end, causing a previous date with 23 hour). Time
            isn't important here from front end as the time will be set by Java on the backend. Only date is important  */
        try {
			if (date.startDate && date.endDate) {
                const startDate = format(date.startDate, "yyyy-MM-dd") + "T01:00:00.000Z";
                const endDate = format(date.endDate, "yyyy-MM-dd") + "T23:59:59.000Z";
                setStartDate(startDate);
                setEndDate(endDate);

                setFilename(`Stock Journal: ${format(new Date(date.startDate), "dd/MM/yyyy")} - ${format(new Date(date.endDate), "dd/MM/yyyy")}`);
                
				const response = await journalDateSearch(startDate, endDate, controllerRef.current.signal);
				if(response && response.data){
                    setData(response.data);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
		}
	}
	
	const entitySearch = async (entity) => {
        switch (confirmDialogEvtName) {
            case 'itemSearch':
                itemSearch(entity);
                break;
            case 'userSearch':
                userSearch(entity);
                break;
        }
    }
	
	const itemSearch = async (entity) => {
        try {
			if (entity) {
                setFilename(`Stock Journal: ${entity.itemName}`);
                
				const response = await journalItemSearch(entity.id, controllerRef.current.signal);
				if(response && response.data){
                    setData(response.data);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
		}
	}
	
	const userSearch = async (entity) => {
        try {
			if (entity) {
                setFilename(`Stock Journal: ${entity.username}`);
                
				const response = await journalUserSearch(entity.username, controllerRef.current.signal);
				if(response && response.data){
                    setData(response.data);
				}
				setNetworkRequest(false);
			}
		} catch (error) {
			setNetworkRequest(false);
            // Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            // display error message
            toast.error(handleErrMsg(error).msg);
		}
	}
    
    const pdfExport = () => {
        /*  ref:
            *   https://stackoverflow.com/questions/56752113/export-to-pdf-in-react-table
            *   https://www.npmjs.com/package/jspdf-autotable
            *   https://www.npmjs.com/package/jspdf */
        const unit = "pt";
        const size = "A4"; // Use A1, A2, A3 or A4
        const orientation = "portrait"; // portrait or landscape
        const fileExtension = ".pdf";

        const marginLeft = 40;
        const doc = new jsPDF(orientation, unit, size);

        doc.setFontSize(15);

        const title = filename;

        doc.text(title, marginLeft, 40);
        autoTable(doc, {
            styles: { theme: 'striped' },
            margin: { top: 50 },
            // head: [['Name', 'Email']],
            body: data,
            columns: [
                { header: 'Source Name', dataKey: 'itemName' },
                { header: 'Quantity', dataKey: 'qty' },
                { header: 'Destination Item', dataKey: 'tractName' },
                { header: 'Location', dataKey: 'qtyType' },
                { header: 'Authorized By', dataKey: 'pkgName' },
                { header: 'Date', dataKey: 'expDate' },
            ],
        });
        
        doc.save(`${filename}` + fileExtension);
    }

    const resetAbortController = () => {
        // Cancel previous request if it exists
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();
    };

    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
                <div className={`${networkRequest ? 'disabledDiv' : ''}`}>
					<OffcanvasMenu menuItems={offCanvasMenu} menuItemClick={handleOffCanvasMenuItemClick} variant='danger' />
				</div>
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Stock Journal History</span>
                        <img src={SVG.history_book_white} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    Search Stock Journal history. View Changes made to stocks, items transfer etc.
                </span>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>
            
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "800px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow" style={{ maxHeight: "750px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Source Item</th>
                                <th className='text-danger'>Quantity</th>
                                <th className='text-danger'>Destination Item</th>
                                <th className='text-danger'>Location</th>
                                <th className='text-danger'>Authorized By</th>
                                <th className='text-danger'>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td className='text-primary fw-bold'>{_datum.itemName}</td>
                                    <td>{_datum.qty}</td>
                                    <td className='text-secondary fw-bold'>{_datum.tractName}</td>
                                    <td className='text-secondary fw-bold'>{_datum.qtyType}</td>
                                    <td className='text-secondary fw-bold'>
                                        <Link to={`/dashboard/${_datum.pkgName}/details`}>
                                            {_datum.pkgName}
                                        </Link>
                                    </td>
                                    <td>{_datum.expDate ? format(_datum.expDate, 'dd/MM/yyyy') : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            <DateDialog
                showRadio={false}
                show={showDateModal}
                handleClose={handleCloseModal}
                handleConfirm={dateSearch}
                message={"Select date range"}
            />
            <DropDownDialog
                show={showDropDownModal}
                handleClose={handleCloseModal}
                handleConfirm={entitySearch}
                message={displayMsg}
                options={entityOptions}
                optionsLoading={entityLoading}
            />
        </div>
    )
}

export default History