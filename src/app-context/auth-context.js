import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getYear } from "date-fns";

import AppConstants from "../Utils/AppConstants";
import { useToken } from "./token-context";
import { useAxiosInterceptor } from "../axios/axios-interceptors";

const AuthContext = createContext();

/*ref:  https://blog.logrocket.com/authentication-react-router-v6/
        https://blog.logrocket.com/react-context-tutorial/
*/
export const AuthProvider = ({ children }) => {
    //  const [jwtToken, setJwtToken] = useCookieStorage(AppConstants.jwtStorageTitle, null);
    const { xhrAios, setAxiosToken } = useAxiosInterceptor();
    const { getJwtToken, setJwtTokenValue } = useToken();
    const accessToken = getJwtToken();
    const navigate = useNavigate();

    // call this function when you want to authenticate the user
    const login = async (loginDetails) => {
        const response = await xhrAios.post("/login", loginDetails);
        //  remove the token prefix from the token for jwtDecode to decode the token
        // const jwt = response.headers[AppConstants.jwtStorageTitle].replace(AppConstants.TOKEN_PREFIX, "");
        const jwt = response.headers[AppConstants.jwtStorageTitle];
        setJwtTokenValue(jwt);
        /*  Update token in axios. A Bug detected on signin in, Axios won't attach bearer token to request after first login. Will only start attaching after page refresh.
            This is a make shift to circumvent the bug
        */
        setAxiosToken(jwt);
    };

    // call this function to sign out logged in user
    const logout = async (route) => {
        await xhrAios.get("/signout");
        setJwtTokenValue(null);
        if (route) {
            navigate(route, { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    };

    const updateProfile = async (signal, data) => {
        const response = await xhrAios.put(`/api/users/profile/update`, data, {signal});
        //  remove the token prefix from the token for jwtDecode to decode the token
        const jwt = response.headers[AppConstants.jwtStorageTitle].replace(AppConstants.TOKEN_PREFIX, "");
        setJwtTokenValue(jwt);
        /*  Update token in axios. A Bug detected on signin in, Axios won't attach bearer token to request after first login. Will only start attaching after page refresh.
            This is a make shift to circumvent the bug
        */
        setAxiosToken(jwt);
    };

    const value = useMemo(
        () => ({
            login,
            logout,
            updateProfile,
        }),
        [accessToken]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
