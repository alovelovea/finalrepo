import Commercial from "./components/Commercial";
import Signup from "./components/Signup";
import "./css/MembershipPage.css";

export default function MembershipPage() {
  return (
    <div className="signup-wrap">
      <Commercial />
      <Signup />
    </div>
  );
}
