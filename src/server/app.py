import os
import sys
import json
import shutil
from pathlib import Path
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3, APIC
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List
import platform

app = FastAPI()

def get_spotify_local_path():
    """Get the default Spotify local files directory based on OS."""
    system = platform.system()
    home = Path.home()
    
    if system == "Windows":
        return home / "Music" / "Spotify" / "Local Files"
    elif system == "Darwin":  # macOS
        return home / "Music" / "Spotify" / "Local Files"
    else:  # Linux
        return home / ".config" / "spotify" / "Local Files"

class SpotifyLocalManager:
    def __init__(self):
        self.spotify_path = get_spotify_local_path()
        self.spotify_path.mkdir(parents=True, exist_ok=True)
        
    def format_filename(self, artist, title):
        """Format filename to match Spotify's expectations."""
        # Remove characters that might cause issues
        invalid_chars = '<>:"/\\|?*'
        artist = ''.join(c for c in artist if c not in invalid_chars)
        title = ''.join(c for c in title if c not in invalid_chars)
        return f"{artist} - {title}.mp3"

    def prepare_metadata(self, audio, metadata):
        """Set metadata in Spotify-friendly format."""
        if not isinstance(audio, EasyID3):
            audio = EasyID3(audio)
            
        # Spotify expects these specific tags
        audio['title'] = metadata['title']
        audio['artist'] = metadata['artist']
        audio['album'] = metadata['album']
        if 'year' in metadata:
            audio['date'] = metadata['year']
        if 'track_number' in metadata:
            audio['tracknumber'] = str(metadata['track_number'])
        audio['albumartist'] = metadata['artist']  # Spotify uses this for organization
        
        audio.save()
        
        return audio

    async def add_track(self, file: UploadFile, metadata: dict, cover: UploadFile = None):
        """Process and add a track to Spotify local files."""
        filename = self.format_filename(metadata['artist'], metadata['title'])
        file_path = self.spotify_path / filename
        
        # Save the file
        with open(file_path, 'wb') as f:
            contents = await file.read()
            f.write(contents)
        
        # Add metadata
        audio = EasyID3(file_path)
        self.prepare_metadata(audio, metadata)
        
        # Add cover art if provided
        if cover:
            audio = ID3(file_path)
            cover_data = await cover.read()
            audio.add(APIC(
                encoding=3,
                mime='image/jpeg',
                type=3,
                desc='Cover',
                data=cover_data
            ))
            audio.save()
        
        return str(file_path)

spotify_manager = SpotifyLocalManager()

@app.post("/api/tracks")
async def add_track(
    file: UploadFile = File(...),
    cover: UploadFile = None,
    metadata: str = None
):
    try:
        metadata_dict = json.loads(metadata)
        file_path = await spotify_manager.add_track(file, metadata_dict, cover)
        return {
            "status": "success",
            "message": "Track added to Spotify local files",
            "path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify-path")
async def get_path():
    """Get the current Spotify local files path."""
    return {"path": str(get_spotify_local_path())}

@app.get("/api/spotify-status")
async def check_spotify_status():
    """Check Spotify local files setup status."""
    spotify_path = get_spotify_local_path()
    
    return {
        "local_files_enabled": spotify_path.exists(),
        "path_writable": os.access(spotify_path, os.W_OK),
        "path": str(spotify_path),
        "tips": [
            "Enable 'Show Local Files' in Spotify Settings",
            "Add your local files folder in Spotify Settings",
            "Make sure files are in MP3, M4P, M4A, or WAV format",
            "Ensure Spotify has permission to access local files"
        ]
    }