import useCurrentUser from "../../customhooks/useCurrentUser";

const AdminDashboard = () => {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1>Hello Admin</h1>
      <p>Role: {user?.role ?? "unknown"}</p>
    </div>
  );
};

export default AdminDashboard;
