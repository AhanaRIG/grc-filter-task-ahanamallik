import React, { useState } from 'react'
import {useNavigate} from "react-router-dom"

const RiskForm = () => {
    const [asset, setAsset] = useState("");
    const [threat, setThreat] = useState("");
    const [likelihood, setLikelihood]  = useState(3);
    const [impact, setImpact] = useState(3);
    const navigate = useNavigate();

    const score = likelihood * impact;
    console.log("Score:",score)
    const riskLevel = (score) => {
        if (score > 18) return "Critical"
        if (score > 12) return "High"
        if (score > 5) return "Medium"
        return "Low"
    }

    const handleSubmit = async () => {
        if(!asset.trim() || !threat.trim()) {
            alert("Please fill in both asset and threat");
            return;
        }
        try {
            const response = await fetch("http://127.0.0.1:5000/assess-risk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    asset,
                    threat,
                    likelihood,
                    impact,
                }),
            })

            if (!response.ok){
                throw new Error("Failed to add risk")
            }
            alert("Risk Added Successfully!");
            // Reset
            setAsset("");
            setThreat("");
            setLikelihood(3);
            setImpact(3);
            navigate("/");
        }
        catch(error){
            console.error(error);
            alert("Something went wrong.Try again");
        }
    }
    
    return (
    <div className="riskFormContainer">
    <div className="riskForm">
        <h2>Add Risk Assessment</h2>

        <div className='formInput'>
            <label>Asset:</label>
            <input
                type="text"
                value={asset}
                placeholder='Enter asset name'
                onChange={(e) => setAsset(e.target.value)}
            />
        </div>

        <div className='formInput'>
            <label>Threat:</label>
            <input
                type="text"
                value={threat}
                placeholder='Enter threat name'
                onChange={(e) => setThreat(e.target.value)}
            />
        </div>

        <div className='formInput'>
            <label>Likelihood: {likelihood}</label>
            <input 
                type="range"
                min="1"
                max="5"
                value={likelihood}
                onChange={(e) => setLikelihood(Number(e.target.value))}
            />
        </div>

        <div className='formInput'>
            <label>Impact: {impact}</label>
            <input 
                type="range"
                min='1'
                max="5"
                value={impact}
                onChange={(e)=> setImpact(Number(e.target.value))}
            />
        </div>

        <h3>
            Preview Score: {score} | Level: {riskLevel(score)}
        </h3>

        <button onClick={handleSubmit}  className='buttonContainer'>Add Risk</button>
    </div>
    </div>
  )
}

export default RiskForm