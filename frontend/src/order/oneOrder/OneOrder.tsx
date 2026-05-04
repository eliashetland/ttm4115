import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../../api/ApiClient";
import type { IOrder } from "../../api/models/IOrder";
import { useParams } from "react-router-dom";
import styles from "./OneOrder.module.css";
import { TrackingHistory } from "./trackingHistory/TrackingHistory";
import { DroneRoute } from "./map/DroneRoute";
import { DateUtils } from "../../utils/DateUtils";
import { useState } from "react";

export const OneOrder = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { orderId } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ApiClient.get<IOrder>(`/order/${orderId}`),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className={styles.container}>
      <h1>Order Details</h1>

      <div className={styles.blocks}>
        <section className={`${styles.section} ${styles.history}`}>
          <h2 className={styles.header}>History</h2>
          <TrackingHistory orders={order.history} />
        </section>

        <section className={`${styles.section} ${styles.map}`}>
          <h2 className={styles.header}>Drone Route</h2>
          <div className={styles.autoRefresh}>
            <input
              type="checkbox"
              id="auto-refresh"
              name="auto-refresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label htmlFor="auto-refresh">Auto-refresh</label>
          </div>
          <DroneRoute orderHistory={order.history} target={order.target} />
        </section>

        <section className={`${styles.section} ${styles.size}`}>
          <h2 className={styles.header}>Size</h2>
          <label className={styles.label} htmlFor="dimensions">
            Dimensions
            <p className={styles.value}>{order.length} x {order.width} x {order.height} cm</p>
          </label>
          <label className={styles.label} htmlFor="weight">
            Weight
            <p className={styles.value}>{order.weight} kg</p>
          </label>
        </section>

        <section className={`${styles.section} ${styles.details}`}>
          <h2 className={styles.header}>Details</h2>
          <label className={styles.label} htmlFor="id">
            Order ID
            <p className={styles.value}>{order.id}</p>
          </label>
          <label className={styles.label} htmlFor="sender">
            Sender
            <p className={styles.value}>{order.sender}</p>
          </label>
          <label className={styles.label} htmlFor="recipient">
            Recipient
            <p className={styles.value}>{order.firstName} {order.lastName}</p>
            <p className={styles.value}>{order.address}</p>
            <p className={styles.value}>{order.zip} {order.city}</p>
          </label>
          <label className={styles.label} htmlFor="deliveryTime">
            Estimated Delivery Time
            <p className={styles.value}>{DateUtils.timeStringFromMinutes(order.deliveryTime)}</p>
          </label>
        </section>
      </div>
    </div>
  );
};
