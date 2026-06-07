import { useAxiosInterceptor } from '../axios/axios-interceptors';

// https://stackoverflow.com/questions/75319009/how-to-use-hooks-within-function-in-react-js
const useUserController = () => {
    const { xhrAxios } = useAxiosInterceptor();
    
    const findAllActive = async (signal) => {
        return await xhrAxios.get(`/api/users/active`, {signal});
    }
    
    const findById = async (id, signal) => {
        return await xhrAxios.get(`/api/users/find`, {
            params: {
                id,
            }
        }, {signal});
    }
    
    const findByUsername = async (username, signal) => {
        return await xhrAxios.get(`/api/users/find`, {
            params: {
                username,
            }
        }, {signal});
    }
    
    const findUserAuths = async (username, signal) => {
        return await xhrAxios.get(`/api/users/authorities/${username}`, {
            params: {
                username,
            }
        }, {signal});
    }
    
    const trashedUsers = async (signal) => {
        return await xhrAxios.get(`/api/trash/users`, {signal});
    }
    
    const create = async (dtoUser, signal) => {
        return await xhrAxios.post(`/api/users/create`, dtoUser), {signal};
    }
    
    const deleteUser = async (username, signal) => {
        return await xhrAxios.delete(`/api/users/delete`, {
            params: {
                username
            }
        }, {signal});
    }
    
    const restoreUser = async (username, signal) => {
        return await xhrAxios.put(`/api/trash/users/restore`, null, {
            params: {
                username,
            }
        }, {signal});
    }
    
    const updateUserAuth = async (username, status, authCode, signal) => {
        return await xhrAxios.put(`/api/authorities/update`, null, {
            params: {
                username,
                status, 
                authCode
            }
        }, {signal});
    }
    
    const updatePassword = async (password, confirmPassword, currentPassword, signal) => {
        return await xhrAxios.put(`/api/users/password/update`, {
            password,
            confirmPassword,
            currentPassword
        }, {signal});
    }
    
    return {
        findAllActive,
        findById,
        findByUsername,
        findUserAuths,
        trashedUsers,
        create,
        deleteUser,
        restoreUser,
        updateUserAuth,
        updatePassword,
    }
}

export default useUserController;