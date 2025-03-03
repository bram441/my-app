import { useState } from "react";
import SearchEngine from "../components/SearchEngine";
import AddForm from "../components/AddForm";
import NavigationBar from "../components/NavigationBar";

const ToevoegenEten = () => {
  const [selectedFood, setSelectedFood] = useState(null);

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        {/* Left Side: Search Engine */}
        <SearchEngine onSelectFood={setSelectedFood} />

        {/* Right Side: Add Form */}
        <AddForm selectedFood={selectedFood} />
      </div>
    </div>
  );
};

export default ToevoegenEten;
