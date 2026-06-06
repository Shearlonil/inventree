import { createContext, useContext, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { useLocalStorage } from "./useLocalStorage";
import AppConstants from "../Utils/AppConstants";

const TokenContext = createContext();

/*ref:  https://blog.logrocket.com/authentication-react-router-v6/
        https://blog.logrocket.com/react-context-tutorial/
*/
export const TokenProvider = ({ children }) => {
    const [jwtToken, setJwtToken] = useLocalStorage(AppConstants.jwtStorageTitle, null);
    
    const decodedJwtToken = () => {
        try {
            return jwtDecode(jwtToken);
        } catch (ex) {
            return null;
        }
    };

    const getJwtToken = () => {
        return jwtToken;
    };

    const setJwtTokenValue = (token) => {
        setJwtToken(token);
    }

    const clear = () => {
        setJwtToken(null);
    }

    const value = useMemo(
        () => ({
            decodedJwtToken,
            getJwtToken,
            setJwtTokenValue,
            clear,
        }),
        [jwtToken]
    );

    return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export const useToken = () => useContext(TokenContext);