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
import Recipes from "./pages/Recipes";
import AddRecipe from "./pages/AddRecipe";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import useAuth from "./api/useAuth";
import { ClipLoader } from "react-spinners"; // Import the spinner component
import "./App.css";
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader size={50} color={"#123abc"} loading={loading} />
      </div>
    ); // Or any other spinner component
  }

  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { role } = useAuth();
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader size={50} color={"#123abc"} loading={loading} />
      </div>
    ); // Or any other spinner component
  }

  if (role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

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
          path="/recipes"
          element={
            <PrivateRoute>
              <Recipes />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-recipe"
          element={
            <PrivateRoute>
              <AddRecipe />
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
        <Route
          path="*"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
