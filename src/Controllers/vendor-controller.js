import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/vendors/active`);
}

const createVendor = async (data) => {
    return await httpService.post(`/api/vendors/create`, data);
}

const updateVendor = async (data) => {
    return await httpService.put(`/api/vendors/update`, data);
}

const deleteVendor = async (id) => {
    return await httpService.delete(`/api/vendors/delete`, {
        params: {
            id,
        }
    });
}

export default {
    fetchAllActive,
    createVendor,
    updateVendor,
    deleteVendor,
}