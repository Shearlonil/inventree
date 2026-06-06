import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { format } from 'date-fns';
import { Table } from 'react-bootstrap';

import { useAuthUser } from '../../app-context/user-context';
import handleErrMsg from '../../Utils/error-handler';
import ConfirmDialog from '../../Components/DialogBoxes/ConfirmDialog';
import useInventoryController from '../../Controllers/inventory-controller-hook';

const UnvenrifiedDispensary = () => {
    const controllerRef = useRef(new AbortController());

    const navigate = useNavigate();
    const location = useLocation();

    const { unverifiedDispensary } = useInventoryController();
    const { authUser } = useAuthUser();
    const user = authUser();

    const [networkRequest, setNetworkRequest] = useState(true);
    const [selectedEntry, setSelectedEntry] = useState(null);

    //  for Confirmation Dialog
    const [displayMsg, setDisplayMsg] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
  
    //  data returned from network fetch
    const [data, setData] = useState([]);
    
    useEffect(() => {
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
    
            const response = await unverifiedDispensary(controllerRef.current.signal);
    
            //  check if the request to fetch item doesn't fail before setting values to display
            if (response && response.data) {
                //  setProducts(response.data);
                setData(response.data);
            }
    
            setNetworkRequest(false);
        } catch (error) {
            //  Incase of 401 Unauthorized, navigate to 404
            if(error.response?.status === 401){
                navigate('/404');
                return;
            }
            //  display error message
            toast.error(handleErrMsg(error).msg);
        }
    };

    //  show modal for updating item details
    const openContinueModal = (item) => {
        if(item.user_name !== user.username){
            setDisplayMsg(`Continue modifying entry by ${item.user_name}?. Warning, This will set the user to your account`);
            setShowConfirmModal(true);
            setSelectedEntry(item);
            return;
        }
        navigate(`/inventory/item/dispensary/${item.id}`);
    };

    //  confirmation for updating item details and updating item imgs
    const handleConfirmAction = async () => {
        navigate(`/inventory/item/dispensary/${selectedEntry.id}`);
    };
  
    const closeConfirmModal = () => {
        setSelectedEntry(null);
        setShowConfirmModal(false);
    };

    const buildSummaryCards = () => {
        return data.map((item) => {
            const { id, user_name, item_count, f_name, l_name, date } = item;
            return (
                <div key={id}>
                    <div className="row mt-2">
                        <div className="col-md-6 col-12">
                            <div className="d-flex">
                                <div className="ms-3">
                                    <p className="fw-bold mb-2">{user_name}</p>
                                    <p className="mb-2">{f_name} {l_name}</p>
                                    <button
                                        className={`btn btn-sm btn-outline-danger px-3 rounded-pill`}
                                        onClick={() => openContinueModal(item)}
                                    >
                                        continue
                                    </button>
                                </div>
                            </div>
                        </div>
            
                        {/* ONLY DISPLAY ON MOBILE VIEW. FROM md upward never show */}
                        <div className="row d-md-none mb-2 mt-2">
                            <div className="col-md-2 col-4">ID</div>
                            <div className="col-md-2 col-4">No. of Items</div>
                            <div className="col-md-2 col-4">Date</div>
                        </div>

                        <div className="col-md-2 col-4">
                            {id}
                        </div>

                        <div className="col-md-2 col-4">
                            {item_count}
                        </div>
                        <div className="col-md-2 col-4 fw-bold p-0">
                            {format(date, "MM/dd/yyyy")}
                        </div>
                    </div>
                    <hr />
                </div>
            );
        });
    };

    const buildSkeleton = () => {
        return new Array(4).fill(1).map((index) => (
            <div key={Math.random()}>
                <div className="row mt-4">
                    <div className="col-md-6 col-12">
                        <div className="d-flex">
                            <div className="ms-3">
                                <p className="fw-bold mb-2">
                                    <Skeleton width={200} />
                                </p>
                                <Skeleton />
                            </div>
                        </div>
                    </div>
        
                    {/* ONLY DISPLAY ON MOBILE VIEW. FROM md upward never show */}
                    <div className="row d-md-none mb-2 mt-2">
                        <div className="col-md-2 col-4">ID</div>
                        <div className="col-md-2 col-4">No. of Items</div>
                        <div className="col-md-2 col-4">Date</div>
                    </div>
        
                    <div className="col-md-2 col-4">
                        <Skeleton />
                    </div>        
                    <div className="col-md-2 col-4">
                        <Skeleton />
                    </div>
                    <div className="col-md-2 col-4 fw-bold">
                        <Skeleton />
                    </div>
                </div>
                <hr />
            </div>
        ));
    };

    return (
        <div className="container my-5" style={{minHeight: '70vh'}}>
            <h2 className="paytone-one text-success mt-4">Unverified Dispensary Entries</h2>

            {/* only display in md. Never display in mobile view */}
            <div className="d-none d-md-block mt-4">
                <div className="row mb-2">
                    <div className="col-md-6 col-12 fw-bold">User</div>
                    <div className="col-md-2 col-4 fw-bold">ID</div>
                    <div className="col-md-2 col-4 fw-bold">No. of Items</div>
                    <div className="col-md-2 col-4 fw-bold">Date</div>
                </div>
            </div>
            <hr />

            <div className="rounded-2">
                {!networkRequest && data.length > 0 && buildSummaryCards()}
                {networkRequest && buildSkeleton()}
            </div>

            <ConfirmDialog
              show={showConfirmModal}
              handleClose={closeConfirmModal}
              handleConfirm={handleConfirmAction}
              message={displayMsg}
            />
        </div>
    )
}

export default UnvenrifiedDispensary;