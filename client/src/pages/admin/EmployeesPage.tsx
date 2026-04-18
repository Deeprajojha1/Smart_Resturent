import { useEffect, useMemo, useState } from "react";
import { FiLoader, FiSave, FiSearch, FiUserPlus } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import useCurrentUser from "../../customhooks/useCurrentUser";
import {
  createEmployee,
  getEmployees,
  getUsers,
  updateEmployee,
  type Employee,
  type AdminUser,
  type EmployeeUpdateInput,
  type EmployeeCreateInput,
} from "../../services/adminService";

type EmployeeFormState = {
  role: EmployeeUpdateInput["role"];
  salary: string;
  joiningDate: string;
  isActive: boolean;
};

type EmployeeCreateFormState = {
  userId: string;
  role: EmployeeCreateInput["role"];
  salary: string;
  joiningDate: string;
  isActive: boolean;
};

const roles: Array<NonNullable<EmployeeUpdateInput["role"]>> = [
  "cashier",
  "manager",
  "admin",
  "inventory",
  "vendor",
];

const getUserId = (user: AdminUser) => user._id ?? user.id ?? "";

const toDateInputValue = (date?: string) => {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
};

const createFormState = (employee: Employee): EmployeeFormState => ({
  role: employee.role as EmployeeUpdateInput["role"],
  salary: String(employee.salary ?? ""),
  joiningDate: toDateInputValue(employee.joiningDate),
  isActive: employee.isActive !== false,
});

const createInitialEmployeeCreateForm = (): EmployeeCreateFormState => ({
  userId: "",
  role: "manager",
  salary: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  isActive: true,
});

const EmployeesPage = () => {
  const itemsPerPage = 5;
  const [refreshKey, setRefreshKey] = useState(0);
  const { user: currentUser } = useCurrentUser();
  const { data: employees, loading, error } = useAdminResource(
    getEmployees,
    [refreshKey]
  );
  const { data: users } = useAdminResource(getUsers, [refreshKey]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState | null>(null);
  const [createForm, setCreateForm] = useState<EmployeeCreateFormState>(
    createInitialEmployeeCreateForm()
  );
  const [creatingEmployee, setCreatingEmployee] = useState(false);
  const [createEmployeeError, setCreateEmployeeError] = useState<string | null>(null);
  const [createEmployeeSuccess, setCreateEmployeeSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const eligibleUsers = (users ?? []).filter(
    (user: AdminUser) =>
      !!getUserId(user) &&
      !((employees ?? []).some((employee) => employee.userId?.email === user.email))
  );
  const assignedUsers = (users ?? []).filter((user: AdminUser) => {
    if (!currentUser?.restaurantId) {
      return false;
    }

    const assignedRestaurantId =
      typeof user.restaurantId === "string"
        ? user.restaurantId
        : user.restaurantId?._id;

    const isAssignedHere =
      String(assignedRestaurantId ?? "") ===
      String(currentUser.restaurantId);

    const alreadyEmployee = (employees ?? []).some(
      (employee) => employee.userId?.email === user.email
    );

    return isAssignedHere && !alreadyEmployee;
  });

  const filteredEmployees = useMemo(() => {
    return (employees ?? []).filter((employee) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const searchableText = [
        employee.userId?.name,
        employee.userId?.email,
        employee.role,
        String(employee.salary),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesRole = roleFilter === "all" || employee.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.isActive !== false) ||
        (statusFilter === "inactive" && employee.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, roleFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / itemsPerPage));

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredEmployees]);

  useEffect(() => {
    if (!selectedEmployee && employees?.length) {
      setSelectedEmployee(employees[0]);
      setForm(createFormState(employees[0]));
    }
  }, [employees, selectedEmployee]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, refreshKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectedEmployee || !employees) {
      return;
    }

    const freshEmployee = employees.find(
      (employee) => employee._id === selectedEmployee._id
    );

    if (freshEmployee) {
      setSelectedEmployee(freshEmployee);
      setForm(createFormState(freshEmployee));
    }
  }, [employees, selectedEmployee]);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setForm(createFormState(employee));
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!selectedEmployee || !form) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const updated = await updateEmployee(selectedEmployee._id, {
        role: form.role,
        salary: Number(form.salary),
        joiningDate: form.joiningDate,
        isActive: form.isActive,
      });

      setSelectedEmployee({
        ...selectedEmployee,
        ...updated,
        userId: selectedEmployee.userId,
      });
      setRefreshKey((key) => key + 1);
    } catch (updateError) {
      setSaveError(
        updateError instanceof Error
          ? updateError.message
          : "Employee could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!createForm.userId) {
      setCreateEmployeeError("Please select a user.");
      return;
    }

    if (!createForm.salary || Number(createForm.salary) <= 0) {
      setCreateEmployeeError("Please enter a valid salary.");
      return;
    }

    setCreatingEmployee(true);
    setCreateEmployeeError(null);
    setCreateEmployeeSuccess(null);

    try {
      await createEmployee({
        userId: createForm.userId,
        role: createForm.role,
        salary: Number(createForm.salary),
        joiningDate: createForm.joiningDate,
        isActive: createForm.isActive,
      });

      setCreateEmployeeSuccess("Employee created successfully.");
      setCreateForm(createInitialEmployeeCreateForm());
      setRefreshKey((key) => key + 1);
    } catch (creationError) {
      setCreateEmployeeError(
        creationError instanceof Error
          ? creationError.message
          : "Employee could not be created."
      );
    } finally {
      setCreatingEmployee(false);
    }
  };

  return (
    <SectionShell title="Employees" subtitle="Team Overview">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="rounded-lg border border-[#E4DCCF] bg-[#FFF7F2] p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-[#2A241B]">
                Assigned Users Not Yet in Employees
              </h4>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                {assignedUsers.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {assignedUsers.length ? (
                assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-[#F1D8C7] bg-white px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-[#2A241B]">{user.name}</p>
                      <p className="text-xs text-[#8A7A62]">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-[#F7F1E8] px-2 py-1 text-xs font-semibold capitalize text-[#6B5C46]">
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8A7A62]">
                  No assigned users pending employee creation.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
            <h4 className="text-lg font-semibold text-[#2A241B]">Add Employee</h4>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block text-sm md:col-span-2">
                <span className="font-medium text-[#2A241B]">Select User</span>
                <select
                  value={createForm.userId}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, userId: event.target.value }))
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                >
                  <option value="">Choose a user</option>
                  {eligibleUsers.map((user: AdminUser) => (
                    <option key={getUserId(user)} value={getUserId(user)}>
                      {user.name} - {user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Role</span>
                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role: event.target.value as EmployeeCreateFormState["role"],
                    }))
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Salary</span>
                <input
                  type="number"
                  min="0"
                  value={createForm.salary}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, salary: event.target.value }))
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Joining Date</span>
                <input
                  type="date"
                  value={createForm.joiningDate}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, joiningDate: event.target.value }))
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>

              <label className="flex items-center gap-3 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-[#E0D5C3]"
                />
                <span className="font-medium text-[#2A241B]">Active employee</span>
              </label>
            </div>

            {createEmployeeError && (
              <p className="mt-3 text-sm text-[#9B3F2C]">{createEmployeeError}</p>
            )}
            {createEmployeeSuccess && (
              <p className="mt-3 text-sm text-[#3F6F5B]">{createEmployeeSuccess}</p>
            )}

            <button
              onClick={handleCreateEmployee}
              disabled={creatingEmployee}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
            >
              {creatingEmployee ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating...
                </>
              ) : (
                <>
                  <FiUserPlus className="h-4 w-4" aria-hidden="true" />
                  Create Employee
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Staff Directory
            </h4>
            <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
              {filteredEmployees.length} / {employees?.length ?? 0} employees
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <label className="block text-sm">
              <span className="sr-only">Search employees</span>
              <div className="relative h-10">
                <span className="pointer-events-none absolute left-4 top-0 flex h-10 items-center justify-center">
                  <FiSearch className="h-4 w-4 text-[#8A7A62]" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, role, salary"
                  className="h-full w-full rounded-lg border border-[#E0D5C3] bg-white pl-12 pr-4 text-[#2A241B] placeholder:text-[#8A7A62]"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="sr-only">Filter by role</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
              >
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <div className="mt-4 overflow-x-auto">
            <ResourceState
              loading={loading}
              error={error}
              empty={!filteredEmployees.length}
              emptyMessage={
                employees?.length
                  ? "No employees match your search or filters."
                  : "No employees found."
              }
            />
            {!!filteredEmployees.length && (
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                  <tr>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Salary</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE4D5] text-[#2A241B]">
                  {paginatedEmployees.map((employee) => {
                    const isSelected = selectedEmployee?._id === employee._id;

                    return (
                      <tr
                        key={employee._id}
                        onClick={() => handleSelectEmployee(employee)}
                        className={`cursor-pointer transition hover:bg-[#F9F4EC] ${
                          isSelected ? "bg-[#F9F4EC]" : ""
                        }`}
                      >
                        <td className="py-3 pr-4 font-medium">
                          {employee.userId?.name ?? "-"}
                        </td>
                        <td className="py-3 pr-4">
                          {employee.userId?.email ?? "-"}
                        </td>
                        <td className="py-3 pr-4">{employee.role}</td>
                        <td className="py-3 pr-4">₹{employee.salary}</td>
                        <td className="py-3">
                          {employee.isActive === false ? "Inactive" : "Active"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!!filteredEmployees.length && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm text-[#6B5C46]">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Employee Details
          </h4>

          {!selectedEmployee || !form ? (
            <p className="mt-4 text-sm text-[#8A7A62]">
              Click an employee row to view and edit details.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm">
                <p className="font-semibold text-[#2A241B]">
                  {selectedEmployee.userId?.name ?? "-"}
                </p>
                <p className="mt-1 text-[#6B5C46]">
                  {selectedEmployee.userId?.email ?? "-"}
                </p>
              </div>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Role</span>
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value as EmployeeFormState["role"],
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Salary</span>
                <input
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={(event) =>
                    setForm({ ...form, salary: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-[#2A241B]">Joining Date</span>
                <input
                  type="date"
                  value={form.joiningDate}
                  onChange={(event) =>
                    setForm({ ...form, joiningDate: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({ ...form, isActive: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#E0D5C3]"
                />
                <span className="font-medium text-[#2A241B]">Active employee</span>
              </label>

              {saveError && <p className="text-sm text-[#9B3F2C]">{saveError}</p>}

              <button
                onClick={handleSave}
                disabled={saving || !form.role || !form.salary}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-sm font-semibold text-[#F7F1E8] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" aria-hidden="true" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

export default EmployeesPage;
