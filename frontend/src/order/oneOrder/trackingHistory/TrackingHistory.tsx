import type { IOrderHistory } from "../../../api/models/IOrder";
import { DateUtils } from "../../../utils/DateUtils";
import styles from "./TrackingHistory.module.css";

interface ITrackingHistoryProps {
  orders: IOrderHistory[];
}
export const TrackingHistory = ({ orders }: ITrackingHistoryProps) => {

  const ordersFiltered = orders.filter((order) => order.type === "status");

  return (
    <div>
      {ordersFiltered.map((order, index) => (
        <div key={index} className={styles.historyItem}>
          <div className={styles.line}>
            <div className={styles.dot} />
          </div>
          <div>
            <h3>{order.message}</h3>
            <p>
              {DateUtils.format(order.createdAt, "EEEE d  MMMM HH:mm")} -{" "}
              {order.location.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
