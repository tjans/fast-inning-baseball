import { useState } from 'react'

function TextBox(props) {

  const handleChange = (e) => {
    if (props.onChange) props.onChange(e);
  }

  return (
    <>
      <label className="block mb-2 text-sm font-bold text-left text-gray-700" htmlFor={props.id}>
        {props.label}
      </label>

      <input
        className="w-full px-3 py-2 leading-tight border rounded appearance-none border-zinc-800 text-soot focus:outline-none"
        id={props.id}
        value={props.value}
        onChange={handleChange}
        type="text"
        name={props.name}

        placeholder={props.placeholderText} />
    </>
  );
}

export default TextBox;
