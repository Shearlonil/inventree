import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/customers/active`);
}

const fetchAllNonActive = async () => {
    return await httpService.get(`/api/trash/customers`);
}

const createCustomer = async (data) => {
    return await httpService.post(`/api/customers/create`, data);
}

const updateCustomer = async (data) => {
    return await httpService.put(`/api/customers/update`, data);
}

const deleteCustomer = async (id) => {
    return await httpService.delete(`/api/customers/delete`, {
        params: {
            id,
        }
    });
}

const restoreCustomer = async (id) => {
    return await httpService.put(`/api/trash/customers/restore`, null, {
        params: {
            id,
        }
    });
}

export default {
    fetchAllActive,
    fetchAllNonActive,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
}