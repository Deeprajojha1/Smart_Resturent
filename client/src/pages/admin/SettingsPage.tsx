import SectionShell from "../../components/admin/SectionShell";

const SettingsPage = () => {
  return (
    <SectionShell title="Settings" subtitle="Restaurant Profile">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Profile Settings
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Form placeholder (name, location, plan, hours)
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Quick Tips
          </h4>
          <div className="mt-4 text-sm text-[#6B5C46]">
            Keep your hours updated to optimize order accuracy.
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default SettingsPage;
