"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function ShippingForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success("Shipping details saved");
    if (onSubmit) onSubmit(form);
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-lg bg-surface-light border text-sm text-foreground placeholder-text-dim transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 ${
      errors[field] ? "border-red-500" : "border-border-light"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="John Doe"
          className={inputClass("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className={inputClass("phone")}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Address
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Street, building, landmark..."
          rows={2}
          className={`${inputClass("address")} resize-none`}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-400">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            City
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className={inputClass("city")}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-red-400">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            State
          </label>
          <input
            type="text"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className={inputClass("state")}
          />
          {errors.state && (
            <p className="mt-1 text-xs text-red-400">{errors.state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Pincode
          </label>
          <input
            type="text"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="500001"
            maxLength={6}
            className={inputClass("pincode")}
          />
          {errors.pincode && (
            <p className="mt-1 text-xs text-red-400">{errors.pincode}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg transition-all duration-200 mt-2"
      >
        Save Shipping Details
      </button>
    </form>
  );
}
