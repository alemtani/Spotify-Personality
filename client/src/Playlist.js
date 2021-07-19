import { useState, useEffect } from 'react';
import Personality from './Personality';
import Track from './Track';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Form } from 'react-bootstrap';

export default function Playlist({ accessToken }) {
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
            throw err;
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
            throw err;
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
            throw err;
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

            // const promiseTracks = [];
            // offset += limit;
            // while (offset < total) {
            //     promiseTracks.push(
            //         axios.get(`http://localhost:3001/playlists/${playlistId}/tracks`, {
            //             params: {
            //                 accessToken: accessToken,
            //                 offset: offset
            //             }
            //         })
            //         .then(response => {
            //             newTracks.push(...response.data.tracks);
            //         })
            //         .catch(err => {
            //             console.log(err);
            //             throw err;
            //         })
            //     );
            //     offset += limit;
            // }

            // Promise.all(promiseTracks)
            // .then(() => {
            //     setTracks([...newTracks]);
            // })
            // .catch(err => {
            //     console.log(err);
            //     throw err;
            // })
        })
        .catch(err => {
            console.log(err);
            throw err;
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
            throw err;
        });

        return () => cancel = true;
    }, [accessToken, search]);

    if (!data || !tracks) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    if (!analyze) {
        return (
            <div>
                <Container className="d-flex flex-column py-2 custom-container">
                    {data.imageUrl && (
                        <img src={data.imageUrl} alt='Playlist' className="lg-img" />
                    )}
                    <h1>{ data.name }</h1>
                    {data.description}
                    {tracks.length > 0 && (
                        <button className="btn btn-success btn-lg" onClick={handleAnalyze}>
                            Analyze
                        </button>
                    )}
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