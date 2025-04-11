import React from 'react'
import { Link } from 'react-router-dom'

const DebugJson = ({ json }) => {

    return (
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
            {JSON.stringify(json, null, 2)}
        </pre>
    )
}

export default DebugJson