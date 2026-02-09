
from flask import Flask
from flask import request, jsonify
from flask_cors import CORS
import sqlite3
import os
from dotenv import load_dotenv
load_dotenv()

DB_NAME = os.getenv("DB_NAME","risks.db")
PORT = int(os.getenv("PORT",5000))
DEBUG = os.getenv("DEBUG","False").lower() == "true"

app = Flask(__name__)
CORS(app)

def get_hints(level):
    hints = {
        "Low": "Monitor and review periodically",
        "Medium": "Implement additional security monitoring",
        "High": "Recommend NIST PR.AC-7: Rate Limiting",
        "Critical": "Recommend Strong Access Control and Monitoring"
    }
    return hints.get(level,"No recommendation available")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
                CREATE TABLE IF NOT EXISTS risks(
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


@app.route("/assess-risk", methods=["POST"])
def assess_risk():
    data = request.get_json()
    if not data:
        return jsonify({"error": " Invalid or missing JSON body"}),400
    asset = data.get("asset")
    threat = data.get("threat")
    likelihood = data.get("likelihood")
    impact = data.get("impact")
    
    if not asset or not threat or likelihood is None or impact is None:
        return jsonify({"error": "All fields (asset, threat, likelihood, impact) are required"}), 400
    asset = asset.strip()
    threat = threat.strip()
    # validate that likelihood and impact are integers
    if not isinstance(likelihood,int) or not isinstance(impact,int):
        return jsonify({"error": "Invalid range: Likelihood and Impact must be 1-5"}), 400
    
    if not (1 <= likelihood <=5 and 1 <= impact <=5):
        return jsonify({"error": "Invalid range: Likelihood and Impact must be 1-5"}),400
    
    score = likelihood * impact
    if score<=5:
        level = "Low"
    elif score <=12:
        level = "Medium"
    elif score <=18:
        level = "High"
    else:
        level = "Critical"

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(""" 
        insert into risks(asset, threat, likelihood, impact, score, level) values (?,?,?,?,?,?)
    """, (asset, threat, likelihood, impact, score,level))

    conn.commit()

    risk_id = cursor.lastrowid
    conn.close()

    hint = get_hints(level)
    # return newly created risk record as API response
    return jsonify({
        "id":risk_id,
        "asset": asset,
        "threat": threat,
        "likelihood": likelihood,
        "impact": impact,
        "score": score,
        "level": level,
        "hint": hint
    })


@app.route("/risks",methods=["GET"])
def get_risks():
    level_filter = request.args.get("level")
    severity_mapping = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
        "Critical": 4
    }
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    if level_filter and level_filter in severity_mapping:
        selected_rank = severity_mapping[level_filter]
        levels_allowed = [
            level for level,rank in severity_mapping.items()
            if rank>=selected_rank
        ]

        placeholders = ",".join(["?"] * len(levels_allowed))
        query = f"SELECT * FROM risks where level in ({placeholders}) order by id DESC"
        cursor.execute(query, levels_allowed)
    else:
        cursor.execute("SELECT * FROM risks order by id DESC")
    rows = cursor.fetchall()
    conn.close()

    risks = []
    for row in rows:
        hint = get_hints(row[6])
        risks.append({
            "id": row[0],
            "asset": row[1],
            "threat": row[2],
            "likelihood": row[3],
            "impact": row[4],
            "score": row[5],
            "level": row[6],
            "hint": hint
        })

    # return list of risk records as JSON Response
    return jsonify(risks)

if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1",port=PORT,debug=DEBUG)


