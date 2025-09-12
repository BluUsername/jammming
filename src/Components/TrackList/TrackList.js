import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends React.Component {
  render() {
    const { tracks = [], onAdd, onRemove, isRemoval } = this.props;
    return (
      <div className="TrackList">
        {tracks.map(t => (
          <Track key={t.id} track={t} onAdd={onAdd} onRemove={onRemove} isRemoval={isRemoval} />
        ))}
      </div>
    );
  }
}

export default TrackList;
