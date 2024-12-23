# Spotify Local Files Manager

This web app allows for customizing metadata, adding cover art, and handling uploads for local files on Spotify. 

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


1. Create a virtual environment:
```bash
python -m venv env
# On Windows:
env\Scripts\activate
# On macOS/Linux:
source env/bin/activate
```
2. Install dependencies:
```bash
npm run install-all
```

3. Run:
```bash
npm start
```


## Spotify Setup
Ensure "Local Files" is enabled in your Spotify settings and the local files directory is writable.

## License
ISC License
