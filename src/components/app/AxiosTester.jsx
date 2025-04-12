import useAppAxios from 'src/hooks/useAppAxios';
import { useEffect, useState } from 'react'

// https://www.youtube.com/watch?v=nI8PYZNFtac
const AxiosTester = () => {
    const [data, setData] = useState(null);
    const appAxios = useAppAxios();

    useEffect(() => {

        let isMounted = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const response = await appAxios.get('/protected', {
                    signal: controller.signal
                });
                console.log(response.data);
                isMounted && setData(response.data);
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching data:', error);
                }
            }
        }
        fetchData();

        return () => {
            isMounted = false;
            controller.abort();
        }

    }, []);

    return (
        <div>{data?.message}</div>
    )
}

export default AxiosTester