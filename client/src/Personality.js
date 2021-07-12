import { useState, useEffect } from 'react';
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, { ertryDelay: axiosRetry.exponentialDelay });

export default function Personality({ accessToken, tracks }) {
    const [personality, setPersonality] = useState({
        extraverted: 0,
        observant: 0,
        feeling: 0,
        prospecting: 0,
        turbulent: 0
    });
    const [personalityType, setPersonalityType] = useState('');
    const [personalityIdentity, setPersonalityIdentity] = useState('');

    function updatePersonality(current, update, length) {
        for (const trait in current) {
            current[trait] += update[trait] / length;
        }
    }

    useEffect(() => {
        if (!accessToken || !tracks) return;

        setPersonality({
            extraverted: 0,
            observant: 0,
            feeling: 0,
            prospecting: 0,
            turbulent: 0
        });
        setPersonalityType('');
        setPersonalityIdentity('');

        const promiseUsers = [];
        const lenTracks = tracks.length;
        tracks.forEach(track => {
            promiseUsers.push(
                axios.post('http://localhost:3001/personality', {
                    accessToken: accessToken,
                    artists: track.artists
                })
                .then(res => {
                    const current = personality;
                    updatePersonality(current, res.data, lenTracks);
                    setPersonality({...current});
                    console.log(personality);
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                })
            )
        });

        Promise.all(promiseUsers)
        .then(res => {
            let type = "";

            if (personality.extraverted >= 0.5) {
                type += "E";
            } else {
                type += "I";
            }

            if (personality.observant >= 0.5) {
                type += "S";
            } else {
                type += "N"
            }

            if (personality.feeling >= 0.5) {
                type += "F";
            } else {
                type += "T";
            }

            if (personality.prospecting >= 0.5) {
                type += "P";
            } else {
                type += "J";
            }

            setPersonalityType(type);

            let identity = "";

            if (personality.turbulent > 0.5) {
                identity = "T";
            } else {
                identity = "A";
            }

            setPersonalityIdentity(identity);
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
    }, [accessToken, tracks])

    if (!personalityType || !personalityIdentity) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    return (
        <div>
            {personalityType}-{personalityIdentity}
        </div>
    )
}