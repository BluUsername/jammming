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
  const { playlistName = 'New Playlist', playlistTracks = [] } = this.props;
    return (
      <div className="Playlist">
        <input
          id="playlist-name"
          name="playlistName"
          defaultValue={playlistName}
          onChange={this.handleNameChange}
          aria-label="Playlist name"
        />
    <TrackList tracks={playlistTracks} onRemove={this.props.onRemove} isRemoval={true} />
  <button className="Playlist-save" onClick={this.props.onSave}>SAVE TO SPOTIFY</button>
      </div>
    );
  }
}

export default Playlist;
