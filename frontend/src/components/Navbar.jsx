import {Link} from "react-router-dom"
const Navbar = () => {
  return (
    <div style={{backgroundColor:"#1e3a8a", padding:"25px" , color:"white"}}>
        <h1 style={{textAlign:"center"}}>GRC Risk Assessment Tool</h1>
        <nav style={{marginBottom:"20px", fontSize: "18px", marginTop:"20px"}}>
            <Link to="/" style={{color:"#93c5fd", marginRight:"25px", fontWeight: "bolder"}}>Dashboard</Link>
            <Link to ="/add-risk" style={{color:"#93c5fd", fontWeight: "bolder"}}>Add Risk</Link>
        </nav>
        <hr/>
    </div>
  )
}

export default Navbar