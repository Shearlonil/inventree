import httpService from "../axios/http-service";

const fetchAll = async () => {
    return await httpService.get(`/api/tracts/all`);
}

export default {
    fetchAll,
}