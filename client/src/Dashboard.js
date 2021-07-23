import { useState, useEffect } from 'react';
import Error from './Error';
import Loading from './Loading';
import Selector from './Selector';
import promiseThrottle from './promiseThrottle';
import axios from 'axios';
import { Container, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

export default function Dashboard({ accessToken }) {
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [chosenPlaylist, setChosenPlaylist] = useState(null);

    function choosePlaylist(playlist) {
        setChosenPlaylist(playlist);
    }

    // Need user ID to access playlists in API requests
    function getUserId() {
        return axios.get('http://localhost:3001/profile', {
            params: {
                accessToken: accessToken
            }
        })
        .then(res => {
            setUserId(res.data.id);
        })
        .catch(err => {
            setError(err);
        });
    }

    function getMorePlaylists(offset, playlists) {
        return axios.get('http://localhost:3001/playlists', {
            params: {
                accessToken: accessToken,
                userId: userId,
                offset: offset
            }
        })
        .then(res => {
            playlists.push(...res.data.playlists);
        })
        .catch(err => {
            setError(err);
        });
    }

    function getAllPlaylists() {
        return axios.get('http://localhost:3001/playlists', {
            params: {
                accessToken: accessToken,
                userId: userId
            }
        })
        .then(res => {
            const newPlaylists = [...res.data.playlists];
            const limit = res.data.limit;
            const total = res.data.total;

            const promises = [];
            let offset = limit;
            while (offset < total) {
                const promise = promiseThrottle.add(getMorePlaylists.bind(this, offset, newPlaylists));
                promises.push(promise);
                offset += limit;
            }

            Promise.all(promises)
            .then(() => {
                setPlaylists([...newPlaylists]);
            })
            .catch(err => {
                setError(err);
            })
        })
        .catch(err => {
            setError(err);
        });
    }

    useEffect(() => {
        if (!accessToken) return;
        promiseThrottle.add(getUserId.bind(this));
    }, [accessToken]);

    useEffect(() => {
        if (!userId || !accessToken) return;
        promiseThrottle.add(getAllPlaylists.bind(this));
    }, [accessToken, userId]);

    if (error) {
        return <Error error={error} />;
    }

    if (!userId || !playlists) {
        return <Loading />;
    }

    if (!chosenPlaylist) {
        return (
            <Container className="d-flex flex-column py-2">
                <Row>
                    {playlists.map(playlist => (
                        <Selector playlist={playlist} key={playlist.id} choosePlaylist={choosePlaylist} />
                    ))}
                </Row>
            </Container>
        );
    }

    return (
        <Redirect to={`/playlists/${chosenPlaylist.id}`} />
    )
    
}