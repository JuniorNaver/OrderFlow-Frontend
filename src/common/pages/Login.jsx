import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", username, password);
    // TODO: Auth 서비스 연동
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔐 로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>비밀번호: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" style={{ marginTop: "15px" }}>
          로그인
        </button>
      </form>
    </div>
  );
}

export default Login;
