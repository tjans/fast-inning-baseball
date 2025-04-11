import {useState} from 'react'
import { Link } from "react-router-dom";
import { IoAddCircleSharp } from "react-icons/io5";

function NewButton(props) {

  return (
    <Link to={props.path} >

          {/* Turn this into a component!!! */}
          <div className="flex items-center justify-center m-3 text-2xl text-white bg-gray-950 h-14 rounded-2xl">

            <div className="flex items-center gap-3">
              <IoAddCircleSharp />
              {props.text}
            </div>

          </div>
        </Link>
  );
}

export default NewButton;
