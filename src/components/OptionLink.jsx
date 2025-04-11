import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Card from "src/components/Card";

export function OptionLink(props) {
    let classes = "flex items-center justify-center h-12 m-3 font-bold";
    if (props.variant == "cancel") classes += " bg-neutral-700 border-neutral-800 border-b-4 text-white hover:bg-neutral-800";
    if (props.variant == "back") classes += " bg-defaultBlue border-blueDarken border-b-4 text-white hover:bg-blueDarken";

    if (props.className) classes += " " + props.className;


    return (
        <>
            <Card to={props.path}
                onClick={props.onClick}
                className={classes}>
                {props.text}
            </Card>
        </>
    );
}
