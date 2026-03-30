import { useState } from "react";
import styles from "./CreateOrder.module.css";
import { createEmptyOrder, type IOrderInsert } from "../api/models/IOrder";
import { ApiClient } from "../api/ApiClient";
import { AllOrders } from "./allOrders/AllOrders";
export const CreateOrder = () => {
  const [formData, setFormData] = useState<IOrderInsert>(createEmptyOrder());

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

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    ApiClient.post("/order", ["order"], formData)
      .then((createdOrder) => {
        console.log("Created order", createdOrder);
        setFormData(createEmptyOrder());
      })
      .catch((err) => {
        alert("Failed to create order");
        console.error("Failed to create order", err);
      });
    console.log(formData);
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
