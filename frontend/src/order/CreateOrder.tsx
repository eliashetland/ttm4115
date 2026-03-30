import { useState } from "react";
import styles from "./CreateOrder.module.css";
import type { IOrder } from "../api/models/IOrder";
export const CreateOrder = () => {

    const [formData, setFormData] = useState<IOrder>({
        firstName: "",
        lastName: "",
        address: "",
        zip: "",
        city: "",
        length: 0,
        width: 0,
        height: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: Number(value),
        }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.name}>
          <h2>Name</h2>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="Enter first name"
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Enter last name"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </section>

        <section className={styles.address}>
          <h2>Address</h2>
          <label htmlFor="address">Address</label>
          <input
            type="text"
            name="address"
            id="address"
            placeholder="Enter address"
            autoComplete="street-address"
            value={formData.address}
            onChange={handleChange}
          />
          <label htmlFor="zip">Postal Code</label>
          <input
            type="text"
            name="zip"
            id="zip"
            placeholder="Enter zip code"
            autoComplete="postal-code"
            value={formData.zip}
            onChange={handleChange}
          />
          <label htmlFor="city">Town or city</label>
          <input
            type="text"
            name="city"
            id="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleChange}
          />
        </section>

        <section className={styles.package}>
          <h2>Package</h2>
          <label htmlFor="length">Length (cm)</label>
          <input
            type="number"
            name="length"
            id="length"
            placeholder="Enter length"
            value={formData.length}
            onChange={handleNumberChange}
          />
          <label htmlFor="width">Width (cm)</label>
          <input
            type="number"
            name="width"
            id="width"
            placeholder="Enter width"
            value={formData.width}
            onChange={handleNumberChange}
          />
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            name="height"
            id="height"
            placeholder="Enter height"
            value={formData.height}
            onChange={handleNumberChange}
          />
        </section>

        <button type="submit">Create order</button>
      </form>
    </div>
  );
};
