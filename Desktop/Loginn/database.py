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
    
def add_employee(name, fingerprint_dat):
    conn = sqlite3.connect('employees.db')
    cursor = conn.cursor()
    
    cursor.execute("INSERT INTO employee (name, fingerprint)VALUES (?, ?)", name, fingerprint_dat)
    
    conn.commit()
    conn.close()
    
    #function to fetch all the employees
    
def fetch_employees():
    conn = sqlite3.connect('employees.db')
    cursor = conn.cursor
