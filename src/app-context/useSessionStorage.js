import cryptoHelper from "../Utils/crypto-helper";

const setValue = (keyName, newValue) => {
    try {
        const encrypted = cryptoHelper.encrypt(newValue.toString());
        sessionStorage.setItem(keyName, encrypted);
    } catch (err) {}
};

const getValue = (keyName) => {
    try {
        const value = sessionStorage.getItem(keyName);
        if (value) {
            return cryptoHelper.decryptData(value);
        } else {
            sessionStorage.setItem(keyName, null);
            return null;
        }
    } catch (err) {
        return null;
    }
};

export default { setValue, getValue }