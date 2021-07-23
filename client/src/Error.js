import { Button, Container } from 'react-bootstrap';

export default function Error() {
    function handleBack() {
        window.location = '/';
    }
    
    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                <div className="header">Oops!</div>
                <div>Something went wrong</div>
                <Button variant="primary" onClick={handleBack}>
                    Go Back
                </Button>
            </div>
        </Container>
    )
}