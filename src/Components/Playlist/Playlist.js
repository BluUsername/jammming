import React from 'react';
import './Playlist.css';
import TrackList from '../TrackList/TrackList';

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  handleNameChange(e) {
    if (this.props.onNameChange) this.props.onNameChange(e.target.value);
  }

  render() {
  const { playlistName = 'New Playlist', playlistTracks = [], onSave } = this.props;
    return (
      <div className="Playlist">
        <input defaultValue={playlistName} onChange={this.handleNameChange} />
    <TrackList tracks={playlistTracks} onRemove={this.props.onRemove} isRemoval={true} />
        <button className="Playlist-save" onClick={onSave}>SAVE TO SPOTIFY</button>
      </div>
    );
  }
}

export default Playlist;
