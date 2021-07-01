import React from 'react';

import { Container } from 'react-bootstrap';

export default function Access() {
    function handleSelect() {
        console.log("Chosen select");
    }

    function handleCreate() {
        console.log("Chosen create");
    }
    
    return (
        <Container className="d-flex flex-column py-2" style={{ height: "100vh", textAlign: "center" }}>
            <p>Give us your playlist and we'll try to guess your personality!</p>
            <button className="btn btn-success btn-lg" onClick={handleSelect}>
                Select Playlist
            </button>
            <h2 style={{width: "100%", borderBottom: "1px solid black", lineHeight: "0.1em", margin: "10px 0 20px"}}>
                <span style={{background: "white", padding: "0 10px"}}>
                    OR
                </span>
            </h2>
            <button className="btn btn-success btn-lg" onClick={handleCreate}>
                Create Playlist
            </button>
        </Container>
    )
}