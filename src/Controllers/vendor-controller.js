import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/vendors/active`);
}

const fetchAllNonActive = async () => {
    return await httpService.get(`/api/trash/vendors`);
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

const restoreVendor = async (id) => {
    return await httpService.put(`/api/trash/vendors/restore`, null, {
        params: {
            id,
        }
    });
}

export default {
    fetchAllActive,
    fetchAllNonActive,
    createVendor,
    updateVendor,
    deleteVendor,
    restoreVendor,
}