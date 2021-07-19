export default function Track({ track, position, addTrack, removeTrack }) {
    const artists = track.artists.map(artist => artist.name).join(', ');

    function handleAdd() {
        addTrack(track);
    }

    function handleRemove() {
        removeTrack(position - 1);
    }

    return (
        <div className="d-flex m-2 align-items-center">
            {track.imageUrl && (
                <img src={track.imageUrl} alt='Track' className="sm-img" />
            )}
            <div className="ml-3">
                <div>{position}</div>
                <div>{track.name}</div>
                <div>{artists}</div>
                <div>{track.album}</div>
                {addTrack && (
                    <button onClick={handleAdd}>
                        Add
                    </button>
                )}
                {removeTrack && (
                    <button onClick={handleRemove}>
                        Remove
                    </button>
                )}
            </div>
        </div>
    )
}