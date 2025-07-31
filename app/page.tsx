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
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/albums');
      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }
      const data = await response.json();
      console.log('API response:', data);
      setAlbums(data.albums || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = async (clickedAlbum: Album) => {
    if (albums.length !== 2 || updating) return;
    
    const winner = clickedAlbum;
    const loser = albums.find(album => album.title !== winner.title);
    
    console.log('Albums array:', albums);
    console.log('Clicked album:', clickedAlbum);
    console.log('Winner:', winner);
    console.log('Loser:', loser);
    
    if (!loser) return;
    
    try {
      setUpdating(true);
      setMessage('');
      setError(null);
      
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerTitle: winner.title,
          loserTitle: loser.title,
          winnerElo: winner.elo_rating,
          loserElo: loser.elo_rating,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update Elo Rating');
      }
      
      const result = await response.json();
      setMessage(result.message);

      // Wait to show result then fetch new albums
      setTimeout(() => {
        fetchAlbums();
        setMessage('');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  if (loading) return <div className="p-8">Loading albums...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="absolute top-4 right-4">
          <a 
          href="/rankings" 
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
          View Rankings
          </a>
        </div>
      <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-center">Pick the Better Album Cover</h1>
      
      {/* Show message when updating */}
      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {/* Show updating status */}
      {updating && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Updating ELO ratings...
        </div>
      )}
      
      {!Array.isArray(albums) || albums.length === 0 ? (
        <p className="text-xl">No albums found.</p>
      ) : (
        <div className="flex flex-col items-center w-full max-w-6xl">
          {/* Albums container - vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center justify-center mb-6 md:mb-8 w-full relative">
            {albums.map((album, index) => (
              <div 
                key={index} 
                onClick={() => handleAlbumClick(album)}
                className={`bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-sm cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl ${
                  updating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <img 
                  src={album.cover_url} 
                  alt={`${album.title} cover`}
                  className="w-full aspect-square object-contain bg-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="p-2 md:p-4">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">{album.title}</h3>
                  <p className="text-base md:text-lg text-gray-600 mb-1">{album.artist}</p>
                  <p className="text-sm md:text-md text-gray-500 mb-2">{album.year}</p>
                  <p className="text-base md:text-lg font-medium text-blue-600">Elo: {album.elo_rating}</p>
                  
                  {/* Click instruction */}
                  {!updating && (
                    <p className="text-sm text-gray-400 mt-2 italic">Click to choose this album!</p>
                  )}
                </div>
              </div>
            ))}
            
            {/* VS indicator - positioned differently on mobile vs desktop */}
            {albums.length === 2 && (
              <div className="absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 
                            top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2
                            bg-red-500 text-white text-xl md:text-2xl font-bold px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg pointer-events-none z-10">
                VS
              </div>
            )}
          </div>
          
          <button 
            onClick={fetchAlbums}
            disabled={loading || updating}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 md:px-8 rounded-lg transition-colors duration-200 text-base md:text-lg"
          >
            {loading ? 'Loading...' : updating ? 'Updating...' : 'Get New Albums'}
          </button>
        </div>
      )}
    </div>
  );
}