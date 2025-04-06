import httpService from "../axios/http-service";

async function performGetRequests(urls) {
    const requests = httpService.getMapping(urls);
    return await httpService.all(requests);
}

async function performPostRequests(urls) {
    const requests = httpService.postMapping(urls);
    return await httpService.all(requests);
}

async function performPutRequests(urls) {
    const requests = httpService.putMapping(urls);
    return await httpService.all(requests);
}

async function requestOTP(email){
    await httpService.post(`/auth/otp/${email}`)
}

export default {
    performGetRequests,
    performPutRequests,
    performPostRequests,
    requestOTP,
}