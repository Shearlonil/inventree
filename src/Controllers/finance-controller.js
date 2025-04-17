import httpService from "../axios/http-service";

const backup = async () => {
    /*  without the responseType set to arraybuffer, the downloaded file will have padding. Making it impossible to decrypt on the server side
        ref:    https://stackoverflow.com/questions/35680932/download-a-file-from-spring-boot-rest-service
        fetahokey's answer*/
    return await httpService.get(`/api/finance`, { responseType: 'arraybuffer' });
}

const createGroup = async (dtoAccGroup) => {
    return await httpService.post(`/api/finance/groups/create`, dtoAccGroup);
}

const findAccGroupById = async (id) => {
    return await httpService.get(`/api/finance/groups/${id}`);
}

export default {
    backup,
    createGroup,
    findAccGroupById,
}