import { useState } from 'react'
import { Link } from 'react-router-dom';

function formSubmit(props) {

  const [showSubmit] = useState(props.showSubmit ?? true);

  const handleCancel = (e) => {
    e.preventDefault();
    if (props.onCancel) props.onCancel();
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-5 mb-4 text-left">

        {showSubmit &&
          <button
            onClick={_ => props.onSubmit ? props.onSubmit() : null}
            className="px-4 py-2 font-bold text-white bg-btn-primary border-b-4 border-b-[#3b6994] rounded hover:bg-defaultBlue-700 w-max">
            {props.text ?? "Submit"}
          </button>
        }

        <a href="#"
          onClick={handleCancel}
          className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Cancel/Back</a>


      </div>
    </>
  );
}

export default formSubmit;
