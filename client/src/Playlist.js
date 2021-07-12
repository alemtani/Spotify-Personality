import { useState, useEffect } from 'react';
import Track from './Track';
import Personality from './Personality';
import { Container, Form } from 'react-bootstrap';
import axios from 'axios';

export default function Playlist({ accessToken, playlist, created }) {
    const [analyze, setAnalyze] = useState(false);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [snapshotId, setSnapshotId] = useState('');
    const [tracks, setTracks] = useState([]);

    function handleAnalyze() {
        setAnalyze(true);
    }

    function addTrack(track) {
        axios.post(`http://localhost:3001/${playlist.id}/tracks`, {
            accessToken: accessToken,
            trackUri: track.uri
        })
        .then(res => {
            setSnapshotId(res.data.snapshotId);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }

    function removeTrack(position) {
        console.log(accessToken);
        console.log(position);
        console.log(snapshotId);
        axios.delete(`http://localhost:3001/${playlist.id}/tracks`, {
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
            throw err;
        });
    }

    useEffect(() => {
        if (!playlist || !accessToken) return;

        const playlistId = playlist.id;
        let offset = 0;
        axios.get(`http://localhost:3001/${playlistId}/tracks`, {
            params: {
                accessToken: accessToken,
                playlistId: playlistId,
                offset: offset
            }
        })
        .then(res => {
            const newTracks = [...res.data.tracks];
            const limit = res.data.limit;
            const total = res.data.total;

            const promiseTracks = [];
            offset += limit;
            while (offset < total) {
                promiseTracks.push(
                    axios.get(`http://localhost:3001/${playlistId}/tracks`, {
                        params: {
                            accessToken: accessToken,
                            playlistId: playlistId,
                            offset: offset
                        }
                    })
                    .then(response => {
                        newTracks.push(...response.data.tracks);
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
                );
                offset += limit;
            }

            Promise.all(promiseTracks)
            .then(() => {
                setTracks([...newTracks])
            })
            .catch(err => {
                console.log(err);
                throw err;
            })
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }, [accessToken, playlist, snapshotId]);

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
            throw err;
        });

        return () => cancel = true;
    }, [accessToken, search]);

    useEffect(() => {
        if (!accessToken) return;
        if (!tracks) return setTracks([]);

        setTracks(tracks);
    }, [accessToken, tracks]);

    if (!analyze) {
        return (
            <div>
                <Container className="d-flex flex-column py-2" style={{height: "100vh"}}>
                    {playlist.imageUrl && (
                        <img src={playlist.imageUrl} alt='Playlist' style={{height: "128px", width: "128px"}} />
                    )}
                    <h1>{ playlist.name }</h1>
                    {playlist.description}
                    <button className="btn btn-success btn-lg" style={{ textAlign: 'center' }} onClick={handleAnalyze}>
                        Analyze
                    </button>
                    <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
                        {tracks.map((track, index) => 
                            created ? (
                                <Track track={track} position={index + 1} removeTrack={removeTrack} key={index} />
                            ) : (
                                <Track track={track} position={index + 1} key={index} />
                            )
                        )}
                    </div>
                    {created && (
                        <div>
                            <Form.Control
                                type="search"
                                placeholder="Search Songs"
                                value={search} 
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
                                {searchResults.map(track => (
                                    <Track track={track} addTrack={addTrack} key={track.id} />
                                ))}
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        );
    }

    return (
        <Personality accessToken={accessToken} tracks={tracks} />
    );
}