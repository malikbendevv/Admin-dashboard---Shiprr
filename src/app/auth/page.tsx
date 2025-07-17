"use client";

import api from "@/lib/axiosInstance";
import { useState } from "react";

export default function Auth() {
  const [user, setUser] = useState("");
  const [error] = useState("");

  console.log({ user });

  return (
    <div className="flex gap-5">
      {error && <p>{error}</p>}

      <button
        className="cursor-pointer"
        onClick={() =>
          api
            .post("/users", {
              email: "test7@gmail.com",
              password: "malikK8*",
              firstName: "malik5",
              lastName: "ben5",
              role: "driver",
              phoneNumber: "+213000007",
            })
            .then((res) => setUser(res.data))
            .catch((err) => {
              console.log(err.response.data);
              // setError(err);
            })
        }
      >
        Create a user
      </button>
      <button
        className="cursor-pointer"
        onClick={() =>
          api
            .post("/auth/login", {
              email: "test@gmail.com",
              password: "malikK8*",
            })
            .then((res) => setUser(res.data))
            .catch((err) => {
              console.log(err);
              // setError(err);
            })
        }
      >
        Login
      </button>
      <button
        className="cursor-pointer"
        onClick={() =>
          api
            .post("/auth/logout")
            .then((res) => setUser(res.data))
            .catch((err) => {
              console.log(err.response.data);
              // setError(err);
            })
        }
      >
        Logout
      </button>
      <button
        className="cursor-pointer"
        onClick={() =>
          api
            .get("/auth/test-guard")
            .then((res) => console.log("Guard tested successfully", { res }))
            .catch((err) => {
              console.log("test guard error", err.response.data);
              // setError(err);
            })
        }
      >
        Test guard
      </button>
    </div>
  );
}
