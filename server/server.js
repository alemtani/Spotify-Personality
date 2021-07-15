require('dotenv').config();
const cors = require('cors');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const {getGenres, getProbs} = require('./crawler');

let genres, probs = null;

let timer = 0;

const app = express();
app.use(cors());
app.use(express.json());

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

const smallestImage = obj => {
    if (!obj.images || !Array.isArray(obj.images) || obj.images.length === 0) return null;
    return obj.images.reduce((smallest, image) => {
        if (!image.height) return smallest;
        if (!smallest.height || image.height < smallest.height) return image;
        return smallest;
    }, obj.images[0]);
}

const getPlaylist = (playlist) => {
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

setInterval(() => {
    console.log(timer);
    timer++;
}, 1000);

const getArtist = async (artistId) => {
    try {
        const data = await spotifyApi.getArtist(artistId);
        return data;
    } catch (err) {
        if (err.headers && err.headers['retry-after']) {
            await asyncTimeout(parseInt(err.headers['retry-after']) * 1000);
            return getArtist(artistId);
        }
        console.log(err);
        throw err;
    }
}

app.get('/login', (req, res) => {
    const scopes = 'user-read-email user-read-private playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + process.env.CLIENT_ID +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URI) +
        '&show_dialog=false');
});

app.post('/login', (req, res) => {
    const code = req.body.code;

    spotifyApi.authorizationCodeGrant(code)
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        });
    }).catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

app.post('/refresh', (req, res) => {
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
        console.log(err);
        res.sendStatus(400);
    });
});

app.get('/profile', (req, res) => {
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
        console.log(err);
        res.sendStatus(400);
    });
});

app.get('/playlists', (req, res) => {
    const accessToken = req.query.accessToken;
    const userId = req.query.userId;
    const offset = req.query.offset;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getUserPlaylists(userId, {
        offset: offset
    })
    .then(data => {
        res.json({
            playlists: data.body.items.map(item => getPlaylist(item)),
            limit: data.body.limit,
            total: data.body.total
        });
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

app.post('/playlists', (req, res) => {
    const accessToken = req.body.accessToken;
    const name = req.body.name;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.createPlaylist(name)
    .then(data => {
        console.log(data.body);
        res.json(getPlaylist(data.body));
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    })
});

app.get('/playlists/:playlist_id', (req, res) => {
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
        console.log(err);
        res.sendStatus(400);
    });
})

app.get('/playlists/:playlist_id/tracks', (req, res) => {
    const playlistId = req.params.playlist_id;

    const accessToken = req.query.accessToken;
    const offset = req.query.offset;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getPlaylistTracks(playlistId, {
        offset: offset
    })
    .then(data => {
        const tracks = [];

        data.body.items.forEach(item => {
            pushTracks(tracks, item.track);
        });
        
        res.json({
            tracks: tracks,
            limit: data.body.limit,
            total: data.body.total
        });
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

app.post('/playlists/:playlist_id/tracks', (req, res) => {
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
        console.log(err);
        res.sendStatus(400);
    });
});

app.delete('/playlists/:playlist_id/tracks', (req, res) => {
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
        console.log(err);
        res.sendStatus(400);
    });
})

app.get('/search', (req, res) => {
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
        console.log(err);
        res.sendStatus(400);
    })
})

app.post('/personality', async (req, res) => {
    const accessToken = req.body.accessToken;
    const artists = req.body.artists;

    spotifyApi.setAccessToken(accessToken);

    if (!genres || !probs || timer > 86400) {
        timer = 0;
        genres = getGenres();
        probs = getProbs();
    } else {
        genres = Promise.resolve(genres);
        probs = Promise.resolve(probs);
    }

    await Promise.all([genres, probs])
    .then(result => {
        [genres, probs] = result
    });
    const userGenres = [];
    const promiseArtists = [];

    artists.forEach(artist => {
        promiseArtists.push(
            getArtist(artist.id)
            .then(data => {
                const artistMainGenre = data.body.genres.reduce((mainGenre, artistGenre) => {
                    genres.every(genre => {
                        let isGenre = false;
                        genre.subgenres.every(subgenre => {
                            if (subgenre.name === artistGenre) {
                                if (!mainGenre || subgenre.distance < mainGenre.distance) {
                                    mainGenre = {...subgenre, main: genre.name};
                                }
                                isGenre = true;
                                return false;
                            }
                            return true;
                        });
                        return !isGenre;
                    });
                    return mainGenre;
                }, null);
                userGenres.push(artistMainGenre);
            })
            .catch(err => {
                console.log(err);
            })
        );
    });

    Promise.all(promiseArtists)
    .then(() => {
        const user = {
            extraverted: 0,
            observant: 0,
            feeling: 0,
            prospecting: 0,
            turbulent: 0
        };

        const lenGenres = userGenres.length;
        console.log(lenGenres);
        userGenres.forEach(genre => {
            for (const trait in probs.traits) {
                if (!genre) {
                    user[trait] += probs.traits[trait] / lenGenres;
                } else {
                    user[trait] += probs.personality[genre.main][trait] / lenGenres;
                }
            }
            console.log(user);
        });

        res.json(user);
    })
    .catch(err => {
        console.log(err);
    });
});

app.listen(3001);