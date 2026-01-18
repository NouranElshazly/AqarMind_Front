import { Link } from "react-router-dom";
import "../styles/StatsCard.css";

const StatsCard = ({ title, value, icon, link }) => {
  return (
    <Link to={link} className="tenant-stats-card">
      <div className="card-content">
        <div className="card-icon">{icon}</div>
        <div className="card-text">
          <h3>{title}</h3>
          <p className="value">{value}</p>
        </div>
      </div>
    </Link>
  );
};

export default StatsCard;
