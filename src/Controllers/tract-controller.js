import httpService from "../axios/http-service";

const fetchAllActive = async () => {
    return await httpService.get(`/api/tracts/active`);
}

export default {
    fetchAllActive,
}