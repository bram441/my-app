import { useState } from "react";
import NavigationBar from "../components/common/NavigationBar";
import AddFood from "../components/admin_db/AddFood";
import FoodManagement from "../components/admin_db/FoodManagement";
import "../components/css/databaseManagement.css";

const DatabaseManagment = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div className="database-management">
        {/* Left: Add Food */}

        <div className="database-section add-food">
          <h2>Add New Food</h2>
          <AddFood />
        </div>

        {/* Right: Food Management */}
        <div className="database-section food-management">
          <h2>Manage Foods</h2>
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FoodManagement searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
};

export default DatabaseManagment;
