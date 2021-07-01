import { useState, useEffect } from 'react';
import axios from "axios";

export default function Personality({ accessToken, playlist }) {
    const [personality, setPersonality] = useState(null);

    useEffect(() => {
        if (!accessToken || !playlist) return setPersonality(null);
        const playlistId = playlist.id;
        axios.get('http://localhost:3001/personality', {
            params: {
                accessToken: accessToken,
                playlistId: playlistId
            }
        })
        .then(res => {
            setPersonality({...res.data});
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
    }, [accessToken, playlist])

    if (!playlist || !personality) return null;
    return (
        <div>
            {personality.type}-{personality.identity}
        </div>
    )
}