import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app-context/auth-user-context";

/*  refs:
    https://www.robinwieruch.de/react-router-private-routes/
    https://www.robinwieruch.de/react-router-authentication/
*/
export const ProtectedRoute = () => {
    const { authUser } = useAuth();
  
    if (!authUser()) {
      return <Navigate to="/login" />;
    }
  
    return (
        <Outlet />
    )
};

export default ProtectedRoute;