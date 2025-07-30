import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if DATABASE_URL exists
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.error('DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }
    
    // Initialize Neon connection
    const sql = neon(databaseUrl);
    
    // Query all albums ordered by ELO rating (highest first)
    const albums = await sql`
      SELECT 
        id,
        title,
        artist,
        year,
        cover_url,
        elo_rating,
        created_at
      FROM albums 
      ORDER BY elo_rating DESC, title ASC
    `;
    
    return NextResponse.json({ 
      albums,
      total: albums.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}