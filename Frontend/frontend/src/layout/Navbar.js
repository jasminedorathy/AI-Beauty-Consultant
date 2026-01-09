import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <div style={{
      height: "60px",
      background: "#111827",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px"
    }}>
      <h3>AI Beauty Consultant</h3>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Navbar;
