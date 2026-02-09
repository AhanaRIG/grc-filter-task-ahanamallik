import React, { useEffect, useState } from "react";

const levelMapping = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
};

const Dashboard = () => {
    const [risks, setRisks] = useState([]);
    const [filterLevel, setFilterLevel] = useState("All");
    const [sortOrderByScore, setSortOrderByScore] = useState("asc");
    const [sortOrderByLevel, setSortOrderByLevel] = useState("asc");
    const [loading, setLoading] = useState(true);

    // Sort risks by risk level
    const sortByLevel = () => {
        const sorted = [...risks].sort((a, b) => {
            if (sortOrderByLevel === "asc") {
                return levelMapping[a.level] - levelMapping[b.level];
            }
            return levelMapping[b.level] - levelMapping[a.level];
        });

        setRisks(sorted);
        setSortOrderByLevel(sortOrderByLevel === "asc" ? "desc" : "asc");
    };
    // Sort risks by calculated score
    const sortByScore = () => {
        const sortedRisks = [...risks].sort((a, b) => {
            if (sortOrderByScore === "asc") {
                return a.score - b.score;
            } else {
                return b.score - a.score;
            }
        });
        setRisks(sortedRisks);
        setSortOrderByScore(sortOrderByScore === "asc" ? "desc" : "asc");
    };

    //   Fetch risks whenever filter changes
    useEffect(() => {
        fetchRisks(filterLevel);
    }, [filterLevel]);

    const fetchRisks = async (level = "All") => {
        try {
            let url = `${import.meta.env.VITE_API_BASE_URL}/risks`;
            if (level !== "All") {
                url += `?level=${level}`;
            }
            setLoading(true);
            const response = await fetch(url);
            const data = await response.json();
            setRisks(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Error fetching risks:", error);
        }
    };
    //   Count risks for each heatmap cell
    const getHeatmapData = (likelihood, impact) => {
        return risks.filter(
            (risk) => risk.likelihood === likelihood && risk.impact === impact,
        ).length;
    };
    //   Define color based on score
    const getHeatMapColor = (likelihood, impact) => {
        const score = likelihood * impact;
        if (score <= 5) return "#00FF00";
        else if (score <= 12) return "#FFFF00";
        else if (score <= 18) return "#FFA500";
        else return "#FF0000";
    };
    //   Define asset names for tooltip
    const getAssetsForCell = (likelihood, impact) => {
        return risks
            .filter(
                (risk) => risk.likelihood === likelihood && risk.impact === impact,
            )
            .map((risk) => risk.asset);
    };

    //  Dashboard Stats Card Calculation
    const totalRisks = risks.length;
    const highCriticalCount = risks.filter(
        (risk) => risk.level === "High" || risk.level === "Critical",
    ).length;

    const averageScore =
        totalRisks > 0
            ? risks.reduce((sum, risk) => sum + risk.score, 0) / totalRisks
            : 0;
    //   Mitigation Hint recommendation function
    const getMitigationHint = (level) => {
        switch (level) {
            case "Low":
                return "Accept / monitor";
            case "Medium":
                return "Plan mitigation within 6 months";
            case "High":
                return "Prioritize action + compensating controls (NIST PR.AC)";
            case "Critical":
                return "Immediate mitigation required + executive reporting";
            default:
                return "";
        }
    };
    //   Export risks data as CSV
    const exportAsCSV = () => {
        if(risks.length==0){
            alert("No risks data available to export ");
            return;
        }
        const headers = [
            "ID",
            "Asset",
            "Threat",
            "Likelihood",
            "Impact",
            "Score",
            "Level",
            "Mitigation Hint",
        ];
        const rows = risks.map((risk) => [
            risk.id,
            risk.asset,
            risk.threat,
            risk.likelihood,
            risk.impact,
            risk.score,
            risk.level,
            getMitigationHint(risk.level),
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.join(","))
            .join("\n");

        // create downloadable file
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if(isMobile){
            window.open(url,"_blank");
        }
        else{
            const link = document.createElement("a");
            link.href = url;
            link.download = "risksData.csv";
            link.click();
        }
        
    };

    return (
        <div style={{ padding: "25px" }}>
            <h2 style={{ textAlign: "center", marginBottom:"25px" }}>Risk Dashboard</h2>

            {loading ? (
                <p style={{ textAlign: "center" }}>Loading risks...</p>
            ) : (
                <>
                    {/* Dashboard Stats Card*/}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "15px",
                            marginBottom: "20px",
                        }}
                    >
                        <div className="statCard">
                            <strong>Total Risks: </strong>
                            {totalRisks}
                        </div>

                        <div className="statCard">
                            <strong>High / Critical: </strong>
                            {highCriticalCount}
                        </div>

                        <div className="statCard">
                            <strong>Average Score: </strong>
                            {averageScore.toFixed(2)}
                        </div>
                    </div>
                    {/* Filter Dropdown*/}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ marginRight: "5px" }}>Filter by Level: </label>
                        <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            style={{border:"1px solid white"}}
                        >
                            <option>All</option>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between",flexWrap:"wrap", gap:"5px"}}>
                        <button onClick={exportAsCSV} style={{ margin: "10px 0px 10px" }}>
                            Export CSV
                        </button>
                        <h4
                            style={{
                                marginTop: "25px",
                                border: "1px solid white",
                                padding: "6px 10px",
                                borderRadius: "10px",
                            }}
                        >
                            Scale: Likelihood and Impact range from 1 (Low) to 5 (High)
                        </h4>
                    </div>
                    {/* Risk data table */}
                    <div style={{ overflowX: "auto" }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Asset</th>
                                    <th>Threat</th>
                                    <th>Likelihood</th>
                                    <th>Impact</th>
                                    <th style={{ cursor: "pointer" }} onClick={sortByScore}>
                                        Score
                                        {sortOrderByScore === "asc" ? "↑" : "↓"}
                                    </th>
                                    <th onClick={sortByLevel} style={{ cursor: "pointer" }}>
                                        Level {sortOrderByLevel === "asc" ? "↑" : "↓"}
                                    </th>
                                    <th>Mitigation Hint</th>
                                </tr>
                            </thead>

                            <tbody>
                                {risks.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center" }}>
                                            No risks yet
                                        </td>
                                    </tr>
                                ) : (
                                    risks.map((risk) => (
                                        <tr key={risk.id}>
                                            <td>{risk.id}</td>
                                            <td>{risk.asset}</td>
                                            <td>{risk.threat}</td>
                                            <td>{risk.likelihood}</td>
                                            <td>{risk.impact}</td>
                                            <td>{risk.score}</td>
                                            <td>
                                                <span
                                                    className={`levelColor ${risk.level.toLowerCase()}`}
                                                >
                                                    {risk.level}
                                                </span>
                                            </td>
                                            <td>{getMitigationHint(risk.level)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Risk Heatmap */}
                    <h2 style={{ textAlign: "center", marginTop: "20px" , marginBottom:"20px"}}>
                        Risk Heatmap
                    </h2>
                    <h4 style={{ textAlign: "center", marginBottom: "5px" }}>Impact →</h4>
                    <div className="heatmapContainer">
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ marginRight: "10px", fontWeight: "bold" }}>
                                Likelihood
                            </div>
                            <div style={{ overflowX: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {[1, 2, 3, 4, 5].map((impact) => (
                                                <th key={impact} style={{ paddingBottom: "10px" }}>
                                                    {impact}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {[1, 2, 3, 4, 5].map((likelihood) => (
                                            <tr key={likelihood}>
                                                <th style={{ paddingRight: "15px" }}>{likelihood}</th>
                                                {[1, 2, 3, 4, 5].map((impact) => {
                                                    const count = getHeatmapData(likelihood, impact);
                                                    return (
                                                        // Apply color to heatmap cells
                                                        <td
                                                            key={impact}
                                                            title={
                                                                count > 0
                                                                    ? `${count} risks here: \n${getAssetsForCell(likelihood, impact).join("\n")}`
                                                                    : "No risks here"
                                                            }
                                                            style={{
                                                                backgroundColor: getHeatMapColor(
                                                                    likelihood,
                                                                    impact,
                                                                ),
                                                                textAlign: "center",
                                                                padding: "12px",
                                                                border: "1px solid gray",
                                                                color: "#0b1630",
                                                            }}
                                                        >
                                                            {count}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Heatmap Legend */}
                    <div style={{fontSize:"15px", marginTop:"30px"}}>
                        <strong>Legend: </strong>
                        <span style={{color:"#00FF00"}}> Low </span>|
                        <span style={{color:"#FFFF00"}}> Medium </span>|
                        <span style={{color:"#FFA500"}}> High </span>|
                        <span style={{color:"#FF0000"}}> Critical </span> 
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
