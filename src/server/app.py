import os
import sys
import json
import shutil
from pathlib import Path
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3, APIC, PictureType
from mutagen.mp3 import MP3
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List, Optional
import platform
import mimetypes

app = FastAPI()

def get_spotify_local_path():
    """Get the default Spotify local files directory based on OS."""
    system = platform.system()
    home = Path.home()
    
    if system == "Windows":
        path = home / "Music" / "Spotify" / "Local Files"
    elif system == "Darwin":  # macOS
        path = home / "Music" / "Spotify" / "Local Files"
    else:  # Linux
        path = home / ".config" / "spotify" / "Local Files"
    
    return path

class SpotifyLocalManager:
    def __init__(self):
        self.spotify_path = get_spotify_local_path()
        self.spotify_path.mkdir(parents=True, exist_ok=True)
        
    def format_filename(self, artist, title):
        """Format filename to match Spotify's expectations."""
        invalid_chars = '<>:"/\\|?*'
        artist = ''.join(c for c in artist if c not in invalid_chars)
        title = ''.join(c for c in title if c not in invalid_chars)
        filename = f"{artist} - {title}.mp3"
        return filename

    def prepare_metadata(self, file_path, metadata):
        """Set metadata in Spotify-friendly format."""
        # First, ensure basic ID3 tags are present
        try:
            audio = EasyID3(file_path)
        except:
            # If the file doesn't have an ID3 tag, add one
            audio = MP3(file_path)
            audio.add_tags()
            audio.tags.update_to_v23()  # Ensure we're using ID3v2.3
            audio.save()
            audio = EasyID3(file_path)
        
        # Set the basic metadata
        audio['title'] = metadata['title']
        audio['artist'] = metadata['artist']
        audio['album'] = metadata['album']
        audio['albumartist'] = metadata['artist']
        
        if 'year' in metadata:
            audio['date'] = metadata['year']
        if 'track_number' in metadata:
            audio['tracknumber'] = str(metadata['track_number'])
        
        audio.save()
        return audio

    def add_cover_art(self, file_path, cover_data, mime_type):
        """Add cover art in a way that's compatible with Spotify."""
        # Open the file with mutagen.id3
        audio = ID3(file_path)
        
        # Remove any existing APIC frames
        audio.delall("APIC")
        
        # Add the new cover art
        audio.add(APIC(
            encoding=3,  # UTF-8
            mime=mime_type,
            type=PictureType.COVER_FRONT,  # Cover (front)
            desc='Cover',
            data=cover_data
        ))
        
        # Save with v2.3 ID3 tags
        audio.update_to_v23()
        audio.save(v2_version=3)

    async def add_track(self, file: UploadFile, metadata: dict, save_path: Path, cover: UploadFile = None):
        """Process and add a track to specified directory."""
        filename = self.format_filename(metadata['artist'], metadata['title'])
        file_path = save_path / filename
        
        # Create directory if it doesn't exist
        save_path.mkdir(parents=True, exist_ok=True)
        
        # Save the audio file
        with open(file_path, 'wb') as f:
            contents = await file.read()
            f.write(contents)
        
        # Add basic metadata
        self.prepare_metadata(file_path, metadata)
        
        # Add cover art if provided
        if cover:
            cover_data = await cover.read()
            mime_type = cover.content_type or mimetypes.guess_type(cover.filename)[0]
            if not mime_type:
                mime_type = 'image/jpeg'  # Fallback
            self.add_cover_art(file_path, cover_data, mime_type)
        
        return str(file_path)

spotify_manager = SpotifyLocalManager()

@app.post("/api/tracks")
async def add_track(
    file: UploadFile = File(...),
    metadata: UploadFile = File(...),
    cover: Optional[UploadFile] = None,
    custom_path: Optional[str] = None
):
    try:
        # Read and parse metadata from the uploaded file
        metadata_content = await metadata.read()
        metadata_dict = json.loads(metadata_content.decode('utf-8'))
        
        # Determine save path
        save_path = Path(custom_path) if custom_path else spotify_manager.spotify_path
        
        # Validate the path
        try:
            save_path = Path(save_path)
            save_path.mkdir(parents=True, exist_ok=True)
            test_file = save_path / '.write_test'
            test_file.touch()
            test_file.unlink()
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid or inaccessible save path: {str(e)}"
            )
        
        file_path = await spotify_manager.add_track(file, metadata_dict, save_path, cover)
        
        return {
            "status": "success",
            "message": "Track added to local files",
            "path": file_path
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Invalid JSON format in metadata.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/spotify-status")
async def check_spotify_status():
    """Check Spotify local files setup status."""
    spotify_path = get_spotify_local_path()
    status = {
        "local_files_enabled": spotify_path.exists(),
        "path_writable": os.access(spotify_path, os.W_OK),
        "path": str(spotify_path),
        "tips": [
            "Enable 'Show Local Files' in Spotify Settings",
            "Add your local files folder in Spotify Settings",
            "Make sure files are in MP3, M4P, M4A, or WAV format",
            "Ensure Spotify has permission to access local files",
            "After adding files, you may need to restart Spotify to see changes"
        ]
    }
    return status