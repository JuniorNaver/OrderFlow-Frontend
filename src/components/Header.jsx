import { Link } from "react-router-dom";

function Header() {
  return (
    <header style={{ background: "#f5f5f5", padding: "10px" }}>
      <nav>
        <Link to="/" style={{ marginRight: "15px" }}>Home</Link>
        <Link to="/login" style={{ marginRight: "15px" }}>Login</Link>
        <Link to="/pr" style={{ marginRight: "15px" }}>PR</Link>
        <Link to="/po" style={{ marginRight: "15px" }}>PO</Link>
        <Link to="/gr" style={{ marginRight: "15px" }}>GR</Link>
        <Link to="/stk" style={{ marginRight: "15px" }}>STK</Link>
        <Link to="/sd" style={{ marginRight: "15px" }}>SD</Link>
        <Link to="/bi">BI</Link>
      </nav>
    </header>
  );
}

export default Header;
