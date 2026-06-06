import { Navigate, Outlet } from "react-router-dom";
import { useAuthUser } from "../app-context/user-context";

/*  refs:
    https://www.robinwieruch.de/react-router-private-routes/
    https://www.robinwieruch.de/react-router-authentication/
*/
export const ProtectedRoute = () => {
    const { authUser } = useAuthUser();
  
    if (!authUser()) {
      return <Navigate to="/login" />;
    }
  
    return (
        <Outlet />
    )
};

export default ProtectedRoute;