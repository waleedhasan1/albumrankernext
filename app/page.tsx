'use client'
import { useState, useEffect } from 'react';


interface Album {
  title: string;
  artist: string;
  cover_url: string;
  year: string;
  elo_rating: number;
}

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums');
        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }
        const data = await response.json();
        console.log('API response:', data); // Debug line
        setAlbums(data.albums || []); // Fallback to empty array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
     fetchAlbums();
  }, []);

  if (loading) return <div className="p-8">Loading albums...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Album Collection</h1>
      
      {!Array.isArray(albums) || albums.length === 0 ? (
        <p className="text-xl">No albums found.</p>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex gap-12 items-center justify-center mb-8">
            {albums.map((album, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm">
                <img 
                  src={album.cover_url} 
                  alt={`${album.title} cover`}
                  className="w-80 h-80 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{album.title}</h3>
                  <p className="text-lg text-gray-600 mb-1">{album.artist}</p>
                  <p className="text-md text-gray-500">{album.year}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={fetchAlbums}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            {loading ? 'Loading...' : 'Show New Albums'}
          </button>
        </div>
      )}
    </div>
  );
}