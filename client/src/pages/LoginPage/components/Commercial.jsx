import "./css/Commercial.css";
import refLogin from "../../../image/ref_login.png";

export default function Commercial({ className = "" }) {
  return (
    <aside className={`commercial ${className}`}>
      <h3 className="subtitle">What's in My Fridge?</h3>
      <h2 className="title">
        냉장고 속 재료를 자동으로 인식하고,<br />나만의 레시피를 만들어보세요!
      </h2>

      <p className="desc">
        “AI로 재료를 자동 인식하고 레시피를 추천받으세요.<br />
        재료를 수기로 관리하거나 쇼핑 리스트도 만들 수 있어요.”
      </p>

      <div className="poster">
        <img
          src={refLogin}
          alt="냉장고 아이콘"
          className="poster-img"
        />
      </div>
    </aside>
  );
}
