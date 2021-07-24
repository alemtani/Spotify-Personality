# Spotify Personality
Determine your personality type based on your playlist

## Final Website URL
https://spotify-personality-test.herokuapp.com/

### Disclaimer: If you want to use this site email me alemtani@gmail.com. It will not work properly because I have to manually add users for this developmental site.

## Getting Started for Local Development
### Requirements
1. Set up a [Spotify for Developers](https://developer.spotify.com/) account.
2. Build an app and copy the following:
    - Client ID
    - Client Secret
    - Redirect URI (your choice)

### Setup
1. Clone or download this repository
2. Run `npm install` under both the `client` and `server`
3. In your project folder, `cd` to `server`
4. Run `npm run devStart` to start the backend server
5. Open a separate terminal in the project root and `cd` to `client`
6. Run `npm start` to run the React app and open the application in a new tab

## Using the Application
1. Log In with Spotify
2. You will be redirected to the home page and can choose to select or create a playlist
    - Select Playlist
        - You will be redirected to the Dashboard page, consisting of a list of playlists
        - Choose a playlist and the list of songs will load. You can add or remove additional songs if necessary.
    - Create Playlist
        - You will have a new playlist called "My Playlist" with zero songs, which will be saved in your Spotify account for future reference
        - Add songs using the search tool
3. Click "Analyze" to load your personality type for the playlist
4. Once you get your personality, you have the option to read more or try again with a different playlist

## Notes
- Sometimes when you authenticate with Spotify, you may get stuck on the `/login` page. You may have to wait until Spotify or its API gets their server(s) running again (rip).

## Sources
- [Spotify for Developers](https://developer.spotify.com/)
- [Every Noise at Once](https://everynoise.com/)
- [16Personalities](https://www.16personalities.com/)
- [How To Build A Better Spotify With React](https://www.youtube.com/watch?v=Xcet6msf3eE)
- [How To Use Promise Throttle](https://github.com/JMPerez/spotify-dedup/blob/b6091581e3700ccbb1e5a0e26dbb59422fa3d15f/app/scripts/main.js#L80)
- [Authorization Code - State](https://github.com/spotify/web-api-auth-examples)
- [React with Node Backend - Deployment](https://www.freecodecamp.org/news/how-to-create-a-react-app-with-a-node-backend-the-complete-guide/)
