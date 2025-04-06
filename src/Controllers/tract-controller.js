import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/tracts/active`);
}

const fetchTractItems = async (tractName) => {
    return await httpService.get(`/api/tracts/${tractName}/items`);
}

const create = async (name) => {
    return await httpService.post(`/api/tracts/create`, null, {
        params: {
            name,
        }
    });
}

const rename = async (id, name) => {
    return await httpService.put(`/api/tracts/update`, null, {
        params: {
            name,
            id
        }
    });
}

const deleteTract = async (id, destination) => {
    return await httpService.delete(`/api/tracts/delete`, {
        params: {
            destination,
            id
        }
    });
}

export default {
    fetchAllActive,
    fetchTractItems,
    create,
    rename,
    deleteTract,
}