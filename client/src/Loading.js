import { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

export default function Loading({ message }) {
    const [back, setBack] = useState(false);

    function handleBack() {
        setBack(true);
    }

    if (back) {
        return <Redirect to="/" />;
    }

    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                <div>
                    {message || 'Loading...'}
                </div>
                {message && (
                    <Button variant="primary" onClick={handleBack}>
                        Go Back
                    </Button>
                )}
            </div>
        </Container>
    );
}