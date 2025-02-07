import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/pkg/active`);
}

export default {
    fetchAllActive,
}