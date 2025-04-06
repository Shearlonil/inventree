import { useState } from "react";

export const useLocalStorage = (keyName, defaultValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = localStorage.getItem(keyName);
            if (value) {
                return value;
            } else {
                localStorage.setItem(keyName, defaultValue);
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });
    const setValue = (newValue) => {
        try {
            localStorage.setItem(keyName, newValue);
        } catch (err) {}
        setStoredValue(newValue);
    };
    return [storedValue, setValue];
};