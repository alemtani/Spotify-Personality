import { Button, Container } from 'react-bootstrap';

export default function Loading({ message }) {
    function handleBack() {
        window.location = '/';
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