import React from 'react';
import './Playlist.css';
import TrackList from '../TrackList/TrackList';

function Playlist({ name, tracks, onRemove, onNameChange, onSave }) {
  const handleNameChange = (e) => onNameChange(e.target.value);
  return (
    <div className="Playlist">
      <input value={name} onChange={handleNameChange} />
      <TrackList tracks={tracks} onRemove={onRemove} isRemoval={true} />
      <button className="Playlist-save" onClick={onSave}>SAVE TO SPOTIFY</button>
    </div>
  );
}
export default Playlist;
