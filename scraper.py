import requests
from bs4 import BeautifulSoup
import sqlite3
import os
import time
import random
import re
import pandas as pd
import psycopg2
from dotenv import load_dotenv
def scrape_albums(source_url, num_albums=100):
    """
    Scrape album data from a music website
    This is a placeholder function - you'll need to customize for your target site
    """
    print(f"Scraping {num_albums} albums from {source_url}")
    

    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(source_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # This selector will need to be customized for the target website
        #first one is not a part of what we
        image_urls = []
        for bs4element in soup.find_all("figure"):
            #print(type(bs4element))
            img = bs4element.find("img")

            if not img:
                continue
            image_url = img.get("data-lazy-src") or img.get("src")
            alt = img.get("alt", "")   #only get image and alt, need to get form ahother tab
            #print(image_url + "- - - -")
           # print()
            image_urls.append(image_url)
        album_info = []
        for h2 in soup.find_all("h2"):
            #print(h2)
            album_info.append(h2)
        

        #for i,url in enumerate(image_urls):
            #print(i,url)
        #for i,info in enumerate(album_info):
            #print(i,info)
        #print(len(image_urls)) #need to chop off  first one
        #print(len(album_info)) #need to chop off last three
        image_urls = image_urls[1:]
        album_info = album_info[:len(album_info)-3]
       #for i,url in enumerate(image_urls):
            #print(i,url)
        #for i,info in enumerate(album_info):
            #print(i,info)
        
        #want to separate arrays into album names album authors and album years lists
        #want t make albums a list of dictionaries
        albums =[]
        
        for i in range(len(album_info)):
            #need to extract data from albym_info[i]
            #print(type(album_info[i].text))
            #print(album_info[i].text)
            if album_info[i].text == "70. ‘Smash Hits by Rodgers & Hart’ (Columbia, 1939)":
                continue
            s = album_info[i].text
            year_text = s[-5:-1]
            #print(s)
            author_title_text = s[s.find(".") + 2:s.find("(")]
           # print(author_title_text)
            author_text = author_title_text[:author_title_text.find(",")]
            title_text = author_title_text[author_title_text.find(",") + 3:len(author_title_text)-2]
           # print(author_text)
           # print(title_text)
            album_dict = {
                'title' : title_text,
                'artist' : author_text,
                'year' : year_text,
                'coverurl' : image_urls[i]
            }
            print(album_dict)
            albums.append(album_dict)

            #ok got everything separated.. need to put it into data base
            #or just return
        
            
            
        return albums
        
        for album in album_elements[:num_albums]:
            try:
                # These selectors will need to be customized for the target website
                title = album.select_one('.album-title').text.strip()
                artist = album.select_one('.album-artist').text.strip()
                cover_url = album.select_one('.album-cover img')['src']
                
                albums.append({
                    'title': title,
                    'artist': artist,
                    'cover_url': cover_url,
                    'elo_rating': 1400  # Starting ELO rating
                })
                
                # Be nice to the server
                time.sleep(random.uniform(0.5, 2))
                
            except Exception as e:
                print(f"Error processing album: {e}")
                continue
        
    except Exception as e:
        print(f"Error scraping albums: {e}")
    
    print(f"Successfully scraped {len(albums)} albums")
    return albums

def save_albums_to_neon(albums):
    """Save scraped albums to Neon database via Vercel"""
    load_dotenv()
    try:
        # Get database URL from environment variables
        database_url = os.getenv('DATABASE_URL')
        
        if not database_url:
            raise ValueError("DATABASE_URL not found in environment variables")
        
        # Connect to Neon database
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Create table if it doesn't exist (PostgreSQL syntax)
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS albums (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            year TEXT NOT NULL,
            cover_url TEXT NOT NULL,
            elo_rating INTEGER DEFAULT 1200,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Insert albums using batch insert for better performance
        insert_query = '''
        INSERT INTO albums (title, artist, cover_url, year, elo_rating)
        VALUES (%s, %s, %s, %s, %s)
        '''
        
        # Prepare data for batch insert
        album_data = [
            (album['title'], album['artist'], album['coverurl'], album['year'], 1200)
            for album in albums
        ]
        
        # Execute batch insert
        cursor.executemany(insert_query, album_data)
        
        # Commit changes
        conn.commit()
        
        print(f"Successfully saved {len(albums)} albums to Neon database")
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Close connections
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def save_albums_to_db(albums, db_path='albums.db'):
    """Save scraped albums to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        year TEXT NOT NULL,
        cover_url TEXT NOT NULL,
        elo_rating INTEGER DEFAULT 1200
    )
    ''')
    
    # Insert albums
    for album in albums:
        cursor.execute('''
        INSERT INTO albums (title, artist, cover_url, year, elo_rating)
        VALUES (?, ?, ?, ?, 1200)
        ''', (album['title'], album['artist'], album['coverurl'], album['year']))
    
    conn.commit()
    conn.close()
    print(f"Saved {len(albums)} albums to database")





if __name__ == "__main__":
    # Example usage - replace with actual URL
    source_url = "https://www.billboard.com/photos/best-album-covers-of-all-time-6715351/98-3-patti-smith-horses-1975-album-art-billboard-1240/"
    albums = scrape_albums(source_url, num_albums=100)
    print(len(albums))
    #for album in albums:
    #    print(album)
    save_albums_to_db(albums)