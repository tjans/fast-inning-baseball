import React from 'react'
import { Link } from 'react-router-dom'

const Button = (props) => {
    const getVariant = () => {
        return "outline-none bg-btn-primary py-3 font-bold px-6 rounded-lg uppercase text-white shadow border-b-4 border-b-btn-primary-shadow " + props.className;

        // <button
        //     onClick={_ => props.onSubmit ? props.onSubmit() : null}
        //     className="px-4 py-2 font-bold text-white bg-btn-primary rounded hover:bg-defaultBlue-700 w-max">
        //     Submit
        //   </button>
    }

    return (
        <>
            {props.to && <Link to={props.to} className={getVariant()}>{props.text}</Link>}

            {!props.to &&
                <button {...props} className={getVariant()} onClick={props.onClick}>
                    {props.text}
                </button>
            }
        </>
    )
}

export default Button