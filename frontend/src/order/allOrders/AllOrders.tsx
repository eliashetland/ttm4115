import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "../../api/ApiClient";
import type { IOrder } from "../../api/models/IOrder";

export const AllOrders = () => {
  const { data: orders } = useQuery({
    queryKey: ["order"],
    queryFn: () => ApiClient.get<IOrder[]>("/order"),
  });

  return (
    <div>
      <h1>All Orders</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Address</th>
            <th>Zip</th>
            <th>City</th>
            <th>Length</th>
            <th>Width</th>
            <th>Height</th>
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
              <td>{order.length}</td>
              <td>{order.width}</td>
              <td>{order.height}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
