import httpService from "../axios/http-service";

const findAll = async () => {
    return await httpService.get(`/api/outposts/all`);
}

const findById = async (id) => {
    return await httpService.get(`/api/outposts/all`, {
        params: {
            id,
        }
    });
}

export default {
    findAll,
    findById,
}