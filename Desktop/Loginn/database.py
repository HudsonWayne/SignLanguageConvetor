import sqlite3

def create_databases():
    conn = sqlite3.connect('user_data.db')
    cursor = conn.cursor()
    
    #employee_data
    cursor.execute('''CREATE TABLE IF NOT EXISTS employees (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        fingerprint TEXT NOT NULL)''')
    
    conn.commit()
    conn.close()
