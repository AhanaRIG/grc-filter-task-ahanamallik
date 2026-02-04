
from flask import Flask
import sqlite3

app = Flask(__name__)

DB_NAME = "risks.db"

def init_db():
    conn = sqlite3.connect(DB_NAME);
    cursor = conn.cursor()

    cursor.execute("""
                create table if not exists risks(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset TEXT,
                    threat TEXT,
                    likelihood INTEGER,
                    impact INTEGER,
                    score INTEGER,
                    level TEXT)
        """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return "Backend running properly"

if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1",port=5000,debug=True)