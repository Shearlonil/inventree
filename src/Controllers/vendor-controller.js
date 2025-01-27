import httpService from "../axios/http-service";

const fetchAll = async () => {
    return await httpService.get(`/api/vendors/active`);
}

export default {
    fetchAll,
}