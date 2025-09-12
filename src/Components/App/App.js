import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

// Temporary mock search data (will be replaced with Spotify API)
const mockSearch = (term) => {
	const base = [
		{ id: '1', name: 'Song One', artist: 'Artist A', album: 'Album X', uri: 'spotify:track:1' },
		{ id: '2', name: 'Song Two', artist: 'Artist B', album: 'Album Y', uri: 'spotify:track:2' },
		{ id: '3', name: 'Another Track', artist: 'Artist A', album: 'Album X', uri: 'spotify:track:3' },
		{ id: '4', name: 'Last Song', artist: 'Artist C', album: 'Album Z', uri: 'spotify:track:4' }
	];
	const lower = term.toLowerCase();
	return base.filter(t =>
		t.name.toLowerCase().includes(lower) ||
		t.artist.toLowerCase().includes(lower) ||
		t.album.toLowerCase().includes(lower)
	);
};

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// Hard-coded initial search results (will be replaced by real Spotify data later)
			searchResults: [
				{ id: '101', name: 'Sample Track One', artist: 'Sample Artist A', album: 'Sample Album X', uri: 'spotify:track:101' },
				{ id: '102', name: 'Sample Track Two', artist: 'Sample Artist B', album: 'Sample Album Y', uri: 'spotify:track:102' },
				{ id: '103', name: 'Example Song', artist: 'Demo Artist', album: 'Collection Z', uri: 'spotify:track:103' }
			],
			playlistName: 'My Starter Playlist',
			// Hard-coded initial playlist tracks
			playlistTracks: [
				{ id: '201', name: 'Starter Song A', artist: 'Playlist Artist 1', album: 'Playlist Album 1', uri: 'spotify:track:201' },
				{ id: '202', name: 'Starter Song B', artist: 'Playlist Artist 2', album: 'Playlist Album 2', uri: 'spotify:track:202' }
			]
		};
		this.handleSearch = this.handleSearch.bind(this);
		this.search = this.search.bind(this);
		this.addTrack = this.addTrack.bind(this);
		this.removeTrack = this.removeTrack.bind(this);
		this.updatePlaylistName = this.updatePlaylistName.bind(this);
		this.savePlaylist = this.savePlaylist.bind(this);
	}

	handleSearch(term) {
		const results = mockSearch(term);
		const playlistIds = new Set(this.state.playlistTracks.map(t => t.id));
		this.setState({ searchResults: results.filter(r => !playlistIds.has(r.id)) });
	}

	// Search via Spotify API utility
	search(term) {
		if (!term) return;
		console.log('Search term entered:', term);
		Spotify.search(term).then(tracks => this.setState({ searchResults: tracks || [] }));
	}

	addTrack(track) {
		if (this.state.playlistTracks.find(t => t.id === track.id)) return;
		this.setState(prev => ({
			playlistTracks: [...prev.playlistTracks, track],
			searchResults: prev.searchResults.filter(t => t.id !== track.id)
		}));
	}

	removeTrack(track) {
		this.setState(prev => ({
			playlistTracks: prev.playlistTracks.filter(t => t.id !== track.id)
		}));
	}

	updatePlaylistName(name) { this.setState({ playlistName: name }); }

	savePlaylist() {
		// Collect track URIs per curriculum requirement
		const trackURIs = this.state.playlistTracks.map(t => t.uri);
		console.log('Saving playlist (placeholder):', this.state.playlistName, trackURIs);
		// Reset only playlist name & tracks (search results remain for continued browsing)
		this.setState({ playlistName: 'New Playlist', playlistTracks: [] });
	}

	render() {
		return (
			<div>
				<h1>Ja<span className="highlight">mmm</span>ing</h1>
				<div className="App">
					<SearchBar onSearch={this.search} />
					<div className="App-playlist">
						<SearchResults
							results={this.state.searchResults}
							onAdd={this.addTrack}
						/>
						<Playlist
							playlistName={this.state.playlistName}
							playlistTracks={this.state.playlistTracks}
							onRemove={this.removeTrack}
							onNameChange={this.updatePlaylistName}
							onSave={this.savePlaylist}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
