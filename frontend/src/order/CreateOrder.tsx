import { useState } from "react";
import styles from "./CreateOrder.module.css";
import { createEmptyOrder, type ICreateOrderResponse, type IOrderInsert } from "../api/models/IOrder";
import { ApiClient } from "../api/ApiClient";
import { AllOrders } from "./allOrders/AllOrders";

export const CreateOrder = () => {
  const [formData, setFormData] = useState<IOrderInsert>(createEmptyOrder());
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  const [orderResult, setOrderResult] = useState<ICreateOrderResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderResult(null);

    const address = `${formData.address}, ${formData.zip} ${formData.city}`;

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${import.meta.env.VITE_MAPBOX_API_KEY}`,
    );

    const data = await res.json();

    if (!data.features?.length) {
      alert("No location found");
      return;
    }

    const [lng, lat] = data.features[0].center;

    setCoordinates({ lat, lng });

    // Get delivery time estimate
    // TODO: Is there suppose to be more than deliveryTime in the result?
    const timeRes: { deliveryTime: number } = await ApiClient.post("/order/estimate-time", [], { latitude: lat, longitude: lng });
    setDeliveryTime(timeRes.deliveryTime);

    try {
      const created = await ApiClient.post<ICreateOrderResponse>("/order", ["order"], {
        ...formData,
        target: { latitude: lat, longitude: lng, description: address },
      });
      console.log("Created order", created);
      setOrderResult(created);
      setFormData(createEmptyOrder());
    } catch (err) {
      alert("Failed to create order");
      console.error("Failed to create order", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.name}>
            <h2>Sender</h2>
            <label>
              Name
              <input
                type="text"
                name="sender"
                placeholder="Enter sender name"
                value={formData.sender}
                onChange={handleChange}
              />
            </label>
          </section>

          <section className={styles.receiver}>
            <h2>Receiver</h2>
            <label>
              First Name
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </label>
          </section>

          <section className={styles.address}>
            <h2>Address</h2>
            <label className={styles.addressLbl}>
              Address
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                autoComplete="street-address"
                value={formData.address}
                onChange={handleChange}
              />
            </label>
            <label className={styles.zip}>
              Postal Code
              <input
                type="text"
                name="zip"
                placeholder="Enter zip code"
                autoComplete="postal-code"
                value={formData.zip}
                onChange={handleChange}
              />
            </label>
            <label className={styles.city}>
              Town or city
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
              />
            </label>
          </section>

          <section className={styles.package}>
            <h2>Package</h2>
            <label>
              Length (cm)
              <input
                type="number"
                name="length"
                placeholder="Enter length"
                value={formData.length}
                onChange={handleNumberChange}
              />
            </label>
            <label>
              Width (cm)
              <input
                type="number"
                name="width"
                placeholder="Enter width"
                value={formData.width}
                onChange={handleNumberChange}
              />
            </label>
            <label>
              Height (cm)
              <input
                type="number"
                name="height"
                placeholder="Enter height"
                value={formData.height}
                onChange={handleNumberChange}
              />
            </label>

            <label>
              Weight (kg)
              <input
                type="number"
                name="weight"
                placeholder="Enter weight"
                value={formData.weight}
                onChange={handleNumberChange}
              />
            </label>
          </section>

          <button type="submit">Create order</button>
        </form>

        {coordinates && deliveryTime && (
          <div className={styles.deliveryInfo}>
            <h3>Delivery Information</h3>
            <p>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
            <p>Estimated delivery time: {Math.ceil(deliveryTime * 60)} minutes</p>
          </div>
        )}

        {orderResult && (
          <div
            className={`${styles.deliveryInfo} ${orderResult.deliveryMethod === "car" ? styles.warning : styles.success}`}
          >
            <h3>
              {orderResult.deliveryMethod === "car"
                ? "Order created — delivery by car"
                : "Order created — drone delivery queued"}
            </h3>
            <p>Order #{orderResult.order.id}</p>
            <p>Estimated time: {orderResult.order.deliveryTime} minutes</p>
            {orderResult.notice && <p>{orderResult.notice}</p>}
          </div>
        )}

        <div className={styles.orders}>
          <h3>All Orders</h3>
          <div className={styles.allOrders}>
            <AllOrders />
          </div>
        </div>
      </div>
    </div>
  );
};
