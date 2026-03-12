// components/LogoutButton.jsx
"use client";

import { logout } from "@/actions/logout";

export function LogoutButton() {
  const handleLogout = async () => {
    // Notify all other tabs BEFORE logging out
    const channel = new BroadcastChannel("auth");
    channel.postMessage("logout");
    channel.close();

    await logout(); // Your server action
  };

  return <button onClick={handleLogout}>Logout</button>;
}