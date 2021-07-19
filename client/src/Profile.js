import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile({ accessToken }) {
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
            throw err;
        });
    }, [accessToken]);

    if (!profile) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div className="d-flex m-2 align-items-center">
            {profile.imageUrl && (
                <img src={profile.imageUrl} alt='Profile' className="lg-img" />
            )}
            <div className="ml-3">
                <div>{profile.displayName}</div>
                <div className="text-muted">Profile</div>
            </div>
        </div>
    )
}