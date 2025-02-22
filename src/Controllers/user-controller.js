import httpService from "../axios/http-service";

const findAllActive = async () => {
    return await httpService.get(`/api/users/active`);
}

const findById = async (id) => {
    return await httpService.get(`/api/users/find`, {
        params: {
            id,
        }
    });
}

const trashedUser = async () => {
    return await httpService.get(`/api/trash/users`);
}

const create = async (name) => {
    return await httpService.post(`/api/users/create`, null, {
        params: {
            name,
        }
    });
}

const deleteUser = async (id, destination) => {
    return await httpService.delete(`/api/users/delete`, {
        params: {
            destination,
            id
        }
    });
}

const restoreUser = async (id) => {
    return await httpService.put(`/api/trash/users/restore`, null, {
        params: {
            id,
        }
    });
}

const updateProfile = async (profile) => {
    return await httpService.put(`/api/users/profile/update`, profile);
}

const updatePassword = async (pw) => {
    return await httpService.put(`/api/users/password/update`, pw);
}

export default {
    findAllActive,
    findById,
    trashedUser,
    create,
    deleteUser,
    restoreUser,
    updateProfile,
}