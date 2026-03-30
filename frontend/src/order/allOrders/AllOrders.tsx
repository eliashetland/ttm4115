import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../../api/ApiClient";
import type { IOrder } from "../../api/models/IOrder";
import styles from "./AllOrders.module.css";

export const AllOrders = () => {
  const { data: orders } = useQuery({
    queryKey: ["order"],
    queryFn: () => ApiClient.get<IOrder[]>("/order"),
  });

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Address</th>
          <th>Zip</th>
          <th>City</th>
          <th>Size(cm)</th>
          <th>Weight(kg)</th>
        </tr>
      </thead>
      <tbody>
        {orders?.map((order) => (
          <tr key={order.id}>
            <td>
              <a href={`/orders/${order.id}`}>{order.id}</a>
            </td>
            <td>{order.firstName}</td>
            <td>{order.lastName}</td>
            <td>{order.address}</td>
            <td>{order.zip}</td>
            <td>{order.city}</td>
            <td>
              {order.length}x{order.width}x{order.height}
            </td>
            <td>{order.weight}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
