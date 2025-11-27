import "./css/Login.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // ✅ 저장된 아이디/비밀번호 불러오기
  useEffect(() => {
    const savedId = localStorage.getItem("remember_id");
    const savedPw = localStorage.getItem("remember_pw");
    if (savedId && savedPw) {
      setUserId(savedId);
      setPassword(savedPw);
      setRemember(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        user_id: userId,
        password_2: password,
      });

      // ✅ 토스트 메시지 표시
      setShowToast(true);
      setError("");

      // 사용자 정보 저장 (clear ❌)
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("name", res.data.name);

      // ✅ remember 체크 시 아이디+비밀번호 저장
      if (remember) {
        localStorage.setItem("remember_id", userId);
        localStorage.setItem("remember_pw", password);
      } else {
        localStorage.removeItem("remember_id");
        localStorage.removeItem("remember_pw");
      }

      // ✅ 1초 후 페이지 이동
      setTimeout(() => {
        setShowToast(false);
        navigate("/home");
      }, 1000);
    } catch (err) {
      setShowToast(false);
      if (err.response?.status === 401) setError("비밀번호가 일치하지 않습니다.");
      else if (err.response?.status === 404) setError("존재하지 않는 사용자입니다.");
      else setError("서버 오류가 발생했습니다.");
    }
  };

  return (
    <section className="login-card">
      <h3 className="login-title">로그인</h3>

      <input
        className="login-input"
        placeholder="아이디"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <input
        className="login-input"
        placeholder="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="login-remember">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />{" "}
        자동 로그인
      </label>

      {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

      <button className="login-btn" onClick={handleLogin}>
        로그인
      </button>

      <div className="signup-link">
        <Link to="/signup">회원가입</Link>
      </div>

      {showToast && <div className="toast-message">로그인 성공 🎉</div>}
    </section>
  );
}
