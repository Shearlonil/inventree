import React from 'react'
import { Modal, Button } from "react-bootstrap";

const DispensaryForm = (props) => {
	const { data, fnSave, show, networkRequest, handleClose, handleConfirm }  = props;

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* <RestockForm fnSave={fnSave} data={entityToEdit} networkRequest={networkRequest} dbItemOptions={dbItemOptions} /> */}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DispensaryForm;