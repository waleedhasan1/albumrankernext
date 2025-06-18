import { NextResponse } from 'next/server';
import sqlite3, { Database } from 'sqlite3';
import { promisify } from 'util';

export async function GET() {
  try {
    const db = new sqlite3.Database('./albums.db');
    
    // Promisify the database methods
    const dbAll = promisify(db.all.bind(db));
    const dbClose = promisify(db.close.bind(db));
    
    // Query all titles and cover urls
    const rows = await dbAll('SELECT title, artist, year, cover_url, elo_rating FROM albums ORDER BY RANDOM() LIMIT 2');
    
    // Close the database connection
    await dbClose();
    
    return NextResponse.json({ albums: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request){
    try{
        //request json form:
        //{
        //   winnerTitle: "Abbey Road",
        //    loserTitle: "Dark Side of the Moon", 
        //    winnerElo: 1400,
        //    loserElo: 1350
        //}
        const {winner_title, loser_title, winner_elo, loser_elo} = await request.json();
        const db = new Database('./albums.db')
        const K = 30;
        const expected_winner = 1.0 / (1.0 + Math.pow(10,(loser_elo - winner_elo)/400));
        const expected_loser = 1.0 / (1.0 + Math.pow(10,(winner_elo - loser_elo)/400));

        const new_winner_elo = Math.round(winner_elo + K * (1-expected_loser));
        const new_loser_elo = Math.round(loser_elo + K * (0-expected_loser));

        const update_winner_query = db.prepare("update albums set elo_rating = ? where title = ?");
        const update_loser_query = db.prepare("update albums set elo_rating = ? where title = ?");
        update_winner_query.run(new_winner_elo, winner_title);
        update_loser_query.run(new_loser_elo, loser_title);
        db.close();

        return NextResponse.json({
            success: true,
            new_winner_elo,
            new_loser_elo,
            message: '${winner_title} (${winner_elo} -> ${new_winner_elo}) beat ${loser_title}(${})'
        });

    }
}