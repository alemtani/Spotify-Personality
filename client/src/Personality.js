import { useState, useEffect } from 'react';
import Error from './Error';
import Loading from './Loading';
import promiseThrottle from './promiseThrottle';
import axios from 'axios';
import {
    Redirect
  } from 'react-router-dom';
import { 
    Button,
    Container
} from 'react-bootstrap';

export default function Personality({ accessToken, tracks }) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState('');
    const [personalityType, setPersonalityType] = useState('');
    const [personalityIdentity, setPersonalityIdentity] = useState('');
    const [redoAnalysis, setRedoAnalysis] = useState(false);

    // Get probability distribution of personality for given set of tracks
    function createPromise(length, tracks, personality) {
        return axios.post('/api/personality', {
            accessToken: accessToken,
            tracks: tracks
        })
        .then(res => {
            const data = res.data;
            if (data.message) {
                setLoading(data.message);
            } else {
                setLoading(null);
                for (const trait in personality) {
                    personality[trait].true += data[trait].true / length;
                    personality[trait].false += data[trait].false / length;
                }
            }
        })
        .catch(err => {
            setError(err);
        })
    }

    function normalize(distribution) {
        for (const variable in distribution) {
            const total = distribution[variable].true + distribution[variable].false;
            distribution[variable].true /= total;
            distribution[variable].false /= total;
        }
    }

    function handleRedoAnalysis() {
        setRedoAnalysis(true);
    }

    useEffect(() => {
        if (!accessToken || !tracks) return;

        let personality = {
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

        const promises = [];
        for (let i = 0, j = 50; i < tracks.length; i += j) {
            const subset = tracks.slice(i, i + j);
            const promise = promiseThrottle.add(createPromise.bind(this, tracks.length, subset, personality));
            promises.push(promise);
        }

        Promise.all(promises)
        .then(() => {
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
        })
        .catch(err => {
            setError(err);
        });
    }, [accessToken, tracks])

    if (error) {
        return <Error error={error}/>;
    }

    if (loading) {
        return <Loading message={loading} />
    }

    if (!personalityType || !personalityIdentity) {
        return <Loading />;
    }

    if (redoAnalysis) {
        return (
            <Redirect to="/" />
        )
    }

    return (
        <Container className="d-flex justify-content-center align-items-center custom-container">
            <div className="personality-info">
                <a href={`https://16personalities.com/${personalityType}-personality`} className="personality">
                    {personalityType}-{personalityIdentity}*
                </a>
                <div className="text-muted">
                    *X=Ambivalent
                </div>
                <Button variant="warning" onClick={handleRedoAnalysis}>
                    Try Again
                </Button>
            </div>
        </Container>
    )
}