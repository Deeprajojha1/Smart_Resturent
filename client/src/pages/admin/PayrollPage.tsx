import SectionShell from "../../components/admin/SectionShell";

const PayrollPage = () => {
  return (
    <SectionShell title="Payroll" subtitle="Compensation">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Monthly Payroll
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Payroll table placeholder
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Run Summary
          </h4>
          <div className="mt-4 h-24 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Pending approvals + pay button
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default PayrollPage;
