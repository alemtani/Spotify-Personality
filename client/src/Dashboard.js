import { useState, useEffect } from 'react';
import Card from './Card';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

export default function Dashboard({ accessToken }) {
    const [userId, setUserId] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [chosenPlaylist, setChosenPlaylist] = useState(null);

    function choosePlaylist(playlist) {
        setChosenPlaylist(playlist);
    }

    useEffect(() => {
        if (!accessToken) return;
        axios.get('http://localhost:3001/profile', {
            params: {
                accessToken: accessToken
            }
        })
        .then(res => {
            setUserId(res.data.id);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }, [accessToken]);

    useEffect(() => {
        if (!userId || !accessToken) return;

        let offset = 0;
        axios.get('http://localhost:3001/playlists', {
            params: {
                accessToken: accessToken,
                userId: userId,
                offset: offset
            }
        })
        .then(res => {
            const newPlaylists = [...res.data.playlists];
            const limit = res.data.limit;
            const total = res.data.total;

            const axiosReqs = [];
            offset += limit;
            while (offset < total) {
                axiosReqs.push(
                    axios.get('http://localhost:3001/playlists', {
                        params: {
                            accessToken: accessToken,
                            userId: userId,
                            offset: offset
                        }
                    })
                );
                offset += limit;
            }

            axios.all(axiosReqs)
            .then(axios.spread((...responses) => {
                responses.forEach(res => {
                    newPlaylists.push(...res.data.playlists);
                });
                setPlaylists([...newPlaylists]);
            }))
            .catch(errors => {
                console.log(errors);
                throw errors[0];
            });
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }, [accessToken, userId]);

    if (!userId || !playlists) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    if (!chosenPlaylist) {
        return (
            <Container className="d-flex flex-column py-2 custom-container">
                <div className="flex-grow-1 my-2 list">
                    {playlists.map(playlist => (
                        <Card playlist={playlist} key={playlist.id} choosePlaylist={choosePlaylist} />
                    ))}
                </div>
            </Container>
        );
    }

    return (
        <Redirect to={`/playlists/${chosenPlaylist.id}`} />
    )
    
}