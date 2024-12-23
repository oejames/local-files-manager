# Spotify Local Files Manager

This is a web app that allows users to upload local music files to their Spotify library. The app integrates with Spotify's local files system, enabling users to manage their local music collection directly within Spotify.

## Features
- Upload and add MP3 files to Spotify's local files directory
- Add metadata (artist, album, etc.) and cover art to tracks
- Check Spotify's local file setup status and receive tips
- Automatically save files to the appropriate directory based on OS

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide-React
- **Backend**: FastAPI, Python, Mutagen (for audio file metadata handling)
- **Platform**: Auto-detects operating system to set the correct local file path

## Installation

### Server
1. Install dependencies:
```bash
pip install -r server/requirements.txt
```

2. Run the FastAPI server:
```bash
uvicorn backend.main:app --reload
```


### Client
1. Install dependencies:
```bash
npm install
```


3. Run the development server:
```bash
npm start
```


## Spotify Setup
Ensure "Local Files" is enabled in your Spotify settings and the local files directory is writable.

## License
MIT License
