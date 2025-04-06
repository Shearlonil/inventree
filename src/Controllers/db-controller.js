import httpService from "../axios/http-service";

const backup = async () => {
    return await httpService.get(`/backup`);
}

const restore = async (file) => {
    return await httpService.post(``, file);
}

export default {
    backup,
    restore,
}