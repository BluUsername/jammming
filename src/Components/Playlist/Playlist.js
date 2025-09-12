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
    const { name = 'New Playlist', tracks = [], onRemove, onSave } = this.props;
    return (
      <div className="Playlist">
        <input defaultValue={name} onChange={this.handleNameChange} />
        <TrackList tracks={tracks} onRemove={onRemove} isRemoval={true} />
        <button className="Playlist-save" onClick={onSave}>SAVE TO SPOTIFY</button>
      </div>
    );
  }
}

export default Playlist;
