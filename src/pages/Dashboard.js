import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Daily from "../components/Daily";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <h2>Welcome, {user?.username}!</h2>
      <p>Email: {user?.email}</p>

      <Daily />
    </div>
  );
};

export default Dashboard;
