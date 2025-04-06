import { useState } from "react";
import Cookies from "js-cookie";

/*  refs:
    https://blog.logrocket.com/authentication-react-router-v6/
    https://www.sitepoint.com/react-cookies-sessions/
*/
export const useCookieStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = Cookies.get(keyName);
            if (value) {
                return value;
            } else {
                Cookies.set(keyName, defaultValue, { secure: true, sameSite: 'strict', expires: 7 });
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });
    const setValue = (newValue) => {
        try {
            Cookies.set(keyName, newValue, { secure: true, sameSite: 'strict',expires: 7 });
        } catch (err) { }
        setStoredValue(newValue);
    };
    return [storedValue, setValue];
};
