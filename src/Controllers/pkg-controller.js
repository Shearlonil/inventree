import httpService from "../axios/http-service";

const fetchAll = async () => {
    return await httpService.get(`/api/pkg/all`);
}

export default {
    fetchAll,
}