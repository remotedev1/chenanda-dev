"use client";

import { logout } from "@/actions/logout";

export const LogoutButton = ({ children }) => {
  const onClick = () => {
    logout();
  };

  return (
    <span onClick={onClick} className="cursor-pointer text-red-500 hover:text-red-800 focus:bg-red-50">
      {children}
    </span>
  );
};
