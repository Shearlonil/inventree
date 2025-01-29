import React from 'react'
import { useAuth } from '../app-context/auth-user-context';

const OngoingStockRec = () => {
    const navigate = useNavigate();

    const { authUser, handleRefresh, logout } = useAuth();
    const user = authUser();

    return (
        <div>OngoingStockRec</div>
    )
}

export default OngoingStockRec;