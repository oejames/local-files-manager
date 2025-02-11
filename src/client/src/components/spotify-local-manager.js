import { useState, useEffect } from 'react';
import { Music, Upload, Settings, Check, AlertCircle, Image as ImageIcon, Folder } from 'lucide-react';

const SpotifyLocalManager = () => {
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customPath, setCustomPath] = useState('');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/spotify-status`);
      const data = await response.json();
      setStatus(data);
      setCustomPath(data.path);
    } catch (err) {
      setError('Failed to check Spotify status');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: '',
      album: '',
      cover: null,
      coverPreview: null
    }));
    setFiles(selectedFiles);
  };

  const handleCoverSelect = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const newFiles = [...files];
      newFiles[index].cover = file;
      newFiles[index].coverPreview = previewUrl;
      setFiles(newFiles);
    }
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
        title: file.title,
        artist: file.artist,
        album: file.album,
      };
  
      if (customPath) {
        formData.append('custom_path', customPath);
      }
  
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      formData.append('metadata', metadataBlob, 'metadata.json');
  
      const response = await fetch(`${API_URL}/api/tracks`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
  
      setSuccess(`${file.title} added to Spotify local files`);
      setFiles(files.filter((f) => f !== file));
      
      if (file.coverPreview) {
        URL.revokeObjectURL(file.coverPreview);
      }
    } catch (err) {
      console.error('Error during upload:', err);
      setError(`Failed to add ${file.title}: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Music className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Spotify Local Manager</span>
            </div>
            {status?.local_files_enabled && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Check className="w-4 h-4 mr-1" />
                Connected
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Status and Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Directory Settings Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Settings</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local Files Directory
                    </label>
                    <input
                      type="text"
                      value={customPath}
                      onChange={(e) => setCustomPath(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter custom path"
                    />
                  </div>
                  
                  {/* Status Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Setup Tips</h3>
                    <ul className="space-y-2">
                      {status?.tips?.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mt-0.5">
                            {i + 1}
                          </span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - File Upload and Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Add Music</h2>
              </div>
              <div className="p-4">
                <label className="block">
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Drop music files here or click to browse</span>
                    <input
                      type="file"
                      multiple
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Selected Files</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {files.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {/* Cover Art Preview */}
                          <div className="flex-shrink-0">
                            {file.coverPreview ? (
                              <img
                                src={file.coverPreview}
                                alt="Cover"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Music className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Metadata Fields */}
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={file.title}
                              onChange={(e) => {
                                const newFiles = [...files];
                                newFiles[index].title = e.target.value;
                                setFiles(newFiles);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="Track title"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={file.artist}
                                onChange={(e) => {
                                  const newFiles = [...files];
                                  newFiles[index].artist = e.target.value;
                                  setFiles(newFiles);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Artist"
                              />
                              <input
                                type="text"
                                value={file.album}
                                onChange={(e) => {
                                  const newFiles = [...files];
                                  newFiles[index].album = e.target.value;
                                  setFiles(newFiles);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Album"
                              />
                            </div>

                            {/* Cover Art Upload and Submit */}
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                <ImageIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                  {file.cover ? 'Change Cover' : 'Add Cover'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleCoverSelect(e, index)}
                                />
                              </label>
                              <button
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => handleUpload(file)}
                                disabled={!file.artist || !file.album || !file.title || uploading}
                              >
                                {uploading ? 'Adding...' : 'Add to Spotify'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {(error || success) && (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <p className="text-green-700">{success}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpotifyLocalManager;