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

const findByUsername = async (username) => {
    return await httpService.get(`/api/users/find`, {
        params: {
            username,
        }
    });
}

const findUserAuths = async (username) => {
    return await httpService.get(`/api/users/authorities/${username}`, {
        params: {
            username,
        }
    });
}

const trashedUsers = async () => {
    return await httpService.get(`/api/trash/users`);
}

const create = async (dtoUser) => {
    return await httpService.post(`/api/users/create`, dtoUser);
}

const deleteUser = async (username) => {
    return await httpService.delete(`/api/users/delete`, {
        params: {
            username
        }
    });
}

const restoreUser = async (username) => {
    return await httpService.put(`/api/trash/users/restore`, null, {
        params: {
            username,
        }
    });
}

const updateUserAuth = async (username, status, authCode) => {
    return await httpService.put(`/api/authorities/update`, null, {
        params: {
            username,
            status, 
            authCode
        }
    });
}

const updateProfile = async (profile) => {
    return await httpService.put(`/api/users/profile/update`, profile);
}

const updatePassword = async (password, confirmPassword, currentPassword) => {
    return await httpService.put(`/api/users/password/update`, {
        password,
        confirmPassword,
        currentPassword
    });
}

export default {
    findAllActive,
    findById,
    findByUsername,
    findUserAuths,
    trashedUsers,
    create,
    deleteUser,
    restoreUser,
    updateUserAuth,
    updateProfile,
    updatePassword,
}