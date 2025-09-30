import React, { useContext, useMemo, useState } from "react";
import { ContextData } from "../../DataProvider";
import { Link } from "react-router-dom";

const Tab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
    }`}
  >
    {children}
    {typeof count === "number" && (
      <span
        className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const Card = ({ emp }) => (
  <Link
    key={String(emp._id)}
    to={`/employees/${encodeURIComponent(String(emp._id))}`}
    target="_blank"
    rel="noopener noreferrer"
    state={{ prefetched: emp }}
    className="block bg-white shadow-lg rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition duration-300"
    title="Open full profile in new tab"
  >
    <img
      src={emp.photo}
      alt={emp.fullName}
      className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border"
    />
    <h2 className="text-lg font-bold text-gray-800 text-center">{emp.fullName}</h2>
    <p className="text-sm text-gray-500 text-center mb-2">{emp.designation || "—"}</p>

    <div className="flex justify-center gap-2 mb-2">
      <span
        className={`px-2 py-0.5 rounded-full text-xs ${
          String(emp.status).toLowerCase() === "de-activate"
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {emp.status || "Active"}
      </span>
      {emp.eid && (
        <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
          EID: {emp.eid}
        </span>
      )}
    </div>

    <div className="text-sm text-gray-700 space-y-1 text-center">
      <p><span className="font-semibold">Phone:</span> {emp.phoneNumber || "—"}</p>
      <p><span className="font-semibold">Blood Group:</span> {emp.bloodGroup || "—"}</p>
    </div>
  </Link>
);

const Empty = ({ label }) => (
  <div className="col-span-full">
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <div className="text-slate-700 font-medium">{label}</div>
      <div className="text-slate-500 text-sm mt-1">Try adjusting your search.</div>
    </div>
  </div>
);

const EmployeeList = () => {
  const { employeeList, setSearchEmployee } = useContext(ContextData);
  const [tab, setTab] = useState("active"); // 'active' | 'deactivated'

  const { activeEmployees, deactivatedEmployees } = useMemo(() => {
    const arr = Array.isArray(employeeList) ? employeeList : [];
    const deact = arr.filter(
      (e) => String(e.status || "").toLowerCase() === "de-activate"
    );
    const act = arr.filter(
      (e) => String(e.status || "").toLowerCase() !== "de-activate"
    );
    return { activeEmployees: act, deactivatedEmployees: deact };
  }, [employeeList]);

  const listToShow = tab === "active" ? activeEmployees : deactivatedEmployees;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Employee List</h1>

        <div className="flex items-center gap-2">
          <Tab
            active={tab === "active"}
            onClick={() => setTab("active")}
            count={activeEmployees.length}
          >
            Active
          </Tab>
          <Tab
            active={tab === "deactivated"}
            onClick={() => setTab("deactivated")}
            count={deactivatedEmployees.length}
          >
            De-activated
          </Tab>
        </div>
      </div>

      {/* Search & Add */}
      <section className="mb-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder={`Search ${tab === "active" ? "active" : "de-activated"} employees…`}
            className="bg-gray-100 rounded-lg p-2 w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
            onChange={(e) => setSearchEmployee(e.target.value)}
          />
          <Link to="/employee-registration" className="btn bg-[#6E3FF3] text-white">
            Add employee
          </Link>
        </div>
      </section>

      {/* Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listToShow.length === 0 ? (
            <Empty
              label={
                tab === "active"
                  ? "No active employees found."
                  : "No de-activated employees found."
              }
            />
          ) : (
            listToShow.map((emp) => <Card key={String(emp._id)} emp={emp} />)
          )}
        </div>
      </section>
    </div>
  );
};

export default EmployeeList;
