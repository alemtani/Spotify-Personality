import { useState, useEffect } from 'react';
import Error from './Error';
import Loading from './Loading';
import axios from 'axios';
import { Container } from 'react-bootstrap';

export default function Profile({ accessToken }) {
    const [isErr, setIsErr] = useState(false);
    const [profile, setProfile] = useState(null);

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
            setIsErr(true);
        });
    }, [accessToken]);

    if (isErr) {
        return <Error />;
    }

    if (!profile) {
        return <Loading />;
    }

    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            {profile.imageUrl && (
                <img src={profile.imageUrl} alt='Profile' className="lg-img" />
            )}
            <div className="ml-3">
                <div className="header">{profile.displayName}</div>
                <a className="text-muted profile" href={profile.uri}>Profile</a>
            </div>
        </Container>
    )
}