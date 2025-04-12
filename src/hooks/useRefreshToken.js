import appAxios from 'src/api/axios';
import useAppStore from 'src/stores/useAppStore';

const useRefreshToken = () => {
    const appStore = useAppStore();

    const refresh = async () => {
        const response = await appAxios.get('/refresh', {
            withCredentials: true // this is important to include cookies in the request
        });
        appStore.setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken);
            return { ...prev, accessToken: response.data.accessToken }
        })
        return response.data.accessToken;
    }

    return refresh;
}

export default useRefreshToken