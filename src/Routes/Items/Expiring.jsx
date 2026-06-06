import { useEffect, useRef, useState } from 'react'
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import { format, formatDistanceToNow } from 'date-fns';

import { useAuthUser } from '../../app-context/user-context';
import SVG from '../../assets/Svg';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import handleErrMsg from '../../Utils/error-handler';
import PaginationLite from '../../Components/PaginationLite';
import useInventoryController from '../../Controllers/inventory-controller-hook';

const Expiring = () => {
    const controllerRef = useRef(new AbortController());

    const navigate = useNavigate();
    const location = useLocation();
    
    const { expiring } = useInventoryController();
    const { authUser } = useAuthUser();
    const user = authUser();
    
    const [networkRequest, setNetworkRequest] = useState(false);
                
    //	for pagination
    const [pageSize] = useState(100);
    const [totalItemsCount, setTotalItemsCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [items, setItems] = useState([]);
                
    //  data returned from DataPagination
    const [pagedData, setPagedData] = useState([]);
                
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
            const response = await expiring(controllerRef.current.signal);

            if(response && response.data){
                setItems(response.data);
				setTotalItemsCount(response.data.length);
            }
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

    const setPageChanged = async (pageNumber) => {
		setCurrentPage(pageNumber);
    	const startIndex = (pageNumber - 1) * pageSize;
      	setPagedData(items.slice(startIndex, startIndex + pageSize));
    };


    return (
        <div style={{minHeight: '70vh'}} className="container">
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 m-3 text-white align-items-center" >
				<div className="text-center d-flex">
					<h2 className="display-6 p-3 mb-0">
						<span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Expiring/Expired Products</span>
						<img src={SVG.expiring_time_one} style={{ width: "50px", height: "50px" }} />
					</h2>
				</div>
                <span className='text-center m-1'>
                    View expired as well as expiring products withing six months
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
                                <th className='text-danger'>Item Name</th>
                                <th className='text-danger'>Stock In</th>
                                <th className='text-danger'>Stock Out</th>
                                <th className='text-danger'>Balance</th>
                                <th className='text-danger'>Posted On</th>
                                <th className='text-danger'>Age</th>
                                <th className='text-danger'>Cost</th>
                                <th className='text-danger'>Value</th>
                                <th className='text-danger'>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedData.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td className='text-primary fw-bold'>{_datum.itemName}</td>
                                    <td>{_datum.totalQty}</td>
                                    <td>{numeral(_datum.totalQty).subtract(numeral(_datum.salesQty).add(_datum.storeQty).value()).format('₦0,0.00')}</td>
                                    <td>{numeral(_datum.salesQty).add(_datum.storeQty).format('₦0,0.00')}</td>
                                    <td>{format(_datum.creationDate, 'dd/MM/yyyy')}</td>
                                    <td>{formatDistanceToNow(_datum.creationDate, {addSuffix: true})}</td>
                                    <td>
                                        {
                                            _datum.qtyType.toLowerCase() === 'unit' 
                                                ? numeral(_datum.stockPrice).format('₦0,0.00')
                                                : numeral(_datum.stockPrice).multiply(_datum.qtyPerPkg).format('₦0,0.00')
                                        }
                                    </td>
                                    <td>
                                        {
                                            _datum.qtyType.toLowerCase() === 'unit' 
                                                ? numeral(_datum.stockPrice).multiply(numeral(_datum.salesQty).add(_datum.storeQty).value()).format('₦0,0.00')
                                                : numeral(_datum.stockPrice).multiply(_datum.qtyPerPkg)
                                                    .multiply(numeral(_datum.salesQty).add(_datum.storeQty).value()).format('₦0,0.00')
                                        }
                                    </td>
                                    <td>{_datum.expDate ? format(_datum.expDate, 'dd/MM/yyyy') : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
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
    )
}

export default Expiring;