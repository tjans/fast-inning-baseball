import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

export function ActionButton(props) {
  const navigate = useNavigate();

  const bgClass = props.bgclass || "bg-defaultBlue border-blueDarken hover:bg-blueDarken";
  let classes = `min-w-24 py-2 px-5 font-bold border rounded-lg ${bgClass} text-white border-b-4 inline-block`;
  if (props.uniform) classes += " w-28";
  if (props.fullWidth) classes += " w-full";

  if (props.className) {
    classes += " " + props.className;
  }

  const handleClick = e => {
    if (props.path) {
      navigate(props.path)
    } else {
      if (props.onClick) props.onClick(e);
    }
  }

  return (
    <>
      <button name={props.name} onClick={handleClick} className={classes}>
        {props.text}
      </button>
    </>
  );
}

export function ActionLink(props) {

  const { getTeamStyle } = useGameData();

  let classes = "min-w-24 py-2 px-5 font-bold border-b-4 rounded-lg bg-defaultBlue text-white inline-block hover:bg-blueDarken border-blueDarken";
  if (props.className) {
    classes += " " + props.className;
  }

  return (
    <>
      <Link to={props.path} onClick={props.onClick} className={classes}>
        {props.text}
      </Link>
    </>
  );
}