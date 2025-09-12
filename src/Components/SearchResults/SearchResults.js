import React from 'react';
import './SearchResults.css';
import TrackList from '../TrackList/TrackList';

class SearchResults extends React.Component {
	render() {
		const { results = [], onAdd } = this.props;
		return (
			<div className="SearchResults">
				<h2>Results</h2>
				{/* Track list */}
				<TrackList tracks={results} onAdd={onAdd} isRemoval={false} />
			</div>
		);
	}
}

export default SearchResults;

