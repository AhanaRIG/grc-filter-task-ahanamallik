
from flask import Flask
# Import modules to receive JSON request and return JSON response
from flask import request, jsonify
import sqlite3

app = Flask(__name__)

DB_NAME = "risks.db"

# Add compliance hint based on risk level
def get_hints(level):
    hints = {
        "Low": "Monitor and review periodically",
        "Medium": "Implement additional security monitoring",
        "High": "Recommend NIST PR.AC-7: Rate Limiting",
        "Critical": "Recommend Strong Access Control and Monitoring"
    }
    return hints.get(level)

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


# Creating POST API endpoint for risk assessment

@app.route("/assess-risk", methods=["POST"])

def assess_risk():
    # extract JSON data received from client request
    data = request.get_json()

    # Data Validation before Extraction
    if not data:
        return jsonify({"error": " Invalid or missing JSON body"}),400
    # Extract individual input fields from JSON input
    asset = data.get("asset")
    threat = data.get("threat")
    likelihood = data.get("likelihood")
    impact = data.get("impact")
    
    # Validate required fields exist
    if not asset or not threat or likelihood is None or impact is None:
        return jsonify({"error": "All fields (asset, threat, likelihood, impact) are required"}), 400
    # validate that likelihood and impact are integers
    if not isinstance(likelihood,int) or not isinstance(impact,int):
        return jsonify({"error": "Invalid range: Likelihood and Impact must be 1-5"}), 400
    
    # Validate the likelihood and impact values against allowed risk scale(1-5)
    if not (1 <= likelihood <=5 and 1<= impact <=5):
        return jsonify({"error": "Invalid range: Likelihood and Impact must be 1-5"}),400
    
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


# create GET API endpoint to fetch all risks with optional filtering
@app.route("/risks",methods=["GET"])

def get_risks():
    # Retrieve query parameter "level" from URL
    level_filter = request.args.get("level")
    # add severity ranking mapping
    severity_mapping = {
        "Low": 1,
        "Medium": 2,
        "High": 3,
        "Critical": 4
    }
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # check if filter parameter is provided
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
    # Store retrieved dB rows into python variable
    rows = cursor.fetchall()
    conn.close()

    # create empty list to store converted JSON risk objects
    risks = []

    # loop through each dB row and conver it into dictionary format
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
    app.run(host="127.0.0.1",port=5000,debug=True)


