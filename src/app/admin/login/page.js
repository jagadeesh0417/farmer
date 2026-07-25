"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiStar } from "react-icons/fi";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid credentials");
      }
      toast.success("Welcome back, admin!");
      router.push("/admin");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold mb-1">
            <FiStar className="text-primary" /> ARHUU
          </Link>
          <p className="text-text-muted text-sm">Admin Login</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-light border border-border rounded-lg px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors">
            <FiArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
