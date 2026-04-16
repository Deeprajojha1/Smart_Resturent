import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getNotifications } from "../../services/adminService";

const NotificationsPage = () => {
  const { data: notifications, loading, error } =
    useAdminResource(getNotifications);
  const selected = notifications?.[0];

  return (
    <SectionShell title="Notifications" subtitle="System Inbox">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_2fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">All Alerts</h4>
          <div className="mt-4 space-y-3">
            <ResourceState
              loading={loading}
              error={error}
              empty={!notifications?.length}
              emptyMessage="No notifications found."
            />
            {notifications?.map((notification) => (
              <div
                key={`${notification.source}-${notification.message}`}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold capitalize text-[#2A241B]">
                    {notification.type}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                    {notification.source}
                  </span>
                </div>
                <p className="mt-2 text-[#6B5C46]">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Details Panel
          </h4>
          {selected ? (
            <div className="mt-4 rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm">
              <p className="font-semibold capitalize text-[#2A241B]">
                {selected.type} from {selected.source}
              </p>
              <p className="mt-3 text-[#6B5C46]">{selected.message}</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#8A7A62]">
              Select an alert when notifications are available.
            </p>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

export default NotificationsPage;
