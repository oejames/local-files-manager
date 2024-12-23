# Spotify Local Files Manager

This is a web app that allows for customizing (metadata, cover art), managing and uploading local files to Spotify. 
<img src="https://github.com/user-attachments/assets/f352e607-7c67-45b1-a5e2-b0974d22c13a" alt="Image description" width="600">


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
cd src/server
pip install -r requirements.txt
```

2. Run the FastAPI server:
```bash
uvicorn app:app --reload --port 8000
```


### Client
1. Install dependencies:
```bash
cd src/client
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
