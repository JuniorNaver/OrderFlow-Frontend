import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>❌ 페이지를 찾을 수 없습니다.</h2>
      <p>잘못된 주소를 입력했거나, 페이지가 삭제되었을 수 있습니다.</p>
      <Link to="/">홈으로 돌아가기</Link>
    </div>
  );
}

export default NotFound;
