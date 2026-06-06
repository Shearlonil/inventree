import React, { useState } from 'react';
import { useToken } from '../app-context/token-context';
import { axiosInstance, axiosRefreshInstance } from './axios-instances';
import AppConstants from '../Utils/AppConstants';

/*  refs:
    https://dev.to/gagiknav/how-i-use-axios-interceptor-for-refreshing-token-in-a-custom-react-hook-1089
    https://dev.to/arianhamdi/react-hooks-in-axios-interceptors-3e1h
    https://www.codemzy.com/blog/react-axios-interceptor
*/
export const useAxiosInterceptor = () => {
    // Fetch the token refresh function and access token from your application
    const { getJwtToken, setJwtTokenValue } = useToken();
    const accessToken = getJwtToken();

    const [token, setToken] = useState(accessToken);

    // Define request/response and error interceptors
    const reqSuccessInterceptor = (config) => {
        config.headers.authorization = `Bearer ${token}`;
        return config;
    }

    const reqErrInterceptor = async (error) => Promise.reject(error);

    const resSuccessInterceptor = async (response) => {
        // Handle successful responses as needed
        return response;
    }

    const resErrInterceptor = async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            /*
                refs:
                https://medium.com/@nandagopal05/using-axios-interceptors-to-automate-refreshing-access-tokens-c3c344737bcc
                https://medium.com/@velja/token-refresh-with-axios-interceptors-for-a-seamless-authentication-experience-854b06064bde
            */
            originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
            let newToken;
            try {
                const response = await axiosInstance.get("/auth/refresh");
                //  remove the token prefix from the token for jwtDecode to decode the token
                const jwt = response.headers[AppConstants.jwtStorageTitle].replace(AppConstants.TOKEN_PREFIX, "");
                setToken(jwt);
                newToken = jwt;
                setJwtTokenValue(jwt);
            } catch (ex) {
5                // if error on refresh, then log out, delete auth token in local storage and clear cookie
                await axiosInstance.get("/auth/logout");
                setJwtTokenValue(null);
                window.location.href = '/login';
                return Promise.reject(ex);
            }
            try {
                // see axios-instances for reasons behind using axiosRefreshInstance to perfomr original request after refresh
                originalRequest.headers.authorization = `Bearer ${newToken}`;
                return await axiosRefreshInstance.request(originalRequest); // Retry the original request with the new access token.
            } catch (error) {
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }

    /*  A Bug detected on signin in, Axios won't attach bearer token to request after first login. Will only start attaching after page refresh.
        This method is a make shift to circumvent the bug. Called after successful login from the login implementation method
    */
    const setAxiosToken = (token) => setToken(token);

    const getBaseURL = () => axiosInstance.defaults.baseURL;

    // Set up the interceptors with useEffect
    React.useEffect(() => {
        const reqInterceptor = axiosInstance.interceptors.request.use(
            reqSuccessInterceptor,
            reqErrInterceptor,
        );

        const resInterceptor = axiosInstance.interceptors.response.use(
            resSuccessInterceptor,
            resErrInterceptor,
        );

        // Cleanup function
        return () => {
            axiosInstance.interceptors.request.eject(reqInterceptor);
            axiosInstance.interceptors.response.eject(resInterceptor);
        }
    }, [token]);

    return { xhrAios: axiosInstance, setAxiosToken, getBaseURL };
}