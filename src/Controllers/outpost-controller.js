import httpService from "../axios/http-service";

const findAllActive = async () => {
    return await httpService.get(`/api/outposts/active`);
}

const findById = async (id) => {
    return await httpService.get(`/api/outposts/find`, {
        params: {
            id,
        }
    });
}

const trashedOutpost = async () => {
    return await httpService.get(`/api/trash/outposts`);
}

const create = async (name) => {
    return await httpService.post(`/api/outposts/create`, null, {
        params: {
            name,
        }
    });
}

const deleteOutpost = async (id, destination) => {
    return await httpService.delete(`/api/outposts/delete`, {
        params: {
            destination,
            id
        }
    });
}

const restoreOutpost = async (id) => {
    return await httpService.put(`/api/trash/outposts/restore`, null, {
        params: {
            id,
        }
    });
}

const rename = async (id, name) => {
    return await httpService.put(`/api/outposts/update`, null, {
        params: {
            name,
            id
        }
    });
}

const findAll = async () => {
    return await httpService.get(`/api/outposts/all`);
}

export default {
    findAll,
    findAllActive,
    findById,
    trashedOutpost,
    create,
    deleteOutpost,
    restoreOutpost,
    rename,
}