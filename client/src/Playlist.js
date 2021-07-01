import React from 'react';

export default function Playlist({ playlist, choosePlaylist }) {
    function handleAnalysis() {
        choosePlaylist(playlist);
    }

    return (
        <div className="d-flex m-2 align-items-center" style={{ cursor: "pointer" }} onClick={handleAnalysis}>
            {playlist.imageUrl && (
                <img src={playlist.imageUrl} alt='Playlist' style={{height: '64px', width: '64px'}} />
            )}
            <div className="ml-3">
                <div>{playlist.name}</div>
                <div className="text-muted">{playlist.description}</div>
            </div>
        </div>
    )
}