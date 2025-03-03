import { useState } from "react";
import SearchEngine from "../components/SearchEngine";
import AddForm from "../components/AddForm";
import NavigationBar from "../components/NavigationBar";
import "../components/css/toevoegenEten.css";

const ToevoegenEten = () => {
  const [selectedFood, setSelectedFood] = useState(null);

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div className="toevoegen-container">
        {/* Left Side: Search Engine */}
        <div className="left-section">
          <SearchEngine onSelectFood={setSelectedFood} />
        </div>

        {/* Right Side: Add Form */}
        <div className="right-section">
          <AddForm selectedFood={selectedFood} />
        </div>
      </div>
    </div>
  );
};

export default ToevoegenEten;
