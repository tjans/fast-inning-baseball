import React from 'react'
import { IoAddCircleSharp } from "react-icons/io5";
import { Link } from 'react-router-dom';

const FloatingAddButton = ({ onClick, to, className }) => {
    return (
        <div className={`flex justify-center ${className}`} onClick={onClick}>
            <Link to={to}>
                <IoAddCircleSharp className="text-4xl text-black drop-shadow-md" />
            </Link>
        </div>
    )
}

export default FloatingAddButton