# Spotify-Personality
Determine your personality type based on your playlist

## WORK IN PROGRESS
I have decided to public a beta release of my application on GitHub. It will return a personality type based on a selected playlist.

## Getting Started for Development
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
- Sometimes when you authenticate with Spotify, you may be stuck on the `/login` page. You may have to wait until Spotify or its API gets their server(s) running again (rip).
