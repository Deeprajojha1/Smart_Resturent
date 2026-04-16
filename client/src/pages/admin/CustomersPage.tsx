import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getCustomerSnapshots } from "../../services/adminService";

const CustomersPage = () => {
  const { data: customers, loading, error } =
    useAdminResource(getCustomerSnapshots);
  const selected = customers?.[0];

  return (
    <SectionShell title="Customers" subtitle="CRM Insights">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Customer Directory
          </h4>
          <div className="mt-4 space-y-3">
            <ResourceState
              loading={loading}
              error={error}
              empty={!customers?.length}
              emptyMessage="No online order customers found."
            />
            {customers?.map((customer) => (
              <div
                key={customer.email ?? customer.phone ?? customer.name}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2A241B]">
                    {customer.name}
                  </span>
                  <span className="text-[#8A7A62]">₹{customer.totalSpend}</span>
                </div>
                <p className="mt-2 text-[#6B5C46]">
                  {customer.phone ?? customer.email ?? "No contact"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Profile Preview
          </h4>
          {selected ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B5C46]">Name</span>
                <span className="font-medium text-[#2A241B]">{selected.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5C46]">Orders</span>
                <span className="font-medium text-[#2A241B]">{selected.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5C46]">Total spend</span>
                <span className="font-medium text-[#2A241B]">
                  ₹{selected.totalSpend}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#8A7A62]">No customer selected.</p>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

export default CustomersPage;
