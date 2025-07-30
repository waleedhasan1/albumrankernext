'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Album {
  title: string;
  artist: string;
  cover_url: string;
  year: string;
  elo_rating: number;
}


export default function RankingsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'elo' | 'title' | 'artist' | 'year'>('elo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchAllAlbums = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/rankings');
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sortedAlbums = [...albums].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'elo':
        aValue = a.elo_rating;
        bValue = b.elo_rating;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'artist':
        aValue = a.artist.toLowerCase();
        bValue = b.artist.toLowerCase();
        break;
      case 'year':
        aValue = parseInt(a.year) || 0;
        bValue = parseInt(b.year) || 0;
        break;
      default:
        aValue = a.elo_rating;
        bValue = b.elo_rating;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (column: 'elo' | 'title' | 'artist' | 'year') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-600 font-bold'; // Gold
    if (index === 1) return 'text-gray-500 font-bold';   // Silver
    if (index === 2) return 'text-orange-600 font-bold'; // Bronze
    return 'text-gray-700';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  useEffect(() => {
    fetchAllAlbums();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-red-800 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchAllAlbums}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Album Rankings</h1>
            <p className="text-gray-600">
              {albums.length} albums ranked by ELO rating
            </p>
          </div>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Back to Battle
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Albums</h3>
            <p className="text-2xl font-bold text-gray-900">{albums.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Highest ELO</h3>
            <p className="text-2xl font-bold text-green-600">
              {albums.length > 0 ? Math.max(...albums.map(a => a.elo_rating)) : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Lowest ELO</h3>
            <p className="text-2xl font-bold text-red-600">
              {albums.length > 0 ? Math.min(...albums.map(a => a.elo_rating)) : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Average ELO</h3>
            <p className="text-2xl font-bold text-blue-600">
              {albums.length > 0 ? Math.round(albums.reduce((sum, a) => sum + a.elo_rating, 0) / albums.length) : 0}
            </p>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Album
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('title')}
                  >
                    Title {getSortIcon('title')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('artist')}
                  >
                    Artist {getSortIcon('artist')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('year')}
                  >
                    Year {getSortIcon('year')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('elo')}
                  >
                    ELO Rating {getSortIcon('elo')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAlbums.map((album, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg ${getRankColor(index)}`}>
                        {getRankIcon(index)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {album.cover_url ? (
                            <img 
                              className="h-16 w-16 rounded-lg object-cover" 
                              src={album.cover_url} 
                              alt={`${album.title} cover`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEg0MFY0MEgyNFYyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                              }}
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🎵</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {album.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {album.artist}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {album.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        album.elo_rating >= 1400 ? 'bg-green-100 text-green-800' :
                        album.elo_rating >= 1200 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {album.elo_rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {albums.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No albums found. Start battling to see rankings!</p>
          </div>
        )}
      </div>
    </div>
  );
}