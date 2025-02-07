import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/vendors/active`);
}

export default {
    fetchAllActive,
}