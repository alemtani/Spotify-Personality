import { Button, Container } from 'react-bootstrap';

export default function Error({ error }) {
    function handleBack() {
        window.location = '/';
    }
    
    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                <div className="header">
                    {error.status ? error.status : error.message}
                </div>
                <div>
                    {error.status && error.message}
                </div>
                <Button variant="primary" onClick={handleBack}>
                    Go Back
                </Button>
            </div>
        </Container>
    )
}