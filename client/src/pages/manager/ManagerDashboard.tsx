import useCurrentUser from "../../customhooks/useCurrentUser";

const ManagerDashboard = () => {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1>Hello Manager</h1>
      <p>Role: {user?.role ?? "unknown"}</p>
    </div>
  );
};

export default ManagerDashboard;
