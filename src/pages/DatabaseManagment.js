import NavigationBar from "../components/common/NavigationBar";
import AddFood from "../components/admin_db/AddFood";
const DatabaseManagment = () => {
  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div>
        <AddFood />
      </div>
    </div>
  );
};

export default DatabaseManagment;
