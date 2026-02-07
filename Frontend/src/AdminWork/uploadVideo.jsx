import { useParams } from "react-router";
import axios from 'axios';
import axiosClinet from "../utils/axios";
import { useState } from "react";

function UploadVideo() {
    const { problemId } = useParams();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
        setProgress(0);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please calculate a file first.');
            return;
        }

        try {
            setUploading(true);
            setMessage('Getting upload signature...');
            setError('');

            // 1. Get Signature from backend
            // Assuming your backend API base URL is configured in axios or you use a proxy. 
            // If not, you might need to prepend 'http://localhost:your_port'
            // Using relative path assuming proxy or same origin for now, but adding /api based on common patterns. 
            // Checking previous file explorations, routes seem to be mounted. 
            // The route in VideoRoute.js is /create/:problemId. 
            // I need to know the base path for video routes. Usually it's /api/video or similar.
            // I'll assume /api/video for now based on typical structures, but might need adjustment.

            const signatureResponse = await axiosClinet.get(`/video/create/${problemId}`, {
                withCredentials: true // If you use cookies/sessions
            });

            const { signature, timeStamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

            // 2. Upload to Cloudinary
            setMessage('Uploading to Cloudinary...');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('timestamp', timeStamp);
            formData.append('signature', signature);
            formData.append('public_id', public_id);
            // formData.append('folder', 'leetcode_solutions'); // Optional if you want to organize

            const cloudRes = await axios.post(upload_url, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            const { secure_url, duration } = cloudRes.data;

            // 3. Save Metadata to Backend
            setMessage('Saving video metadata...');

            await axiosClinet.post(`/video/save`, {
                problemId,
                cloudinaryPublicId: public_id,
                cloudinaryUrl: secure_url,
                secretUrl: secure_url, // Or whatever logic for secretUrl
                duration
            }, {
                withCredentials: true
            });

            setMessage('Video uploaded and saved successfully!');
            setFile(null);
            setProgress(0);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (

        <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">Upload Solution Video</h2>

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Select Video File
                        </label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700
                                cursor-pointer bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {progress > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                            <p className="text-xs text-gray-400 text-right mt-1">{progress}%</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {message && !error && (
                        <div className="p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm text-center">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 
                            ${uploading || !file
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                </form>
            </div>
        </div>

    );
}

export default UploadVideo;