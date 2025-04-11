import React from 'react'
import { Link } from 'react-router-dom'

const Card = ({ children, to, onClick, className }) => {
    const cardContent = _ => (
        <div className={`bg-[#F6F6F6] p-4 my-4 border rounded-lg shadow bg-[#f6f6f6] cursor-pointer ${className}`}>
            {children}
        </div>
    )

    return (
        <>
            <div onClick={onClick}>
                {to &&
                    <Link to={to}>
                        {cardContent()}
                    </Link>
                }
                {!to && cardContent()}
            </div>
        </>
    )
}

export default Card