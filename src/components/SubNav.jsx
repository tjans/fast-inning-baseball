import React, { useEffect } from 'react'
import { IoHome } from "react-icons/io5";
import { Link, useLocation } from 'react-router-dom';

const SubNav = ({ crumbs }) => {
    const location = useLocation();

    return (
        <div className="p-2 bg-slate-200 text-soft flex items-center justify-center">
            <div className="flex gap-1 items-center">
                <IoHome />
                <Link to={`/`}>Home</Link>
            </div>
            {crumbs && crumbs.map((crumb, i) => {
                return (
                    <div key={i}>
                        <span className="mx-2">/</span>
                        {crumb.to
                            ? <Link to={crumb.to}>{crumb.text}</Link>
                            : <span>{crumb.text}</span>}
                    </div>
                )
            })}
        </div>
    )
}

export default SubNav