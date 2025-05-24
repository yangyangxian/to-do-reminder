"use client";
import React, { useState } from "react";
import { Button, TextField, CircularProgress, Paper, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { YTextField } from "../../components/FormComponents";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Replace with your real login API call
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Redirect to home or dashboard
        router.push("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="w-5/20 bg-white py-5 px-7 rounded-xl shadow-2xl">
        <div className="mb-6 text-2xl text-center text-secondary">
          Welcome to To Do Reminder
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <YTextField
            className="bg-white !border-1 !h-11"
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            
          />
          <YTextField
            className="bg-white !border-1 !h-11"
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            fullWidth
            className="!mt-3 !mb-1 !h-11"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
          <Button className="!text-[12px] !p-0" color="secondary" variant="text" fullWidth onClick={() => router.push('/signup')}>
            Don't have an account? Sign up
          </Button>
        </form>
      </div>
    </div>
  );
}
