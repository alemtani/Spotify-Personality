import { useState, useEffect } from 'react';
import Error from './Error';
import Loading from './Loading';
import Personality from './Personality';
import Track from './Track';
import promiseThrottle from './promiseThrottle';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';

export default function Playlist({ accessToken }) {
    const [error, setError] = useState(null);
    const [analyze, setAnalyze] = useState(false);
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [snapshotId, setSnapshotId] = useState('');
    const [tracks, setTracks] = useState(null);
    const { playlistId } = useParams();

    function handleAnalyze() {
        setAnalyze(true);
    }

    function getPlaylist() {
        return axios.get(`http://localhost:3001/playlists/${playlistId}`, {
            params: {
                accessToken: accessToken
            }
        })
        .then(res => {
            setData(res.data.playlist);
            setSnapshotId(res.data.snapshotId);
        })
        .catch(err => {
            setError(err);
        });
    }

    function addTrack(track) {
        axios.post(`http://localhost:3001/playlists/${playlistId}/tracks`, {
            accessToken: accessToken,
            trackUri: track.uri
        })
        .then(res => {
            setSnapshotId(res.data.snapshotId);
        })
        .catch(err => {
            setError(err);
        });
    }

    function removeTrack(position) {
        axios.delete(`http://localhost:3001/playlists/${playlistId}/tracks`, {
            data: {
                accessToken: accessToken,
                position: position,
                snapshotId: snapshotId
            }
        })
        .then(res => {
            setSnapshotId(res.data.snapshotId);
        })
        .catch(err => {
            setError(err);
        });
    }

    function getMoreTracks(offset, tracks) {
        return axios.get(`http://localhost:3001/playlists/${playlistId}/tracks`, {
            params: {
                accessToken: accessToken,
                offset: offset
            }
        })
        .then(res => {
            tracks.push(...res.data.tracks);
        })
        .catch(err => {
            setError(err);
        });
    }

    // Get first set of tracks, then more if necessary as above
    function getAllTracks() {
        return axios.get(`http://localhost:3001/playlists/${playlistId}/tracks`, {
            params: {
                accessToken: accessToken
            }
        })
        .then(res => {
            const newTracks = [...res.data.tracks];
            const limit = res.data.limit;
            const total = res.data.total;

            const promises = [];
            let offset = limit;
            while (offset < total) {
                const promise = promiseThrottle.add(getMoreTracks.bind(this, offset, newTracks));
                promises.push(promise);
                offset += limit;
            }

            Promise.all(promises)
            .then(() => {
                setTracks([...newTracks]);
            })
            .catch(err => {
                setError(err);
            })
        })
        .catch(err => {
            setError(err);
        });
    }

    function getSearch(search) {
        return axios.get('http://localhost:3001/search', {
            params: {
                accessToken: accessToken,
                search: search
            }
        })
        .then(res => {
            setSearchResults(res.data.tracks);
        })
        .catch(err => {
            setError(err);
        });
    }

    useEffect(() => {
        if (!accessToken || !playlistId) return;
        promiseThrottle.add(getPlaylist.bind(this));
    }, [accessToken, playlistId]);

    useEffect(() => {
        if (!accessToken || !playlistId) return;
        promiseThrottle.add(getAllTracks.bind(this));
    }, [accessToken, playlistId, snapshotId]);

    useEffect(() => {
        if (!accessToken) return;
        if (!search) return setSearchResults([]);
        promiseThrottle.add(getSearch.bind(this, search));
    }, [accessToken, search]);

    if (error) {
        return <Error error={error}/>;
    }

    if (!data || !tracks) {
        return <Loading />;
    }

    if (!analyze) {
        return (
            <div>
                <Container className="d-flex flex-column py-2 custom-container">
                    <Row className="playlist-info-2">
                        <Col xs={2}>
                            {data.imageUrl && (
                                <img src={data.imageUrl} alt='Playlist' className="sm-img" />
                            )}
                        </Col>
                        <Col xs={10}>
                            <div className="ml-3">
                                <div className="playlist-title">{ data.name }</div>
                                <div dangerouslySetInnerHTML={{ __html: data.description }} />
                            </div>
                        </Col>
                    </Row>
                    {tracks.length > 0 && (
                        <button className="btn btn-success btn-lg" onClick={handleAnalyze}>
                            Analyze
                        </button>
                    )}
                    <div>
                    </div>
                    <div className="flex-grow-1 my-2 list">
                        {tracks.map((track, index) => (
                            <Track track={track} position={index + 1} removeTrack={removeTrack} key={index} />
                        ))}
                    </div>
                    <div>
                        <Form.Control
                            type="search"
                            placeholder="Search Songs"
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="flex-grow-1 my-2 list">
                            {searchResults.map(track => (
                                <Track track={track} addTrack={addTrack} key={track.id} />
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <Personality accessToken={accessToken} tracks={tracks} />
    );
}