import httpService from "../axios/http-service";

const findAllActive = async () => {
    return await httpService.get(`/api/ledgers/active`);
};

const trashedLedgers = async () => {
    return await httpService.get(`/api/trash/ledgers`);
};

const findById = async (id) => {
    return await httpService.get(`/api/ledgers/find`, {
        params: {
            id,
        }
    });
};

const create = async (name, groupId) => {
    return await httpService.post(`/api/ledgers/create`, null, {
        params: {
            name,
            groupId
        }
    });
};

const deleteLedger = async (id) => {
    return await httpService.delete(`/api/ledgers/delete`, {
        params: {
            id
        }
    });
};

const restoreLedger = async (id) => {
    return await httpService.put(`/api/trash/ledgers/restore`, null, {
        params: {
            id,
        }
    });
};

const rename = async (id, name) => {
    return await httpService.put(`/api/ledgers/rename`, null, {
        params: {
            name,
            id
        }
    });
};

const setDiscount = async (id, val) => {
    return await httpService.put(`/api/ledgers/discount`, null, {
        params: {
            val,
            id
        }
    });
};

const setAllowCreditSales = async (id, val) => {
    return await httpService.put(`/api/ledgers/allow-credit-sales`, null, {
        params: {
            val,
            id
        }
    });
};

const findAll = async () => {
    return await httpService.get(`/api/ledgers/all`);
};

const ledgerTransactions = async (id, startDate, endDate) => {
    return await httpService.post(`/api/ledgers/transactions`, { startDate, endDate }, {
        params: {
            id
        }
    });
};

export default {
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