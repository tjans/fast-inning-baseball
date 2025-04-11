import React from 'react'
import { Link } from 'react-router-dom'

function Card(props) {
    return (
        // <div className={`bg-[#F6F6F6] p-4 my-4 border rounded-lg shadow bg-[#f6f6f6] cursor-pointer ${className}`}>
        <div className="card text-left mb-3 border rounded-lg shadow cursor-pointer">
            {props.children}
        </div>
    )
}

function CardFooter(props) {
    return <footer className="px-4 py-2 bg-white">{props.children}</footer>;
}

function CardContent({ children }) {
    return <section className="px-4 pt-3 bg-[#f2f2f2]">{children}</section>;
}

Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;