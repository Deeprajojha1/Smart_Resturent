import SectionShell from "../../components/admin/SectionShell";

const OrdersPage = () => {
  return (
    <SectionShell title="POS Orders" subtitle="In-House Sales">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_2fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Live Orders
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Order list placeholder
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Order Details
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Selected order details + payment summary
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default OrdersPage;
