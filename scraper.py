import requests
from bs4 import BeautifulSoup
import sqlite3
import os
import time
import random
import re
import pandas as pd

def scrape_albums(source_url, num_albums=100):
    """
    Scrape album data from a music website
    This is a placeholder function - you'll need to customize for your target site
    """
    print(f"Scraping {num_albums} albums from {source_url}")
    
    albums = []
    
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
        

        for i,url in enumerate(image_urls):
            print(i,url)
        for i,info in enumerate(album_info):
            print(i,info)
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
        for i in len(album_info):

            album_dict = {}
            #want to make this element
            #title: author: year: source:
            
        for info in album_info:
            print(type(info))
            print(info)
            
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
        cover_url TEXT NOT NULL,
        elo_rating INTEGER NOT NULL,
        times_rated INTEGER DEFAULT 0
    )
    ''')
    
    # Insert albums
    for album in albums:
        cursor.execute('''
        INSERT INTO albums (title, artist, cover_url, elo_rating, times_rated)
        VALUES (?, ?, ?, ?, 0)
        ''', (album['title'], album['artist'], album['cover_url'], album['elo_rating']))
    
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
    #save_albums_to_db(albums)