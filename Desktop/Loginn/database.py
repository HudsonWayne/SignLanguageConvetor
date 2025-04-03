import sqlite3

def create_databases():
    conn = sqlite3.connect('user_data.db')
    cursor = conn.cursor()
    
    #employee_data
