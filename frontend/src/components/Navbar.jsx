import {Link} from "react-router-dom"
const Navbar = () => {
  return (
    <div style={{padding:"15px", backgroundColor: "#e6f0ff"}}>
        <h2>GRC Risk Tool</h2>
        <nav>
            <Link to="/" style={{marginRight: "15px"}}>Dashboard</Link>
            <Link to ="/add-risk">Add Risk</Link>
        </nav>
        <hr/>
    </div>
  )
}

export default Navbar