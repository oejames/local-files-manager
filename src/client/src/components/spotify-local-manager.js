import { useState, useEffect } from 'react';
import { Music, Upload, Settings, Check, AlertCircle } from 'lucide-react';

const SpotifyLocalManager = () => {
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const response = await fetch('/api/spotify-status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError('Failed to check Spotify status');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''),
      artist: '',
      album: '',
      cover: null
    }));
    setFiles(selectedFiles);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file.file);
      if (file.cover) {
        formData.append('cover', file.cover);
      }
      
      const metadata = {
        title: file.name,
        artist: file.artist,
        album: file.album
      };
      
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await fetch('/api/tracks', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      setSuccess(`${file.name} added to Spotify local files`);
      setFiles(files.filter(f => f !== file));
    } catch (err) {
      setError(`Failed to add ${file.name}: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Spotify Local Files Status</h2>
        </div>
        
        {status && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {status.local_files_enabled ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
                <span>Local Files Directory</span>
              </div>
              <div className="text-sm text-gray-500 truncate">
                {status.path}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Setup Tips:</h3>
              <ul className="space-y-2 text-sm">
                {status.tips.map((tip, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add to Spotify Local Files</h2>
        
        <div className="space-y-4">
          <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              Select music files to add
            </span>
            <input
              type="file"
              multiple
              accept="audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {/* File List */}
          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-gray-400" />
                  <span className="flex-1 font-medium">{file.name}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Artist Name"
                    className="p-2 border rounded"
                    value={file.artist}
                    onChange={(e) => {
                      const newFiles = [...files];
                      newFiles[index].artist = e.target.value;
                      setFiles(newFiles);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Album Name"
                    className="p-2 border rounded"
                    value={file.album}
                    onChange={(e) => {
                      const newFiles = [...files];
                      newFiles[index].album = e.target.value;
                      setFiles(newFiles);
                    }}
                  />
                </div>
                
                <button
                  className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  onClick={() => handleUpload(file)}
                  disabled={!file.artist || !file.album || uploading}
                >
                  {uploading ? 'Adding to Spotify...' : 'Add to Spotify'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <p className="text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
};

export default SpotifyLocalManager;