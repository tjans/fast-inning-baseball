import { useEffect } from 'react';
import appAxios from 'src/api/axios';
import useRefreshToken from 'src/hooks/useRefreshToken';
import useAppStore from 'src/stores/useAppStore';

const useAppAxios = () => {
    const refresh = useRefreshToken();
    const appStore = useAppStore();

    useEffect(() => {
        const responseIntercept = appAxios.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                if (error?.response?.status === 403 && !prevRequest?.sent) { // accessToken is expired
                    prevRequest.sent = true;
                    const newAccessToken = await refresh();
                    appStore.setAuth({ accessToken: newAccessToken });
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return appAxios(prevRequest); // make the request again with the new access token
                }
                return Promise.reject(error);
            }
        );

        const requestIntercept = appAxios.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${appStore.auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        // remove the intercepter so they don't continue to build up
        return () => {
            appAxios.interceptors.request.eject(requestIntercept);
            appAxios.interceptors.response.eject(responseIntercept);
        };

    }, [appStore.auth, refresh]);

    return appAxios;
}

export default useAppAxios;