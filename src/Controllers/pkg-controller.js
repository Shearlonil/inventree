import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/pkg/active`);
}

const fetchPkgItems = async (tractName) => {
    return await httpService.get(`/api/pkg/${tractName}/items`);
}

const create = async (name) => {
    return await httpService.post(`/api/pkg/create`, null, {
        params: {
            name,
        }
    });
}

const rename = async (id, name) => {
    return await httpService.put(`/api/pkg/update`, null, {
        params: {
            name,
            id
        }
    });
}

const deletePkg = async (id, destination) => {
    return await httpService.delete(`/api/pkg/delete`, {
        params: {
            destination,
            id
        }
    });
}

export default {
    fetchAllActive,
    fetchPkgItems,
    create,
    rename,
    deletePkg,
}