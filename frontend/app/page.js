"use client";
import { useState, useRef } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setCaption('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setCaption('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await fetch('http://localhost:8000/caption', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await res.json();
      setCaption(data.caption);
    } catch (error) {
      console.error('Error fetching caption:', error);
      setCaption('Error generating caption. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Image Caption Generator
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 cursor-pointer hover:border-indigo-400 transition duration-200"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="object-cover h-full w-full rounded-lg"
              />
            ) : (
              <p className="text-gray-500">
                Drag & drop your image here or click to select
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !image}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-200 ${
              loading || !image
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Processing...' : 'Generate Caption'}
          </button>
        </form>
        {caption && (
          <div className="mt-8 bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-800">Caption</h2>
            <p className="text-gray-700">{caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
