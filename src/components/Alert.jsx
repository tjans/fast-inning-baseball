import React from 'react'
import { FaInfoCircle } from "react-icons/fa";


const Alert = ({ type, title, message, className }) => {
    const getClasses = () => {
        let alertClasses = 'p-4 mb-4 text-sm rounded-lg flex items-center gap-2'
        if (className) alertClasses += ' ' + className

        switch (type) {
            case 'info':
                alertClasses += ' text-[#1e429f] bg-[#cce5ff]'
                break;
            case 'danger':
                alertClasses += ' text-[red] bg-[#f8d7da]'
                break;
            case 'success':
                alertClasses += 'text-green-800 bg-green-50'
                break;
            case 'warning':
                alertClasses += 'text-yellow-800 bg-yellow-50'
                break;
            case 'dark':
                alertClasses += 'text-gray-800 bg-gray-50'
                break;
            default:
                alertClasses += 'text-gray-800 bg-gray-50'
        }
        return alertClasses;
    }
    return (
        <>
            <div className={getClasses()} role="alert">
                <FaInfoCircle className="text-lg" />
                {title && <span className="font-bold">{title}{' '}</span>}
                {message}
            </div>
        </>
    )
}

export default Alert