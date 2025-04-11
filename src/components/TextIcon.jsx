import React from 'react'

const TextIcon = ({ text, settings }) => {
    return (

        <div className={"flex justify-center"}>
            <div className="flex items-center justify-center font-bold uppercase rounded-full"
                style={{ color: settings.textColor, background: settings.color, height: '50px', width: '50px' }}>
                {text}
            </div>
        </div>

    )
}

export default TextIcon