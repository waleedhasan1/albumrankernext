import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize Neon connection
    const sql = neon(process.env.DATABASE_URL || '');

    
    // Query 2 random albums from Neon database
    const albums = await sql`
      SELECT * FROM albums 
      ORDER BY RANDOM() 
      LIMIT 2
    `;
    
    return NextResponse.json({ albums });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const { winnerTitle, loserTitle, winnerElo, loserElo } = await request.json();
    
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
    
    // Calculate new Elo ratings
    const K = 30; // Elo constant
    
    // Calculate expected scores
    const expectedWinner = 1.0 / (1.0 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1.0 / (1.0 + Math.pow(10, (winnerElo - loserElo) / 400));
    
    // Calculate new ratings (winner gets 1, loser gets 0)
    const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser));
    
    // Update both albums in a single transaction-like operation
    // Neon handles transactions automatically for multiple queries
    await sql`
      UPDATE albums 
      SET elo_rating = ${newWinnerElo} 
      WHERE title = ${winnerTitle}
    `;
    
    await sql`
      UPDATE albums 
      SET elo_rating = ${newLoserElo} 
      WHERE title = ${loserTitle}
    `;
    
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
  }
}
  