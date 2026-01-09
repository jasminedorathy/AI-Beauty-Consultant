import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
      width: "220px",
      background: "#1f2937",
      color: "white",
      padding: "20px"
    }}>
      <h4>Dashboard</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/analyze">Analyze Face</Link></li>
        <li><Link to="/history">History</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
