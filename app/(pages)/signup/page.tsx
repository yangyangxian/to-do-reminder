"use client";
import React, { useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { YTextField } from "../../components/FormComponents";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setSuccess("Account created! You can now log in.");
        setTimeout(() => router.push("/login"), 1200);
      } else {
        const data = await res.json();
        setError(data.error || "Sign up failed");
      }
    } catch (err) {
      setError("Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary">
      <div className="w-4/5 md:w-2/3 xl:w-5/20 bg-white py-5 px-7 rounded-xl shadow-2xl">
        <div className="mb-6 text-2xl text-center text-secondary">
          Create an Account
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
          <YTextField
            className="bg-white !border-1 !h-11"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {error && <Typography color="error">{error}</Typography>}
          {success && <Typography color="success.main">{success}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={loading}
            fullWidth
            className="!mt-3 !mb-1 !h-11"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>
          <Button  className="!text-[12px] !p-0" color="secondary" variant="text" fullWidth onClick={() => router.push("/login")}>Already have an account? Log in</Button>
        </form>
      </div>
    </div>
  );
}
