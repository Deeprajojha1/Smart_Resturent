import useCurrentUser from "../../customhooks/useCurrentUser";

const VendorPortal = () => {
  const { user } = useCurrentUser();

  return (
    <div>
      <h1>Hello Vendor</h1>
      <p>Role: {user?.role ?? "unknown"}</p>
    </div>
  );
};

export default VendorPortal;
