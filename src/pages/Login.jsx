import { useEffect, useState, useRef } from "react";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

import axios from "src/components/Axios";

// forms
import { set, useForm } from "react-hook-form";

// store
import useAppStore from "src/stores/useAppStore";

export default function Login() {

    usePageTitle("Login");
    const [statusMessage, setStatusMessage] = useState('');  // replace this with a navigate

    const appStore = useAppStore();
    const userRef = useRef();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    useEffect(() => {

    }, []);

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('/login', JSON.stringify({ userName: data.userName, password: data.password }));
            console.log(JSON.stringify(response?.data));
            const accessToken = response?.data?.accessToken;
            appStore.setAuth({ accessToken })
            //const roles = response?.data?.roles;
            setStatusMessage('Login successful!');
        } catch (err) {
            if (!err?.response) {
                setStatusMessage('No Server Response');
            } else if (err.response?.status === 400) {
                setStatusMessage('Missing Username or Password');
            } else if (err.response?.status === 401) {
                setStatusMessage('Unauthorized');
            } else if (err.response?.status === 403) {
                setStatusMessage('Forbidden');
            } else {
                setStatusMessage('Login failed for unknown reason');
            }
            setStatusMessage('Error: ' + error.message);
        }

        setValue('userName', '');
        setValue('password', '');
    };

    return (
        <>
            <ContentWrapper>
                <section className="">
                    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto" style={{ minHeight: "calc(100vh - 300px)" }}>
                        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                    Sign in to your account
                                </h1>
                                {statusMessage && <p className="text-red-500 text-sm">{statusMessage}</p>}
                                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                    <div>
                                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>

                                        <input
                                            {...register("userName", { required: 'Username is required' })}
                                            autoComplete="off"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                        {errors.userName && <p className="text-red-500 text-sm">{errors.userName.message}</p>}

                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                                        <input
                                            {...register("password", { required: 'Password is required' })}
                                            type="password"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                                    </div>
                                    <button type="submit" className="">Login</button>

                                </form>
                            </div>
                        </div>
                    </div>


                </section>
            </ContentWrapper>
        </>
    );
}


