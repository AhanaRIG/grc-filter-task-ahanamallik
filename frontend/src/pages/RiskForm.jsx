import React, { useState } from 'react'
import {useNavigate} from "react-router-dom"
const RiskForm = () => {
    const [asset, setAsset] = useState("");
    const [threat, setThreat] = useState("");
    const [likelihood, setLikelihood]  = useState(3);
    const [impact, setImpact] = useState(3);
    const navigate = useNavigate();

    // Preview Calculation
    const score = likelihood * impact;

    let level = "Low";
    if (score>5 && score <=12)
        level = "Medium";
    else if (score>12 && score<=18)
        level = "High"
    else if (score>18)
        level = "Critical";

    // Connect Backend POST API to submit button
    const handleSubmit = async () => {
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
                const errorData = await response.json();
                alert(errorData.error);
                return;
            }
            alert("Risk Added Successfully!");
            setAsset("");
            setThreat("");
            setLikelihood(3);
            setImpact(3);
            navigate("/");
        }
        catch(error){
            console.error(error);
            alert("Server error");
        }
    }
    
    return (
    <div style = {{padding: "20px"}}>
        <h2>Add Risk Assessment</h2>
        {/* Assess Input */}
        <div>
            <label>Asset:</label>
            <input
                type="text"
                value= {asset}
                onChange={(e) => setAsset(e.target.value)}
            />
        </div>

        <div>
            {/* Threat Input */}
            <label>Threat:</label>
            <input
                type="text"
                value= {threat}
                onChange={(e) => setThreat(e.target.value)}
            />
        </div>

        <div>
            {/* Likelihood Slider */}
            <label>Likelihood: {likelihood}</label>
            <input 
                type="range"
                min= "1"
                max= "5"
                value = {likelihood}
                onChange={(e) => setLikelihood(Number(e.target.value))}
            />
        </div>

        {/* Impact Slider  */}
        <div>
            <label>Impact: {impact}</label>
            <input 
                type= "range"
                min= "1"
                max= "5"
                value= {impact}
                onChange={(e)=> setImpact(Number(e.target.value))}
            />
        </div>

        {/* Preview */}
        <h3>
            Preview Score: {score} | Level: {level}
        </h3>

        {/* Submit Button */}
        <button onClick={handleSubmit}>Add Risk</button>
    </div>
  )
}

export default RiskForm