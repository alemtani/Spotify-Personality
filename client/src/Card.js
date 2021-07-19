export default function Card({ playlist, choosePlaylist }) {
    function handleAnalysis() {
        choosePlaylist(playlist);
    }

    return (
        <div className="d-flex m-2 align-items-center card" onClick={handleAnalysis}>
            {playlist.imageUrl && (
                <img className='sm-img' src={playlist.imageUrl} alt="Playlist" />
            )}
            <div className="ml-3">
                <div>{playlist.name}</div>
                <div className="text-muted">{playlist.description}</div>
            </div>
        </div>
    )
}