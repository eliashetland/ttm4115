import { useState } from "react";
import styles from "./CreateOrder.module.css";
import { createEmptyOrder, type IOrderInsert } from "../api/models/IOrder";
import { ApiClient } from "../api/ApiClient";
import { AllOrders } from "./allOrders/AllOrders";

const MAX_WEIGHT_KG = 35;
const MAX_DIM_CM = 200;

export const CreateOrder = () => {
  const [formData, setFormData] = useState<IOrderInsert>(createEmptyOrder());
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);

  const errors = {
    weight: formData.weight > MAX_WEIGHT_KG ? `Max weight is ${MAX_WEIGHT_KG} kg` : null,
    length: formData.length > MAX_DIM_CM ? `Max length is ${MAX_DIM_CM} cm` : null,
    width:  formData.width  > MAX_DIM_CM ? `Max width is ${MAX_DIM_CM} cm`  : null,
    height: formData.height > MAX_DIM_CM ? `Max height is ${MAX_DIM_CM} cm` : null,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = Number(value);
    setFormData((prev) => ({ ...prev, [name]: num }));

    if (name === "weight" && num > MAX_WEIGHT_KG) {
      alert(`Weight cannot exceed ${MAX_WEIGHT_KG} kg. Please enter a smaller value.`);
    }
    if ((name === "length" || name === "width" || name === "height") && num > MAX_DIM_CM) {
      alert(`${name.charAt(0).toUpperCase() + name.slice(1)} cannot exceed ${MAX_DIM_CM} cm. Please enter a smaller value.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (hasErrors) {
      const messages = Object.values(errors).filter(Boolean).join("\n");
      alert(`Cannot create order:\n${messages}`);
      return;
    }

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

    const timeRes: { deliveryTime: number } = await ApiClient.post("/order/estimate-time", [], { latitude: lat, longitude: lng });
    setDeliveryTime(timeRes.deliveryTime);

    ApiClient.post("/order", ["order"], {
      ...formData,
      target: { latitude: lat, longitude: lng, description: address },
    })
      .then((createdOrder) => {
        console.log("Created order", createdOrder);
        setFormData(createEmptyOrder());
        setCoordinates(null);
        setDeliveryTime(null);
      })
      .catch((err) => {
        alert("Failed to create order");
        console.error("Failed to create order", err);
      });
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
            <h2>Package <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#666" }}>Max: {MAX_DIM_CM}×{MAX_DIM_CM}×{MAX_DIM_CM} cm, {MAX_WEIGHT_KG} kg</span></h2>
            <label>
              Length (cm)
              <input
                type="number"
                name="length"
                placeholder="Enter length"
                value={formData.length}
                onChange={handleNumberChange}
                style={errors.length ? { borderColor: "red" } : undefined}
              />
              {errors.length && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.length}</span>}
            </label>
            <label>
              Width (cm)
              <input
                type="number"
                name="width"
                placeholder="Enter width"
                value={formData.width}
                onChange={handleNumberChange}
                style={errors.width ? { borderColor: "red" } : undefined}
              />
              {errors.width && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.width}</span>}
            </label>
            <label>
              Height (cm)
              <input
                type="number"
                name="height"
                placeholder="Enter height"
                value={formData.height}
                onChange={handleNumberChange}
                style={errors.height ? { borderColor: "red" } : undefined}
              />
              {errors.height && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.height}</span>}
            </label>
            <label>
              Weight (kg)
              <input
                type="number"
                name="weight"
                placeholder="Enter weight"
                value={formData.weight}
                onChange={handleNumberChange}
                style={errors.weight ? { borderColor: "red" } : undefined}
              />
              {errors.weight && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.weight}</span>}
            </label>
          </section>

          <button type="submit" disabled={hasErrors}>
            Create order
          </button>
        </form>

        {coordinates && deliveryTime && (
          <div className={styles.deliveryInfo}>
            <h3>Delivery Information</h3>
            <p>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</p>
            <p>Estimated delivery time: {Math.ceil(deliveryTime * 60)} minutes</p>
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
