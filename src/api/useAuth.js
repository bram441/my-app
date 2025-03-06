import { useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";

const useAuth = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return { role: null };
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return { role: null };
  }

  try {
    const decodedToken = jwtDecode(token);
    return { role: decodedToken.role };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return { role: null };
  }
};

export default useAuth;
