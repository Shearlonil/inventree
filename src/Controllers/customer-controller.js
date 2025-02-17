import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/customers/active`);
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

export default {
    fetchAllActive,
    createCustomer,
    updateCustomer,
    deleteCustomer,
}