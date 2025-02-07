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

export default {
    findAllActive,
    findById,
}