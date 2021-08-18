require('dotenv').config();
const cors = require('cors');
const express = require('express');
const path = require('path');
const Queue = require('bull');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(express.json());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

const PORT = process.env.PORT || 3001;

let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let workQueue = new Queue('work', REDIS_URL);

let genres, probs = null;

workQueue.empty();
workQueue.add();

let progress = 0;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

const smallestImage = obj => {
    if (!obj.images || !Array.isArray(obj.images) || obj.images.length === 0) return null;
    return obj.images.reduce((smallest, image) => {
        if (!image.height) return smallest;
        if (!smallest.height || image.height < smallest.height) return image;
        return smallest;
    }, obj.images[0]);
}

// Given response body, will generate necessary data back to client
const getPlaylist = playlist => {
    const data = {
        description: playlist.description,
        id: playlist.id,
        name: playlist.name,
        uri: playlist.uri
    };

    if (playlist.description) data.description = playlist.description;

    smallestPlaylistImage = smallestImage(playlist);
    if (smallestPlaylistImage) data.imageUrl = smallestPlaylistImage.url;

    return data;
}

const pushTracks = (tracks, track) => {
    const data = {
        album: track.album.name,
        artists: track.artists,
        id: track.id,
        name: track.name,
        uri: track.uri
    }

    smallestTrackImage = smallestImage(track.album);
    if (smallestTrackImage) data.imageUrl = smallestTrackImage.url;

    tracks.push(data);
}

const asyncTimeout = async (timeout) => {
    setTimeout(() => {}, timeout);
}

workQueue.on('global:progress', (jobId, jobProgress) => {
    progress = jobProgress;
})

workQueue.on('global:completed', (jobId, result)  => {
    [genres, probs] = JSON.parse(result);

    workQueue.getJob(jobId)
    .then(job => {
        job.remove();
    })
    .catch(err => {
        throw err;
    });
});

// Watch out for 429 errors and automatically retry

const getPlaylists = async (userId, offset) => {
    try {
        const data = await spotifyApi.getUserPlaylists(userId, {
            offset: offset
        });
        return data;
    } catch (err) {
        if (err.headers && err.headers['retry-after']) {
            await asyncTimeout(parseInt(err.headers['retry-after']) * 1000);
            return getPlaylists(userId, offset);
        }
        throw err;
    }
}

const getTracks = async (playlistId, offset) => {
    try {
        const data = await spotifyApi.getPlaylistTracks(playlistId, {
            offset: offset
        });
        return data;
    } catch (err) {
        if (err.headers && err.headers['retry-after']) {
            await asyncTimeout(parseInt(err.headers['retry-after']) * 1000);
            return getTracks(playlistId, offset);
        }
        throw err;
    }
}

const getArtists = async (artistIds) => {
    try {
        const data = await spotifyApi.getArtists(artistIds);
        return data;
    } catch (err) {
        if (err.headers && err.headers['retry-after']) {
            await asyncTimeout(parseInt(err.headers['retry-after']) * 1000);
            return getArtists(artistIds);
        }
        throw err;
    }
}

// If individual variate distributions don't add to 1, make them
const normalize = (distribution) => {
    for (const variable in distribution) {
        const total = distribution[variable].true + distribution[variable].false;
        distribution[variable].true /= total;
        distribution[variable].false /= total;
    }
}

// Use Spotify authentication for logging in
app.get('/api/login', (req, res) => {
    const scopes = ['user-read-email', 'user-read-private', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-private', 'playlist-read-collaborative'];
    const state = generateRandomString(16);
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.json({authorizeURL});
});

// After retrieving code, post in Spotify API to get access token for API
app.post('/api/login', (req, res) => {
    const code = req.body.code;

    spotifyApi.authorizationCodeGrant(code)
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

// When refreshing token is necessary
app.post('/api/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken;

    const refreshSpotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
        refreshToken
    });

    refreshSpotifyApi.refreshAccessToken()
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

app.get('/api/profile', (req, res) => {
    const accessToken = req.query.accessToken;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getMe()
    .then(data => {
        const body = data.body;
        const profile = {
            displayName: body.display_name,
            id: body.id,
            uri: body.uri,
        };

        smallestProfileImage = smallestImage(body);
        if (smallestProfileImage) profile.imageUrl = smallestProfileImage.url;

        res.json(profile);
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

app.get('/api/playlists', (req, res) => {
    const accessToken = req.query.accessToken;
    const userId = req.query.userId;
    const offset = req.query.offset;

    spotifyApi.setAccessToken(accessToken);

    getPlaylists(userId, offset)
    .then(data => {
        res.json({
            playlists: data.body.items.map(item => getPlaylist(item)),
            limit: data.body.limit,
            total: data.body.total
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

// For creating a new playlist
app.post('/api/playlists', (req, res) => {
    const accessToken = req.body.accessToken;
    const name = req.body.name;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.createPlaylist(name)
    .then(data => {
        res.json(getPlaylist(data.body));
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

app.get('/api/playlists/:playlist_id', (req, res) => {
    const playlistId = req.params.playlist_id;

    const accessToken = req.query.accessToken;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getPlaylist(playlistId)
    .then(data => {
        res.json({
            playlist: getPlaylist(data.body),
            snapshotId: data.body.snapshot_id
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
})

app.get('/api/playlists/:playlist_id/tracks', (req, res) => {
    const playlistId = req.params.playlist_id;

    const accessToken = req.query.accessToken;
    const offset = req.query.offset;

    spotifyApi.setAccessToken(accessToken);

    getTracks(playlistId, offset)
    .then(data => {
        const tracks = [];

        data.body.items.forEach(item => {
            item.track && pushTracks(tracks, item.track);
        });
        
        res.json({
            tracks: tracks,
            limit: data.body.limit,
            total: data.body.total
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

app.post('/api/playlists/:playlist_id/tracks', (req, res) => {
    const playlistId = req.params.playlist_id;

    const accessToken = req.body.accessToken;
    const trackUri = req.body.trackUri;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.addTracksToPlaylist(playlistId, [trackUri])
    .then(data => {
        res.json({
            snapshotId: data.body.snapshot_id
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
});

app.delete('/api/playlists/:playlist_id/tracks', (req, res) => {
    const playlistId = req.params.playlist_id;

    const accessToken = req.body.accessToken;
    const position = req.body.position;
    const snapshotId = req.body.snapshotId;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.removeTracksFromPlaylistByPosition(playlistId, [position], snapshotId)
    .then(data => {
        res.json({
            snapshotId: data.body.snapshot_id
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    });
})

app.get('/api/search', (req, res) => {
    const accessToken = req.query.accessToken;
    const search = req.query.search;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.searchTracks(search)
    .then(data => {
        const tracks = [];

        data.body.tracks.items.forEach(item => {
            pushTracks(tracks, item);
        });
        
        res.json({
            tracks: tracks
        });
    })
    .catch(err => {
        res.sendStatus(err.statusCode || 500);
    })
})

// This will calculate the personality distribution (% one trait vs. complement) given 50 tracks and 50 artists
app.post('/api/personality', async (req, res) => {
    const accessToken = req.body.accessToken;
    const tracks = req.body.tracks;

    spotifyApi.setAccessToken(accessToken);

    if (genres && probs) {
        const artistIds = tracks.map(track => track.artists[0].id).filter(id => {
            if (!id) return false;
            return true;
        })
    
        // Used artist IDs to get the corresponding genres for each
        getArtists(artistIds)
        .then(data => {
            const user = {
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
    
            const artists = data.body.artists;
            artists.forEach(artist => {
                artist.genres.forEach(artistGenre => {
                    // Will see if can find the artist genre in one of the "subgeneres" from the scraped "genres" object
                    let foundMatch = false;
    
                    genres.every(genre => {
                        genre.subgenres.every(subgenre => {
                            if (subgenre == artistGenre) {
                                foundMatch = true;
                                for (const trait in probs.traits) {
                                    user[trait].true += probs.personality[genre.name][trait] / artists.length / artist.genres.length;
                                    user[trait].false += (1 - probs.personality[genre.name][trait]) / artists.length / artist.genres.length;
                                }
                            }
                            return !foundMatch;
                        });
                        return !foundMatch;
                    });
    
                    // If genre was not found, use default distribution
                    if (!foundMatch) {
                        for (const trait in probs.traits) {
                            user[trait].true += probs.traits[trait] / artists.length / artist.genres.length;
                            user[trait].false += (1 - probs.traits[trait]) / artists.length / artist.genres.length;
                        }
                    }
                });
            });
    
            normalize(user);
            res.json(user);
        })
        .catch(err => {
            res.sendStatus(err.statusCode || 500);
        });
    } else {
        res.json({message: `Still loading data at ${progress}% progress`});
    }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT);