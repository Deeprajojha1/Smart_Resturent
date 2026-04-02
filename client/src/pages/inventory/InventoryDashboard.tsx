import useCurrentUser from "../../customhooks/useCurrentUser";

const InventoryDashboard = () => {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1>Hello Inventory</h1>
      <p>Role: {user?.role ?? "unknown"}</p>
    </div>
  );
};

export default InventoryDashboard;
