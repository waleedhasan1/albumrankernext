'use client'
//import { DynamicServerError } from 'next/dist/client/components/hooks-server-context';


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
    //    setUpdating(false);
        
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
    

  const handleAlbumClick = async(clickedAlbum: Album) => {
    if (albums.length != 2 || updating) return;
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
      const response = await fetch('./api/albums',{
        method: 'POST',
        headers: {

          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerTitle : winner.title,
          loserTItle : loser.title,
          winnerElo : winner.elo_rating,
          loserElo : loser.elo_rating,
        }),
      });

      if (!response.ok){
        throw new Error('Failed to update Elo Rating');
      }
      const result = await response.json();
      setMessage(result.message);

      //wait to show new result then fetch new album
      setTimeout(() => {
        fetchAlbums();
        setMessage('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'an error occured')
    }
  };




  useEffect(() => {
     fetchAlbums();
  }, []);

  if (loading) return <div className="p-8">Loading albums...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Album Collection</h1>
      
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
                  <p className="text-md text-gray-500 mb-2">{album.year}</p>
                  <p className="text-lg font-medium text-blue-600">Elo: {album.elo_rating}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={fetchAlbums}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
          >
            {loading ? 'Loading...' : 'Get New Albums'}
          </button>
        </div>
      )}
    </div>
  );
} 
/*
return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Album Battle</h1>
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
          {message}
        </div>
      )}
      
      {!Array.isArray(albums) || albums.length === 0 ? (
        <p className="text-xl">No albums found.</p>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex gap-12 items-center justify-center mb-8">
            {albums.map((album, index) => (
              <button
                key={index} 
                onClick={() => handleAlbumClick(album)}
                disabled={loading || updating}
                className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
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
                  <p className="text-md text-gray-500 mb-2">{album.year}</p>
                  <p className="text-lg font-medium text-blue-600">Elo: {album.elo_rating}</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {updating ? 'Updating ratings...' : 'Click on your favorite album to make it win!'}
            </p>
            <button 
              onClick={fetchAlbums}
              disabled={loading || updating}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Loading...' : 'Skip & Get New Albums'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}   */

  