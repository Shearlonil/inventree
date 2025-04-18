import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Table } from 'react-bootstrap';

import { useAuth } from '../../app-context/auth-user-context';
import handleErrMsg from '../../Utils/error-handler';
import { OribitalLoading } from '../../Components/react-loading-indicators/Indicator';
import SVG from '../../assets/Svg';
import financeController from '../../Controllers/finance-controller';

const AccChartDisplay = () => {
    const navigate = useNavigate();
    const { id } = useParams();
        
    const { handleRefresh, logout, authUser } = useAuth();
    const user = authUser();
      
    const [networkRequest, setNetworkRequest] = useState(false);
    
    const [chart, setChart] = useState(null);
    const [children, setChildren] = useState([]);

    useEffect( () => {
        if(user.hasAuth('FINANCE')){
            initialize();
        }else {
            toast.error("Account doesn't support viewing this page. Please contact your supervisor");
            navigate('/404');
        }
    }, [id]);
    
    const initialize = async () => {
        try {
            setNetworkRequest(true);
            //  find active charts and charts
            const response = await financeController.findAccChartById(id);

            //	check if the request to fetch charts doesn't fail before setting values to display
            if(response && response.data){
                setChart(response.data);
                setChildren(response.data.dtoGroups);
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

    return (
        <div className='container my-4'>
            <div className="container-md mx-auto d-flex flex-column bg-primary rounded-4 rounded-bottom-0 text-white align-items-center" >
                <div className="text-center d-flex">
                    <h2 className="display-6 p-3 mb-0">
                        <span className="me-4 fw-bold" style={{textShadow: "3px 3px 3px black"}}>Chart of Account</span>
                        <img src={SVG.pie_chart} style={{ width: "50px", height: "50px" }} />
                    </h2>
                </div>
                <span className='text-center m-1'>
                    View chart properties, groups associated with a selected Account Chart.
                    Please Note, this page requires FINANCE PERMISSION
                </span>
            </div>
            <div className="shadow p-4 border border-light rounded-3 bg-warning-subtle my-4">
                <div className="row g-4"> {/* Adds gap between sections */}
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Name:</span>
                            <span style={{overflow: 'scroll' }} className='pe-2 fw-bold text-primary'>{chart?.name}</span>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="p-2 shadow rounded-4 bg-light d-flex justify-content-between">
                            <span className="fw-bold text-md-end h5 me-2">Creator:</span>
                            <span style={{overflow: 'scroll', textAlign: "right" }} className='pe-2 text-primary fw-bold'>{chart?.creatorName}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="justify-content-center d-flex">
                {networkRequest && <OribitalLoading color='red' />}
            </div>
            
            <div className="p-3 rounded-3 p-3 overflow-md-auto bg-secondary-subtle my-4" style={{ minHeight: "700px" }}>
                <div className="border border rounded-3 p-1 bg-light my-3 shadow" style={{ maxHeight: "750px", minHeight: "750px", overflow: 'scroll' }}>
                    <Table id="myTable" className="rounded-2" striped hover responsive>
                        <thead>
                            <tr className="shadow-sm">
                                <th className='text-danger'>Description</th>
                                <th className='text-danger'>Date</th>
                                <th className='text-danger'>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {children.map((_datum, index) => (
                                <tr className='' key={index}>
                                    <td>
                                        <Link to={`/finance/${_datum.rep}s/${_datum.id}/view`}>
                                            {_datum.name}
                                        </Link>
                                    </td>
                                    <td>{format(_datum.creationDate, "dd/MM/yyyy")}</td>
                                    <td>{_datum.rep}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default AccChartDisplay;