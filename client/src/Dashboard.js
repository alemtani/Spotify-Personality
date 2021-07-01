import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import Profile from './Profile';
import Playlist from './Playlist';
import Personality from './Personality';
import { Container } from 'react-bootstrap';
import axios from 'axios';

export default function Dashboard({ code }) {
    const accessToken = useAuth(code);
    const [profile, setProfile] = useState(null);
    const [playlists, setPlaylists] = useState(null);
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
            setProfile({...res.data});
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }, [accessToken]);

    useEffect(() => {
        if (!profile || !accessToken) return;

        const userId = profile.id;
        const limit = 10;
        let offset = 0;
        axios.get('http://localhost:3001/playlists', {
            params: {
                accessToken: accessToken,
                userId: userId,
                limit: limit,
                offset: offset
            }
        })
        .then(res => {
            const newPlaylists = [...res.data.playlists];
            const total = res.data.total;

            const promisePlaylists = [];
            offset += limit;
            while (offset < total) {
                promisePlaylists.push(
                    axios.get('http://localhost:3001/playlists', {
                        params: {
                            accessToken: accessToken,
                            userId: userId,
                            limit: limit,
                            offset: offset
                        }
                    })
                    .then(response => {
                        newPlaylists.push(...response.data.playlists);
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
                );
                offset += limit;
            }

            Promise.all(promisePlaylists)
            .then(() => {
                setPlaylists([...newPlaylists])
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
    }, [accessToken, profile]);

    if (!profile || !playlists) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    return (
        <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
            <div>
                <Profile profile={profile} key={profile.id}/>
            </div>
            <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
                {playlists.map(playlist => (
                    <Playlist playlist={playlist} key={playlist.id} choosePlaylist={choosePlaylist} />
                ))}
            </div>
            <div>
                <Personality accessToken={accessToken} playlist={chosenPlaylist} />
            </div>
        </Container>
    );
}