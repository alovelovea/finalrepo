import Commercial from "./components/Commercial";
import Login from "./components/Login";
import "./css/LoginPage.css";

export default function LoginPage() {
  return (
    <div className="login-wrap">
      <Commercial className="panel" />
      <div className="auth-col">
        <Login />
        <div className="signup-link">
          
        </div>
      </div>
    </div>
  );
}
