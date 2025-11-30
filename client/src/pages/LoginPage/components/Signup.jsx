import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./css/Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [isVegan, setIsVegan] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAllergyChange = (e) => {
    const value = e.target.value;
    setAllergies((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value]
    );
  };

  const handleSignup = async () => {
  
    if (!name || !address || !userId || !password) {
      setError("이름, 주소, ID, PW는 모두 입력해야 합니다.");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/signup/", {
        name,
        address,
        user_id: userId,
        password_2: password,
        allergies,
        is_vegan: isVegan,
      });

      if (res.status === 201) {
        
        localStorage.setItem("user_id", res.data.user_id);
        localStorage.setItem("name", res.data.name);

        navigate("/upload");
      }
    } catch (err) {
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError("서버 오류가 발생했습니다.");
    }
  };

  return (
    <section className="signup-card">
      <h3 className="signup-title">회원가입</h3>

      <div className="signup-body">
        <label className="signup-label">
          이름
          <input
            className="signup-input"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="signup-label">
          주소
          <input
            className="signup-input"
            placeholder="서울특별시 ..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>

        <label className="signup-label">
          ID
          <input
            className="signup-input"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </label>

        <label className="signup-label">
          PW
          <input
            className="signup-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="signup-fieldset">
          <div className="signup-legend">알레르기</div>
          <div className="signup-checkboxes">
            {["계란", "땅콩", "갑각류", "우유", "밀", "대두"].map((a) => (
              <label key={a}>
                <input
                  type="checkbox"
                  value={a}
                  checked={allergies.includes(a)}
                  onChange={handleAllergyChange}
                />{" "}
                {a}
              </label>
            ))}
          </div>
        </div>

        <div className="signup-fieldset">
          <div className="signup-legend">식단</div>
          <div className="signup-radios">
            <label>
              <input
                type="radio"
                name="diet"
                checked={!isVegan}
                onChange={() => setIsVegan(false)}
              />{" "}
              비건이 아닙니다
            </label>
            <label>
              <input
                type="radio"
                name="diet"
                checked={isVegan}
                onChange={() => setIsVegan(true)}
              />{" "}
              비건입니다
            </label>
          </div>
        </div>
      </div>

      <div className="signup-actions">
        <button className="signup-btn" onClick={handleSignup}>
          next
        </button>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <div className="signup-bottom">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </section>
  );
}
