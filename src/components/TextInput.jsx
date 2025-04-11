import React from "react";

export const TextInput = ({
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

        <div className="pl-3 pt-3 bg-[#eeeeee] border-b-2 border-slate-400 text-left rounded-tl rounded-tr">
          <div className="">
            {label}
            {rules?.required ? <span className="text-red-600">&nbsp;*</span> : ""}
          </div>
          <input
            {...register(name, rules)}
            className="w-full pb-2 leading-tight bg-[#eeeeee] border-none text-soot outline-none text-xl"
            {...props} />
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