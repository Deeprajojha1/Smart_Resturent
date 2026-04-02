import useCurrentUser from "../../customhooks/useCurrentUser";

const CashierPOS = () => {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1>Hello Cashier</h1>
      <p>Role: {user?.role ?? "unknown"}</p>
    </div>
  );
};

export default CashierPOS;
