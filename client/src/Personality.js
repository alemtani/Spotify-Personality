import { useState, useEffect } from 'react';
import _axios from 'axios';
import axiosRetry from 'axios-retry';
import {
    Link,
    Redirect
  } from 'react-router-dom';

const axios = _axios.create();

axiosRetry(axios, {
    retries: Infinity, 
    retryDelay: () => {
        console.log('Retrying');
        return 2000;
    }});

export default function Personality({ accessToken, tracks }) {
    const [personalityType, setPersonalityType] = useState('');
    const [personalityIdentity, setPersonalityIdentity] = useState('');
    const [redoAnalysis, setRedoAnalysis] = useState(false);

    function normalize(distribution) {
        for (const variable in distribution) {
            const total = distribution[variable].true + distribution[variable].false;
            distribution[variable].true /= total;
            distribution[variable].false /= total;
        }
    }

    function updatePersonality(current, update, length) {
        for (const trait in current) {
            current[trait].true += update[trait].true / length;
            current[trait].false += update[trait].false / length;
        }
    }

    function handleRedoAnalysis() {
        setRedoAnalysis(true);
    }

    useEffect(() => {
        if (!accessToken || !tracks) return;

        const personality = {
            extraverted: {
                true: 0,
                false: 0
            },
            observant: {
                true: 0,
                false: 0
            },
            feeling: {
                true: 0,
                false: 0
            },
            prospecting: {
                true: 0,
                false: 0
            },
            turbulent: {
                true: 0,
                false: 0
            }
        };

        const axiosReqs = [];
        const lenTracks = tracks.length;
        tracks.forEach(track => {
            axiosReqs.push(
                axios.post('http://localhost:3001/personality', {
                    accessToken: accessToken,
                    artists: track.artists
                })
            );
        });

        axios.all(axiosReqs)
        .then(axios.spread((...responses) => {
            console.log('Finished requests');
            responses.forEach(res => {
                updatePersonality(personality, res.data, lenTracks);
            });

            normalize(personality);

            let type = "";

            if (personality.extraverted.true > personality.extraverted.false) {
                type += "E";
            } else if (personality.extraverted.true < personality.extraverted.false) {
                type += "I";
            } else {
                type += "X";
            }

            if (personality.observant.true > personality.observant.false) {
                type += "S";
            } else if (personality.observant.true < personality.observant.false) {
                type += "N"
            } else {
                type += "X";
            }

            if (personality.feeling.true > personality.feeling.false) {
                type += "F";
            } else if (personality.feeling.true < personality.feeling.false) {
                type += "T";
            } else {
                type += "X";
            }

            if (personality.prospecting.true > personality.prospecting.false) {
                type += "P";
            } else if (personality.prospecting.true < personality.prospecting.false) {
                type += "J";
            } else {
                type += "X";
            }

            let identity = "";

            if (personality.turbulent.true > personality.turbulent.false) {
                identity = "T";
            } else if (personality.turbulent.true < personality.turbulent.false) {
                identity = "A";
            } else {
                type += "X";
            }

            setPersonalityType(type);
            setPersonalityIdentity(identity);
        }))
        .catch(errors => {
            console.log(errors);
            throw errors[0];
        });
    }, [accessToken, tracks])

    if (!personalityType || !personalityIdentity) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    if (redoAnalysis) {
        return (
            <Redirect to="/" />
        )
    }

    return (
        <div>
            <h1>{personalityType}-{personalityIdentity}</h1>
            <Link to={`${personalityType}/personality`}>Click Here for more information</Link>
            <p className="text-muted">If you get any type=X, it means your trait is ambivalent.</p>
            <button onClick={handleRedoAnalysis}>Try Again</button>
        </div>
    )
}