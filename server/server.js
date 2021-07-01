require('dotenv').config();
const axios = require('axios');
const cors = require('cors');
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');

const {getGenres, getProbs} = require('./crawler');

const app = express();
app.use(cors())
.use(express.json());

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
    const limit = req.query.limit;
    const offset = req.query.offset;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getUserPlaylists(userId, {
        limit: limit,
        offset: offset
    })
    .then(data => {
        const playlists = [];
        data.body.items.map(item => {
            const playlist = {
                description: item.description,
                id: item.id,
                name: item.name,
                tracks: item.tracks,
                uri: item.uri
            }

            smallestPlaylistImage = smallestImage(item);
            if (smallestPlaylistImage) playlist.imageUrl = smallestPlaylistImage.url;
            
            playlists.push(playlist)
        });

        res.json({
            playlists: playlists,
            total: data.body.total
        });
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

app.get('/personality', (req, res) => {
    const accessToken = req.query.accessToken;
    const playlistId = req.query.playlistId;

    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getPlaylist(playlistId)
    .then(data => {
        const tracks = data.body.tracks.items;
        const artists = [];
        tracks.forEach(track => {
            track.track.artists.forEach(artist => {
                artists.push(artist.id);
            });
        });

        const userGenres = [];
        const promiseGenres = [];
        artists.forEach(artist => {
            promiseGenres.push(
                spotifyApi.getArtist(artist)
                .then(data => {
                    userGenres.push(...data.body.genres)
                })
                .catch(err => {
                    console.log(err);
                })
            );
        });

        Promise.all(promiseGenres)
        .then(() => {
            Promise.all([getGenres(), getProbs()])
            .then(result => {
                const [genres, probs] = result;
                const user = {
                    extraverted: 0,
                    observant: 0,
                    feeling: 0,
                    prospecting: 0,
                    turbulent: 0
                };

                const lenSubgenres = userGenres.length;
                userGenres.forEach(subgenre => {
                    genres.every(genre => {
                        if (genre.subgenres.includes(subgenre)) {
                            for (const trait in probs.traits) {
                                user[trait] += probs.personality[genre.name][trait] / lenSubgenres;
                            }
                            return false;
                        }
                        return true;
                    });
                });

                let type = "";

                if (user.extraverted > 0.5 || (user.extraverted === 0.5 && probs.traits.extraverted >= 0.5)) {
                    type += "E";
                } else {
                    type += "I";
                }

                if (user.observant > 0.5 || (user.observant === 0.5 && probs.traits.observant >= 0.5)) {
                    type += "S";
                } else {
                    type += "N"
                }

                if (user.feeling > 0.5 || (user.feeling === 0.5 && probs.traits.feeling >= 0.5)) {
                    type += "F";
                } else {
                    type += "T";
                }

                if (user.prospecting > 0.5 || (user.prospecting === 0.5 && probs.traits.prospecting >= 0.5)) {
                    type += "P";
                } else {
                    type += "J";
                }

                let identity = "";

                if (user.turbulent > 0.5 || (user.turbulent === 0.5 && probs.traits.turbulent >= 0.5)) {
                    identity = "T";
                } else {
                    identity = "A";
                }

                res.json({
                    type: type,
                    identity: identity
                });
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
});

app.listen(3001);