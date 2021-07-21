import { Container } from 'react-bootstrap';

export default function Loading() {
    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="info">
                Loading...
            </div>
        </Container>
    )
}