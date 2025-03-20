import { useState } from "react";
import SearchEngine from "../components/daily-entry/SearchEngine";
import AddForm from "../components/daily-entry/AddForm";
import NavigationBar from "../components/common/NavigationBar";
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
          <AddForm
            selectedFood={selectedFood}
            setSelectedFood={setSelectedFood}
          />
        </div>
      </div>
    </div>
  );
};

export default ToevoegenEten;
