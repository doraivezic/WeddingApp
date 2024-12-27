import psycopg2
import os
from app import app, db, User  # Import your app, db, and models

DATABASE_URL = 'postgresql://weddingdatabase_6t11_user:i3g08Y2kxei2BbxxyhenH6oFQHQXFyjO@dpg-ctnj38lumphs73c79nbg-a.frankfurt-postgres.render.com/weddingdatabase_6t11'

# Test the database connection
try:
    conn = psycopg2.connect(DATABASE_URL)
    print("Database connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")

# Run queries within the application context
with app.app_context():
    guests = User.query.all()
    for guest in guests:
        print(guest)
