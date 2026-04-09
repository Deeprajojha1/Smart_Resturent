import SectionShell from "../../components/admin/SectionShell";

const NotificationsPage = () => {
  return (
    <SectionShell title="Notifications" subtitle="System Inbox">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_2fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">All Alerts</h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Notification list
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Details Panel
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Notification detail view
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default NotificationsPage;
