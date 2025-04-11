import httpService from "../axios/http-service";

const backup = async () => {
    /*  without the responseType set to arraybuffer, the downloaded file will have padding. Making it impossible to decrypt on the server side
        ref:    https://stackoverflow.com/questions/35680932/download-a-file-from-spring-boot-rest-service
        fetahokey's answer*/
    return await httpService.get(`/backup`, { responseType: 'arraybuffer' });
}

const restore = async (db_file) => {
    let formData = new FormData();
    formData.append('db_file', db_file);
    return await httpService.post(`/restore`, formData);
}

export default {
    backup,
    restore,
}