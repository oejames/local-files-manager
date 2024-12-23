# Spotify Local Files Manager

This is a web app that allows for managing and customizing local files (metadata, cover art) to a Spotify library. 

## Features
- Upload and add MP3 files to Spotify's local files directory
- Add metadata (artist, album, etc.) and cover art to tracks
- Automatically save files to the appropriate directory based on OS

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide-React
- **Backend**: FastAPI, Python, Mutagen (for audio file metadata handling)
- **Platform**: Auto-detects operating system to set the correct local file path

## Installation

### Server
1. Install dependencies:
```bash
cd server
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
uvicorn app:app --reload --port 8000
```


### Client
1. Install dependencies:
```bash
cd client
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
