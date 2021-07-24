import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useAuth(code) {
    const [accessToken, setAccessToken] = useState();
    const [refreshToken, setRefreshToken] = useState();
    const [expiresIn, setExpiresIn] = useState();

    useEffect(() => {
        if (!code) return;
        axios.post('/api/login', {
            code,
        })
        .then(res => {
            setAccessToken(res.data.accessToken);
            setRefreshToken(res.data.refreshToken);
            setExpiresIn(res.data.expiresIn);
            window.history.pushState({}, null, '/');
        })
        .catch(() => {
            window.location = '/';
        });
    }, [code]);

    // Make sure to update the access token when expires to allow running
    useEffect(() => {
        if (!refreshToken || !expiresIn) return;
        const interval = setInterval(() => {
            axios.post('/api/refresh', {
                refreshToken
            })
            .then(res => {
                setAccessToken(res.data.accessToken);
                setExpiresIn(res.data.expiresIn);
                window.history.pushState({}, null, '/');
            })
            .catch(() => {
                window.location = '/';
            });
        }, (expiresIn - 60) * 1000);

        return () => clearInterval(interval);
    }, [refreshToken, expiresIn]);

    return accessToken;
}