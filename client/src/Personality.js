import { useState, useEffect } from 'react';
import Error from './Error';
import Loading from './Loading';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as rax from 'retry-axios';
import {
    Redirect
  } from 'react-router-dom';
import { 
    Button,
    Container
} from 'react-bootstrap';

// axiosRetry(axios, {
//     retries: Infinity, 
//     retryDelay: () => {
//         console.log('Retrying');
//         return 2000;
//     }});

const interceptorId = rax.attach();

export default function Personality({ accessToken, tracks }) {
    const [isErr, setIsErr] = useState(false);
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
                    artists: track.artists,
                    raxConfig: {
                        // Retry 3 times on requests that return a response (500, etc) before giving up.  Defaults to 3.
                        retry: 3,
                    
                        // Retry twice on errors that don't return a response (ENOTFOUND, ETIMEDOUT, etc).
                        noResponseRetries: Infinity,
                    
                        // Milliseconds to delay at first.  Defaults to 100. Only considered when backoffType is 'static' 
                        retryDelay: 100,
                    
                        // HTTP methods to automatically retry.  Defaults to:
                        // ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']
                        httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'],
                    
                        // The response status codes to retry.  Supports a double
                        // array with a list of ranges.  Defaults to:
                        // [[100, 199], [429, 429], [500, 599]]
                        statusCodesToRetry: [[100, 199], [429, 429], [500, 599]],
                    
                        // You can set the backoff type.
                        // options are 'exponential' (default), 'static' or 'linear'
                        backoffType: 'exponential',
                    
                        // You can detect when a retry is happening, and figure out how many
                        // retry attempts have been made
                        onRetryAttempt: err => {
                            const cfg = rax.getConfig(err);
                            console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                        }
                    }
                })
            );
        });

        axios.all(axiosReqs)
        .then(axios.spread((...responses) => {
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

            console.log(personality);

            setPersonalityType(type);
            setPersonalityIdentity(identity);
        }))
        .catch(errors => {
            console.log(errors);
            setIsErr(true);
        });
    }, [accessToken, tracks])

    if (isErr) {
        return <Error />;
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
                <a href={`https://16personalities.com/${personalityType}/-personality`} className="personality">
                    {personalityType}-{personalityIdentity}
                </a>
                <div className="text-muted">
                    *X=Ambivalent*
                </div>
                <Button variant="warning" onClick={handleRedoAnalysis}>
                    Try Again
                </Button>
            </div>
        </Container>
    )
}