import Error from './Error';
import { Button, Col } from 'react-bootstrap';

export default function Track({ track, position, addTrack, removeTrack }) {
    const artists = track.artists.map(artist => artist.name).join(', ');

    function handleAdd() {
        addTrack(track);
    }

    function handleRemove() {
        removeTrack(position - 1);
    }

    return (
        <div className="d-flex m-2 align-items-center">
            <Col xs={1}>
                {track.imageUrl && (
                    <img src={track.imageUrl} alt='Track' className="sm-img" />
                )}
            </Col>
            <Col xs={5} className="p-3">
                <div className="pl-3">
                    <div>{track.name}</div>
                    <div className="text-muted">{artists}</div>
                </div>
            </Col>
            <Col xs={4}>
                <div className="pl-3">
                    <div>{track.album}</div>
                </div>
            </Col>
            <Col xs={2}>
                {addTrack && (
                    <Button variant="primary" onClick={handleAdd}>
                        Add
                    </Button>
                )}
                {removeTrack && (
                    <Button variant="danger" onClick={handleRemove}>
                        Remove
                    </Button>
                )}
            </Col>
            {/* <div className="ml-3">
                <Col 
                
                <div>{artists}</div>
                <div>{track.album}</div>
                {addTrack && (
                    <button onClick={handleAdd}>
                        Add
                    </button>
                )}
                {removeTrack && (
                    <button onClick={handleRemove}>
                        Remove
                    </button>
                )}
            </div> */}
        </div>
    )
}