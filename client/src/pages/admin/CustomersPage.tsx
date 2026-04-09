import SectionShell from "../../components/admin/SectionShell";

const CustomersPage = () => {
  return (
    <SectionShell title="Customers" subtitle="CRM Insights">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Customer Directory
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Table placeholder (name, last visit, total spend)
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Profile Preview
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Recent orders + preference notes
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default CustomersPage;
