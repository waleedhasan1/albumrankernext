import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export async function GET() {
  try {
    const db = new sqlite3.Database('./albums.db');
    
    // Promisify the database methods
    const dbAll = promisify(db.all.bind(db));
    const dbClose = promisify(db.close.bind(db));
    
    // Query all titles and cover urls
    const rows = await dbAll('SELECT title, cover_url FROM albums');
    
    // Close the database connection
    await dbClose();
    
    return NextResponse.json({ titles: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}