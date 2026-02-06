import React, { useEffect , useState} from 'react'

const Dashboard = () => {
    const [risks, setRisks] = useState([]);
    // Add Filter state
    const [filterLevel, setFilterLevel] = useState("All");

    // Add Sorting State
    const [sortOrder, setSortOrder] = useState("asc");

    // Create Sort Function
    const sortByScore = () => {
        const sorted_risks = [...risks].sort((a,b) => {
            if (sortOrder === "asc"){
                return a.score - b.score;
            }
            else{
                return b.score - a.score;
            }
        })
        setRisks(sorted_risks);
        setSortOrder(sortOrder === "asc"? "desc" : "asc");
    }


    useEffect(() => {
      fetchRisks(filterLevel);
    }, [filterLevel])

    const fetchRisks = async (level = "All") => {
        try {
            let url = "http://127.0.0.1:5000/risks";
            if(level !== "All"){
                url += `?level=${level}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            setRisks(data);
        } catch (error) {
            console.error("Error fetching risks:", error);
        }
    }

    // Create Heatmap Grid data
    const getHeatMapData = (likelihood,impact) => {
        return risks.filter((risk) => risk.likelihood === likelihood && risk.impact === impact).length;
    }
  
    // Create Color Logic Function
    const getHeatMapColor = (likelihood,impact) => {
        const score = likelihood * impact;
        if (score <=5) return "#00FF00"; 
        else if (score <=12) return "#FFFF00";
        else if (score <=18) return "#FFA500";
        else return "#FF0000"; 
    }

    // Create Function to get Asset names
    const getAssetsForCell = (likelihood,impact) => {
        return risks
            .filter(risk => risk.likelihood === likelihood && risk.impact === impact)
            .map(risk => risk.asset);
    };

    // Stats Card Calculation
    const totalRisks = risks.length;
    const highCriticalCount = risks.filter((risk) => risk.level === "High" || risk.level === "Critical").length;

    const averageScore = totalRisks>0 
    ? risks.reduce((sum,risk) => sum+risk.score,0)/totalRisks
    : 0;

  return (
    <div style={{padding: "20px"}}>
        <h2>Risk Dashboard</h2>
        {/* Add State Card */}
        <div style={{display:"flex", gap: "15px", marginBottom:"20px"}}>
            <div style={{border:"1px solid gray", padding:"15px"}}>
                <strong>Total Risks: </strong>{totalRisks}
            </div>

            <div style={{border:"1px solid gray", padding:"15px"}}>
                <strong>High / Critical: </strong>{highCriticalCount}
            </div>

            <div style={{border:"1px solid gray", padding:"15px"}}>
                <strong>Average Score: </strong>{averageScore.toFixed(2)}
            </div>
        </div>
        {/* Add Dropdown UI */}
        <div style ={{marginBottom: "15px"}}>
            <label style={{marginRight: "5px"}}>Filter by Level: </label>
            <select
                value = {filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
            >
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
            </select>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Asset</th>
                    <th>Threat</th>
                    <th>Likelihood</th>
                    <th>Impact</th>
                    <th style={{cursor: "pointer"}} onClick={sortByScore}>Score
                        {sortOrder === "asc"? "↑" : "↓"}
                    </th>
                    <th>Level</th>
                </tr>
            </thead>

            <tbody>
                {
                    risks.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{textAlign: "center"}}>
                                No risks yet
                            </td>
                        </tr>
                    ) : 
                    (risks.map((risk) => (
                        <tr key={risk.id}>
                            <td>{risk.id}</td>
                            <td>{risk.asset}</td>
                            <td>{risk.threat}</td>
                            <td>{risk.likelihood}</td>
                            <td>{risk.impact}</td>
                            <td>{risk.score}</td>
                            <td>{risk.level}</td>
                        </tr>
                        ))
                    )
                }
            </tbody>
        </table>

        {/* Create Heatmap UI */}
        <h3>Risk Heatmap</h3>
        <h4 style={{textAlign:"center", marginBottom: "5px"}}>Impact →</h4>
        <div style={{display:"flex", alignItems: "center"}}>
            <div style = {{marginRight: "10px", fontWeight: "bold"}}>
                Likelihood
            </div>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {[1,2,3,4,5].map((impact) => (
                            <th key={impact} style={{paddingBottom: "10px"}}>{impact}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {[1,2,3,4,5].map((likelihood) => (
                        <tr key={likelihood}>
                            <th style={{paddingRight: "15px"}}>{likelihood}</th>
                            {[1,2,3,4,5].map((impact) => {
                                const count = getHeatMapData(likelihood, impact);
                                return (
                                    // Apply color to heatmap cells
                                    <td key={impact} 
                                    title = {
                                        count>0
                                        ? `${count} risks here: \n${getAssetsForCell(likelihood,impact).join("\n")}`
                                        : "No risks here"
                                    }
                                    style = {{backgroundColor : getHeatMapColor(likelihood,impact), textAlign: "center", padding:"12px", border: "1px solid gray"}} >
                                        {count}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
    </div>
  )
}

export default Dashboard