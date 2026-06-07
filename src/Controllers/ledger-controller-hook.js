import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useLedgerController = () => {
    const { xhrAxios } = useAxiosInterceptor();
    
    const findAllActive = async (signal) => {
        return await xhrAxios.get(`/api/ledgers/active`, {signal});
    };
    
    const trashedLedgers = async (signal) => {
        return await xhrAxios.get(`/api/trash/ledgers`, {signal});
    };
    
    const findById = async (id, signal) => {
        return await xhrAxios.get(`/api/ledgers/find`, {
            params: {
                id,
            }
        }, {signal});
    };
    
    const create = async (name, groupId, signal) => {
        return await xhrAxios.post(`/api/ledgers/create`, null, {
            params: {
                name,
                groupId
            }
        }, {signal});
    };
    
    const deleteLedger = async (id, signal) => {
        return await xhrAxios.delete(`/api/ledgers/delete`, {
            params: {
                id
            }
        }, {signal});
    };
    
    const restoreLedger = async (id, signal) => {
        return await xhrAxios.put(`/api/trash/ledgers/restore`, null, {
            params: {
                id,
            }
        }, {signal});
    };
    
    const rename = async (id, name, signal) => {
        return await xhrAxios.put(`/api/ledgers/rename`, null, {
            params: {
                name,
                id
            }
        }, {signal});
    };
    
    const setDiscount = async (id, val, signal) => {
        return await xhrAxios.put(`/api/ledgers/discount`, null, {
            params: {
                val,
                id
            }
        }, {signal});
    };
    
    const setAllowCreditSales = async (id, val, signal) => {
        return await xhrAxios.put(`/api/ledgers/allow-credit-sales`, null, {
            params: {
                val,
                id
            }
        }, {signal});
    };
    
    const findAll = async (signal) => {
        return await xhrAxios.get(`/api/ledgers/all`, {signal});
    };
    
    const ledgerTransactions = async (id, startDate, endDate, signal) => {
        return await xhrAxios.post(`/api/ledgers/transactions`, { startDate, endDate }, {
            params: {
                id
            }
        }, {signal});
    };
    
    return {
        findAll,
        findAllActive,
        trashedLedgers,
        findById,
        create,
        deleteLedger,
        restoreLedger,
        rename,
        setDiscount,
        setAllowCreditSales,
        ledgerTransactions,
    }
}

export default useLedgerController;