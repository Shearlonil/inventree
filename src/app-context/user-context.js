import { createContext, useContext, useMemo } from "react";

import User from "../Entities/User";
import { useToken } from "./token-context";

const UserContext = createContext();

/*ref:  https://blog.logrocket.com/authentication-react-router-v6/
        https://blog.logrocket.com/react-context-tutorial/
*/
export const UserProvider = ({ children }) => {
    const { getJwtToken, decodedJwtToken } = useToken();
    const accessToken = getJwtToken();
    
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

    const value = useMemo(
        () => ({
            authUser,
        }),
        [accessToken]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useAuthUser = () => useContext(UserContext);