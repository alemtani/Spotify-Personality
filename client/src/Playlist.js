import { useState, useEffect } from 'react';
import Error from './Error';
import Loading from './Loading';
import Personality from './Personality';
import Track from './Track';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';

export default function Playlist({ accessToken }) {
    const [isErr, setIsErr] = useState(false);
    const [analyze, setAnalyze] = useState(false);
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [snapshotId, setSnapshotId] = useState('');
    const [tracks, setTracks] = useState(null);
    let { playlistId } = useParams();

    function handleAnalyze() {
        setAnalyze(true);
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
            console.log(err);
            setIsErr(true);
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
            console.log(err);
            setIsErr(true);
        });
    }

    useEffect(() => {
        if (!accessToken || !playlistId) return;
        axios.get(`http://localhost:3001/playlists/${playlistId}`, {
            params: {
                accessToken: accessToken
            }
        })
        .then(res => {
            setData(res.data.playlist);
            setSnapshotId(res.data.snapshotId);
        })
        .catch(err => {
            console.log(err);
            setIsErr(true);
        });
    }, [accessToken, playlistId]);

    useEffect(() => {
        if (!accessToken || !playlistId) return;
        let offset = 0;
        axios.get(`http://localhost:3001/playlists/${playlistId}/tracks`, {
            params: {
                accessToken: accessToken,
                offset: offset
            }
        })
        .then(res => {
            const newTracks = [...res.data.tracks];
            const limit = res.data.limit;
            const total = res.data.total;

            const axiosReqs = [];
            offset += limit;

            while (offset < total) {
                axiosReqs.push(
                    axios.get(`http://localhost:3001/playlists/${playlistId}/tracks`, {
                        params: {
                            accessToken: accessToken,
                            offset: offset
                        }
                    })
                );
                offset += limit;
            }

            axios.all(axiosReqs)
            .then(axios.spread((...responses) => {
                responses.forEach(res => {
                    newTracks.push(...res.data.tracks);
                });
                setTracks([...newTracks]);
            }))
            .catch(errors => {
                console.log(errors);
                throw errors[0];
            });
        })
        .catch(err => {
            console.log(err);
            setIsErr(true);
        });
    }, [accessToken, playlistId, snapshotId]);

    useEffect(() => {
        if (!accessToken) return;
        if (!search) return setSearchResults([]);

        let cancel = false;
        axios.get('http://localhost:3001/search', {
            params: {
                accessToken: accessToken,
                search: search
            }
        })
        .then(res => {
            if (cancel) return;
            setSearchResults(res.data.tracks);
        })
        .catch(err => {
            console.log(err);
            setIsErr(true);
        });

        return () => cancel = true;
    }, [accessToken, search]);

    if (isErr) {
        return <Error />;
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