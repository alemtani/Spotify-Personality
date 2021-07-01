import React from 'react';

export default function Footer() {
    function handleLogout() {
        console.log("Will logout!");
    }
    
    return (
        <div style={{ textAlign: 'center', position: 'fixed', bottom: '0', width: '100%' }}>
            <h2 onClick={handleLogout}>Log Out</h2>
        </div>
    );
}