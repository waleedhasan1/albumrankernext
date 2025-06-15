'use client';

import { useState, useEffect } from 'react';

interface Album {
  title: string;
}

export default function Home() {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums');
        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }
        const data = await response.json();
        setTitles(data.titles.map((album: Album) => album.title));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) return <div className="p-8">Loading albums...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Album Collection</h1>
      
      {titles.length === 0 ? (
        <p>No albums found.</p>
      ) : (
        <ul className="space-y-2">
          {titles.map((title, index) => (
            <li key={index} className="p-3 bg-gray-100 rounded-lg">
              {title}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}