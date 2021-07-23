import { Card, Col } from 'react-bootstrap';

// Selector is basically a playlist card selected in the dashboard
export default function Selector({ playlist, choosePlaylist }) {
    function handleAnalysis() {
        choosePlaylist(playlist);
    }

    return (
        <Col xs={12} sm={6} lg={3} className="mb-2">
            <Card className="d-flex m-auto p-2 align-items-center card" onClick={handleAnalysis}>
                {playlist.imageUrl && (
                    <Card.Img className='sm-img' variant="top" src={playlist.imageUrl} />
                )}
                <div className="m-3 playlist-info">
                    <Card.Title>{playlist.name}</Card.Title>
                    <Card.Text as="div" dangerouslySetInnerHTML={{ __html: playlist.description }} />
                </div>
            </Card>
        </Col>
    )
}