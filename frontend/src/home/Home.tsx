import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export const Home = () => {
  return (
    <div className={styles.container}>
      <Link to="/operator">Go to Operator</Link>
      <Link to="/orders">Go to Orders</Link>
    </div>
  );
};
