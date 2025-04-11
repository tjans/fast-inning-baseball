import React from 'react'
import Modal from './Modal'
import Button from './Button'

const ConfirmationModal = ({ isModalOpen, onConfirm, onReject, onExtra, message, showYes, showNo, showExtra, noText, extraText, title }) => {
    return (
        <Modal
            isOpen={isModalOpen}>
            <div>
                <h1 className="mb-5 text-2xl font-bold">{title || "Confirmation"}</h1>
                <p className="mb-5">
                    {message || "Are you sure?"}
                </p>

                {(showYes ?? true) && <Button onClick={onConfirm} text="Yes" className="mr-1 border-b-4 bg-defaultBlue border-blueDarken" />}

                {(showNo ?? true) && <Button onClick={onReject} text={noText ?? "No"} variant="outline" className="mr-1" />}

                {(showExtra ?? false) && <Button onClick={onExtra} text={extraText ?? "??"} variant="outline" />}
            </div>
        </Modal>
    )
}

export default ConfirmationModal