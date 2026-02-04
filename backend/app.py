
from flask import Flask
# Import modules to receive JSON request and return JSON response
from flask import request, jsonify
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


# Creating POST API endpoint for risk assessment

@app.route("/assess-risk", methods=["POST"])

def assess_risk():
    # extract JSON data received from client request
    data = request.get_json()

    # Extract individual input fields from JSON input
    asset = data.get("asset")
    threat = data.get("threat")
    likelihood = data.get("likelihood")
    impact = data.get("impact")
    
    # validate that likelihood and impact are integers
    if not isinstance(likelihood,int) or not isinstance(impact,int):
        return jsonify({"error": "Invalid range: Likelihood and Impact must be 1-5"}), 400
    
    # Validate the likelihood and impact values against allowed risk scale(1-5)
    if not (1 <= likelihood <=5 and 1<= impact <=5):
        return jsonify({"error": "Invalid range: Likeihood and Impact must be 1-5"}),400
    
    # Calculate risk score based on likelihood and impact
    score = likelihood * impact

    # Classify risk severity level based on calculated score
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

    # Inserting computed risk record into risks table
    cursor.execute(""" 
        insert into risks(asset, threat, likelihood, impact, score, level) values (?,?,?,?,?,?)
    """, (asset, threat, likelihood, impact, score,level))

    conn.commit()

    # Retrieve automatically generated ID of inserted record
    risk_id = cursor.lastrowid
    conn.close()

    # return newly created risk record as API response
    return jsonify({
        "id":risk_id,
        "asset": asset,
        "threat": threat,
        "likelihood": likelihood,
        "impact": impact,
        "score": score,
        "level": level
    })

if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1",port=5000,debug=True)


    