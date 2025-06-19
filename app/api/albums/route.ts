import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
//import Database from 'better-sqlite3';




export async function GET() {
  try {
    const db = new sqlite3.Database('./albums.db');
    
    // Promisify the database methods
    const dbAll = promisify(db.all.bind(db));
    //const dbClose = promisify(db.close.bind(db));
    
    // Query all titles and cover urls
    const rows = await dbAll('SELECT * FROM albums ORDER BY RANDOM() LIMIT 2');
    
    // Close the database connection
    db.close();
    
    return NextResponse.json({ albums: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  } 
}

/*
export async function POST(request: Request) {
  try {
    const { winnerTitle, loserTitle, winnerElo, loserElo } = await request.json();
    
    db = new Database('./albums.db');
    
    // Calculate new Elo ratings
    const K = 30; // Elo constant
    
    // Calculate expected scores
    const expectedWinner = 1.0 / (1.0 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1.0 / (1.0 + Math.pow(10, (winnerElo - loserElo) / 400));
    
    // Calculate new ratings (winner gets 1, loser gets 0)
    const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser));
    
    // Prepare statements
    updateWinner = db.prepare('UPDATE albums SET elo_rating = ? WHERE title = ?');
    updateLoser = db.prepare('UPDATE albums SET elo_rating = ? WHERE title = ?');
    
    // Create and execute transaction
    const transaction = db.transaction(() => {
      updateWinner.run(newWinnerElo, winnerTitle);
      updateLoser.run(newLoserElo, loserTitle);
    });
    
    transaction();
    
    return NextResponse.json({ 
      success: true,
      newWinnerElo,
      newLoserElo,
      message: `${winnerTitle} (${winnerElo} -> ${newWinnerElo}) beat ${loserTitle} (${loserElo} -> ${newLoserElo})`
    });
    
  } catch (error) {
    console.error('Elo update error:', error);
    return NextResponse.json(
      { error: 'Failed to update Elo ratings' },
      { status: 500 }
    );
  } finally {
    // Clean up prepared statements first (only if they were created)

    // Then close database (only if it was opened)
    if (db !== null) {
      db.close();
    }
  }
}
  */