import React from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchResults: [],
			playlistName: 'New Playlist',
			playlistTracks: []
		};
		this.search = this.search.bind(this);
		this.addTrack = this.addTrack.bind(this);
		this.removeTrack = this.removeTrack.bind(this);
		this.updatePlaylistName = this.updatePlaylistName.bind(this);
		this.savePlaylist = this.savePlaylist.bind(this);
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
		const trackURIs = this.state.playlistTracks.map(t => t.uri);
		Spotify.savePlaylist(this.state.playlistName, trackURIs)
			.then(() => {
				// Clear the current playlist after a successful save so the user can start a new one
				this.setState({ playlistName: 'New Playlist', playlistTracks: [] });
			});
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
						<footer style={{marginTop: '24px', padding: '16px', textAlign: 'center', color: '#bbb', fontSize: '0.9rem'}}>
							<span>Created by Tom Herman</span>
							{' '}•{' '}
							<a href="mailto:iamtomherman@gmail.com" style={{color:'#9be15d'}}>Contact</a>
							{' '}
							<span style={{color:'#666'}}>|</span>
							{' '}
							<a href="https://github.com/BluUsername" target="_blank" rel="noreferrer" style={{color:'#9be15d'}}>Github</a>
						</footer>
				</div>
			</div>
		);
	}
}

export default App;
