import { redirect } from "react-router-dom";

export const authProvider = {
  isAuthenticated: () => !!localStorage.getItem("token"),
};

export const authProtect = () => {
  console.log("authProtect called", authProvider.isAuthenticated());
  if (!authProvider.isAuthenticated()) throw redirect("/login");
  return null;
}