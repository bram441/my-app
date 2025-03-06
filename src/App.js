import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ToevoegenEten from "./pages/ToevoegenEten";
import ToevoegenEtenDB from "./pages/ToevoegenEtenDB";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import useAuth from "./api/useAuth";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { role } = useAuth();

  if (role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/Toevoegen"
          element={
            <PrivateRoute>
              <ToevoegenEten />
            </PrivateRoute>
          }
        />
        <Route
          path="/DBChanges"
          element={
            <AdminRoute>
              <ToevoegenEtenDB />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
