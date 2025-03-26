import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getYear } from "date-fns";

import User from "../Entities/User";
import httpService from "../axios/http-service";
import { useCookieStorage } from "./useCookies";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext();
const jwtStorageTitle = "authorization";
const TOKEN_PREFIX = "Bearer ";

// ref: https://blog.logrocket.com/authentication-react-router-v6/
export const AuthProvider = ({ children }) => {
    //  const [jwtToken, setJwtToken] = useCookieStorage(jwtStorageTitle, null);
    const [jwtToken, setJwtToken] = useLocalStorage(jwtStorageTitle, null);
    const navigate = useNavigate();

    // call this function when you want to authenticate the user
    const login = async (loginDetails) => {
        const response = await httpService.post("/login", loginDetails);
        //  remove the token prefix from the token for jwtDecode to decode the token
        // const jwt = response.headers[jwtStorageTitle].replace(TOKEN_PREFIX, "");
        const jwt = response.headers[jwtStorageTitle];
        setJwtToken(jwt);
    };

    // call this function when you want to authenticate the user
    const handleRefresh = async () => {
        const response = await httpService.get("/refresh");
        //  remove the token prefix from the token for jwtDecode to decode the token
        const jwt = response.headers[jwtStorageTitle].replace(TOKEN_PREFIX, "");
        setJwtToken(jwt);
    };

    // call this function to sign out logged in user
    const logout = async (route) => {
        await httpService.get("/signout");
        setJwtToken(null);
        if (route) {
            navigate(route, { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    };

    const updateJWT = (response) => {
        const jwt = response.headers[jwtStorageTitle].replace(TOKEN_PREFIX, "");
        setJwtToken(jwt);
    };

    const authUser = () => {
        try {
            let token = decodedJwtToken();
            if (token) {
                return new User(token);
            } else {
                return null;
            }
        } catch (ex) {
            return null;
        }
    };

    const decodedJwtToken = () => {
        try {
            return jwtDecode(jwtToken);
        } catch (ex) {
            return null;
        }
    };

    const storeInLocalStorage = (name, data) => {
        localStorage.setItem(name, data);
    };

    const getCurrentYear = () => {
        return getYear(new Date());
    };

    const getLocalStorage = (name) => {
        return localStorage.getItem(name);
    };

    const value = useMemo(
        () => ({
            login,
            handleRefresh,
            authUser,
            decodedJwtToken,
            logout,
            updateJWT,
            storeInLocalStorage,
            getCurrentYear,
            getLocalStorage,
        }),
        [jwtToken]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
