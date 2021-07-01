import React from 'react';

export default function Profile({ profile }) {
    return (
        <div className="d-flex m-2 align-items-center">
            {profile.imageUrl && (
                <img src={profile.imageUrl} alt='Profile' style={{height: '128px', width: '128px'}} />
            )}
            <div className="ml-3">
                <div>{profile.displayName}</div>
                <div className="text-muted">Profile</div>
            </div>
        </div>
    )
}