# Spotify-Personality
Determine your personality type based on your playlist

## WORK IN PROGRESS
I have decided to public a beta release of my application on GitHub. It will return a personality type based on a selected playlist.

## Getting Started for Development
1. Clone or download this repository
2. In your project folder, `cd` to `server`
3. Run `npm run devStart` to start the backend server
4. Open a separate terminal in the project root and `cd` to `client`
5. Run `npm start` to run the React app and open the application in a new tab

## Using the Application
1. Log In with Spotify
2. After a few seconds, you will see your Spotify profile and a list of your playlists
3. Click on a playlist and wait for around a minute or two (try not to click on additional playlists during this time)
4. Scroll to the bottom of the page (outermost scrollbar) to see your personality type (e.g. `ENFP-A`)

## Notes
- Ignore the `Log Out` at the bottom. It doesn't do anything yet.
- Sometimes when you authenticate with Spotify, the server crashes. You may have to wait until Spotify gets their server running again (rip).
- When you click on a playlist, you may get a `429` error.
    1. Always check the terminal running your backend (i.e. in `server`) after clicking on the playlist.
    2. If you get an error, check the `'retry-after'` property under `headers` in the error message. Wait that long (in seconds) and click on the playlist again.
