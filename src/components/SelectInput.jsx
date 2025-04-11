import React, { forwardRef } from "react";

export const SelectInput = ({
  rules,
  error,
  name,
  label,
  register,
  required,
  ...props
}) => {
  return (
    <>
      <div className="my-5">
        <div className="pt-3 pr-1 bg-[#eeeeee] border-b-2 border-slate-400 text-left rounded-tl rounded-tr">

          <div className="text-xs pl-1">
            {label}
            {rules?.required ? <span className="text-red-600">&nbsp;*</span> : ""}
          </div>

          <select disabled={props.isDisabled ?? false}
            {...register(name, rules)}
            className="w-full py-2 leading-tight text-gray-700 focus:outline-none bg-[#eeeeee] border-none border-slate-400 focus:shadow-outline rounded"
            {...props}
          >
            {props.children}
          </select>
        </div>

        {error && (
          <div className="my-1 text-sm text-left text-red-600">
            {error.message}
          </div>
        )}

      </div>
    </>
  );
};