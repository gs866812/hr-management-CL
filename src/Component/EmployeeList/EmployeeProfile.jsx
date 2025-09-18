import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { PauseCircle, PlayCircle, Clock3, CalendarDays, DollarSign, PiggyBank, Download } from "lucide-react";


import useAxiosProtect from "../../utils/useAxiosProtect";
import { ContextData } from "../../DataProvider";


/* ======================== helpers & constants ======================== */
const tz = "Asia/Dhaka";

const fmtDate = (d) => moment(d).tz(tz).format("YYYY-MM-DD");
const niceDate = (d) =>
  moment(d, ["YYYY-MM-DD", "DD-MMM-YYYY"]).tz(tz).format("DD-MMM-YYYY");

const msToHm = (ms) => {
  const total = Math.max(0, Math.floor((ms || 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h}h ${m}m`;
};

const lateToMinutes = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const h = v.match(/(\d+)\s*h/i);
    const m = v.match(/(\d+)\s*m/i);
    const hours = h ? parseInt(h[1], 10) : 0;
    const mins = m ? parseInt(m[1], 10) : 0;
    return hours * 60 + mins;
  }
  return 0;
};

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

const Badge = ({ tone = "slate", children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${tone}-100 text-${tone}-700`}>
    {children}
  </span>
);

const shiftWindowForDay = (shiftName, day) => {
  const d = moment(day).tz(tz).startOf("day");
  switch ((shiftName || "").toLowerCase()) {
    case "morning":
      return { start: d.clone().hour(6), end: d.clone().hour(14) };   // 6–14
    case "general":
      return { start: d.clone().hour(10), end: d.clone().hour(18) };  // 10–18
    case "evening":
      return { start: d.clone().hour(14), end: d.clone().hour(22) };  // 14–22
    default:
      return { start: d.clone().hour(0), end: d.clone().hour(23).minute(59).second(59) };
  }
};

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm text-gray-800">{value ?? "—"}</span>
  </div>
);

const PencilIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${props.className || ""}`}>
    <path d="M17.414 2.586a2 2 0 00-2.828 0L6.5 10.672V13.5h2.828l8.086-8.086a2 2 0 000-2.828z" />
    <path d="M4 16h12v2H4a2 2 0 01-2-2V4h2v12z" />
  </svg>
);

/* =============================== main =============================== */
const EmployeeProfile = () => {
  const axiosProtect = useAxiosProtect();
  const { user } = useContext(ContextData);
  const { id } = useParams();
  const location = useLocation();

  // if you navigated from list page you can pass prefetched record via state
  const prefetched = location.state?.prefetched;

  const [employee, setEmployee] = useState(prefetched || null);
  const [loading, setLoading] = useState(!prefetched);
  const [error, setError] = useState("");

  // designation
  const [designations, setDesignations] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const isDeactivated = String(employee?.status || "").toLowerCase() === "de-activate";

  // analytics filters
  const [period, setPeriod] = useState("month");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  // data for this employee (period)
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [shiftName, setShiftName] = useState(null);

  // PF/Salary snapshot (from PFAndSalaryCollections)
  const [pfSalary, setPfSalary] = useState(null);

  /* ---------- derive date range from preset ---------- */
  useEffect(() => {
    const now = moment().tz(tz);
    if (period === "today") {
      setStart(now.startOf("day").toDate());
      setEnd(now.endOf("day").toDate());
    } else if (period === "week") {
      setStart(now.startOf("week").toDate());
      setEnd(now.endOf("week").toDate());
    } else if (period === "month") {
      setStart(now.startOf("month").toDate());
      setEnd(now.endOf("month").toDate());
    } else if (period === "year") {
      setStart(now.startOf("year").toDate());
      setEnd(now.endOf("year").toDate());
    }
  }, [period]);

  /* ---------- load employee (fallback if deep-link) ---------- */
  useEffect(() => {
    if (prefetched) {
      setEmployee(prefetched);
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosProtect.get("/getEmployeeList", {
          params: { userEmail: user?.email, search: "" },
        });
        if (!alive) return;
        const all = Array.isArray(data) ? data : [];
        const match = all.find((e) => String(e._id) === decodeURIComponent(id));
        setEmployee(match || null);
        if (!match) setError("Employee not found");
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load employee");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, prefetched, axiosProtect, user?.email]);

  /* ---------- load designation list ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosProtect.get("/admin/designations", {
          params: { userEmail: user?.email },
        });
        if (!alive) return;
        setDesignations(Array.isArray(data) ? data : []);
      } catch {
        const cur = prefetched?.designation || employee?.designation;
        const base = ["Admin", "HR-ADMIN", "Team Leader", "Developer", "Employee"];
        const s = new Set([...(base || []), cur].filter(Boolean));
        setDesignations(Array.from(s));
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosProtect, user?.email, employee?._id]);

  /* ---------- load PF & Salary (admin view) ---------- */
  useEffect(() => {
    if (!employee?.email || !user?.email) return;
    let alive = true;
    (async () => {
      try {
        // preferred admin endpoint
        const { data } = await axiosProtect.get("/admin/pf-salary", {
          params: { userEmail: user.email, employeeEmail: employee.email },
        });
        if (!alive) return;
        setPfSalary(data || null);
      } catch {
        // if you don't have the admin endpoint yet, we'll leave it blank
        setPfSalary(null);
      }
    })();
    return () => { alive = false; };
  }, [axiosProtect, employee?.email, user?.email]);

  /* ---------- load employee's shift ---------- */
  useEffect(() => {
    if (!employee?.email || !user?.email) return;
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosProtect.get("/gethShiftedEmployee", {
          params: { userEmail: user.email },
        });
        if (!alive) return;
        const match = (Array.isArray(data) ? data : []).find(
          (s) => (s.actualEmail || s.email) === employee.email
        );
        setShiftName(match?.shiftName || null);
      } catch {
        setShiftName(null);
      }
    })();
    return () => { alive = false; };
  }, [axiosProtect, employee?.email, user?.email]);

  /* ---------- load attendance for this employee ---------- */
  const loadAttendance = async () => {
    if (!employee?.email || !user?.email) return;
    try {
      const { data } = await axiosProtect.get("/admin/attendance/list", {
        params: {
          userEmail: user.email,
          start: fmtDate(start),
          end: fmtDate(end),
          employeeEmail: employee.email,
        },
      });
      setAttendanceRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load attendance");
      setAttendanceRows([]);
    }
  };

  /* ---------- load leaves (only approved) ---------- */
  const loadLeaves = async () => {
    if (!user?.email) return;
    try {
      const { data } = await axiosProtect.get("/getAppliedLeave", {
        params: { userEmail: user.email },
      });
      setLeaves((Array.isArray(data) ? data : []).filter((l) => l.status === "Approved"));
    } catch {
      setLeaves([]);
    }
  };

  useEffect(() => {
    loadAttendance();
    loadLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.email, user?.email, start, end]);

  /* ---------- designation edit ---------- */
  const startEdit = () => {
    setSelectedDesignation(employee?.designation || "");
    setEditMode(true);
  };
  const cancelEdit = () => {
    setEditMode(false);
    setSelectedDesignation("");
  };
  const saveDesignation = async () => {
    if (!selectedDesignation || selectedDesignation === employee?.designation) {
      setEditMode(false);
      return;
    }
    try {
      setLoading(true);
      await axiosProtect.put(
        `/admin/employee/${encodeURIComponent(String(employee._id))}/designation`,
        { newDesignation: selectedDesignation },
        { params: { userEmail: user?.email } }
      );
      setEmployee((e) => ({ ...e, designation: selectedDesignation }));
      setEditMode(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update designation");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- activate/de-activate ---------- */
  const toggleStatus = async (nextStatus) => {
    if (savingStatus) return;
    const confirm = await Swal.fire({
      title: nextStatus === "De-activate" ? "De-activate this employee?" : "Re-activate this employee?",
      text: nextStatus === "De-activate"
        ? "They won't be able to login until re-activated."
        : "They will be able to login again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      setSavingStatus(true);
      await axiosProtect.put(
        `/admin/employee/${employee._id}/status`,
        { status: nextStatus },
        { params: { userEmail: user?.email } }
      );
      setEmployee((e) => ({ ...e, status: nextStatus }));
      Swal.fire({ icon: "success", title: "Updated", text: `Status set to ${nextStatus}` });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err?.response?.data?.message || "Could not update status",
      });
    } finally {
      setSavingStatus(false);
    }
  };

  /* ---------- compute analytics ---------- */
  // build day buckets for range
  const dayKeys = useMemo(() => {
    const a = [];
    const s = moment(start).tz(tz).startOf("day");
    const e = moment(end).tz(tz).endOf("day");
    const c = s.clone();
    while (c.isSameOrBefore(e)) {
      a.push(c.format("DD-MMM-YYYY"));
      c.add(1, "day");
    }
    return a;
  }, [start, end]);

  // set of approved leave days for this employee
  const leaveSetByDay = useMemo(() => {
    const map = new Map();
    (leaves || [])
      .filter((l) => l.email === employee?.email)
      .forEach((l) => {
        const from = moment(l.fromDate).tz(tz).startOf("day");
        const to = moment(l.toDate).tz(tz).endOf("day");
        const c = from.clone();
        while (c.isSameOrBefore(to)) {
          const k = c.format("DD-MMM-YYYY");
          if (!map.has(k)) map.set(k, true);
          c.add(1, "day");
        }
      });
    return map;
  }, [leaves, employee?.email]);

  // group attendance rows by date (this employee only)
  const attByDay = useMemo(() => {
    const m = new Map();
    (attendanceRows || []).forEach((r) => {
      const k = niceDate(r.date);
      m.set(k, r);
    });
    return m;
  }, [attendanceRows]);

  // per-day status (shift aware)
  const dayStatus = useMemo(() => {
    const results = [];
    const now = moment().tz(tz);
    dayKeys.forEach((dKey) => {
      const d = moment(dKey, "DD-MMM-YYYY").tz(tz);
      const att = attByDay.get(dKey);
      const onLeave = leaveSetByDay.has(dKey);
      let status = "Absent";
      if (att?.checkInTime) {
        status = "Present";
      } else if (onLeave) {
        status = "On Leave";
      } else {
        const { start: s, end: e } = shiftWindowForDay(shiftName, d);
        if (d.isSame(now, "day")) {
          if (now.isBefore(s)) status = "Not Started";
          else if (now.isSameOrBefore(e)) status = "Yet to Check-in";
          else status = "Absent";
        } else if (d.isBefore(now, "day")) {
          status = "Absent";
        } else {
          status = "Not Started";
        }
      }
      results.push({ dayKey: dKey, status, att });
    });
    return results;
  }, [dayKeys, attByDay, leaveSetByDay, shiftName]);

  // aggregates
  const agg = useMemo(() => {
    const presentDays = dayStatus.filter((d) => d.status === "Present").length;
    const leaveDays = dayStatus.filter((d) => d.status === "On Leave").length;
    const absentDays = dayStatus.filter((d) => d.status === "Absent").length;
    const lateCount = (attendanceRows || []).reduce(
      (acc, r) => acc + (lateToMinutes(r.lateCheckIn) > 0 ? 1 : 0),
      0
    );
    const totalWorkMs = (attendanceRows || []).reduce(
      (acc, r) => acc + (r.workingHourInSeconds || 0),
      0
    );
    const totalOtMs = (attendanceRows || []).reduce(
      (acc, r) => acc + (r.totalOTInSeconds || 0),
      0
    );
    return { presentDays, leaveDays, absentDays, lateCount, totalWorkMs, totalOtMs };
  }, [dayStatus, attendanceRows]);

  // PF math shown for clarity (no mutation)
  const pfRate = 0.05; // 5%
  const baseSalary = pfSalary?.salary ?? null;
  const pfStatus = pfSalary?.pfStatus ?? null;
  const pfToAddThisPayroll =
    baseSalary && pfStatus?.toLowerCase() === "active" ? Math.round(baseSalary * pfRate) : 0;

  /* ---------- CSV ---------- */
  const exportCsv = () => {
    const rows = [
      ["Date", "Status", "Check-In", "Late (min)", "Check-Out", "Working", "OT"],
      ...dayStatus.map(({ dayKey, status, att }) => [
        dayKey,
        status,
        att?.checkInTime ? moment(att.checkInTime).tz(tz).format("hh:mm A") : "",
        lateToMinutes(att?.lateCheckIn) || "",
        att?.checkOutTime ? moment(att.checkOutTime).tz(tz).format("hh:mm A") : "",
        att?.workingHourInSeconds ? msToHm(att.workingHourInSeconds) : "",
        att?.totalOTInSeconds ? msToHm(att.totalOTInSeconds) : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee_${employee?.eid || ""}_${fmtDate(start)}_${fmtDate(end)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ============================== UI ============================== */
  if (loading && !employee) return <div className="p-6 text-sm text-gray-600">Loading profile…</div>;
  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error || "Employee not found"}
        </div>
        <Link to="/" className="inline-block mt-4 text-indigo-600 hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-6">
        <img src={employee.photo} alt={employee.fullName} className="w-28 h-28 rounded-2xl object-cover border" />
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{employee.fullName}</h1>

          {/* Designation + edit */}
          <div className="mt-1 flex items-center gap-2">
            {!editMode ? (
              <>
                <div className="text-sm text-gray-500">{employee.designation}</div>
                <button
                  onClick={startEdit}
                  className="text-gray-500 hover:text-gray-800 rounded p-1 border border-transparent hover:border-gray-200"
                  title="Edit designation"
                >
                  <PencilIcon />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="rounded-xl border px-3 py-1.5 text-sm"
                >
                  <option value="" disabled>Select designation</option>
                  {designations.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <button onClick={saveDesignation} className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-sm">Save</button>
                <button onClick={cancelEdit} className="rounded-xl border px-3 py-1.5 text-sm">Cancel</button>
              </div>
            )}

            {/* Activate / De-activate */}
            <div className="ml-3 flex items-center gap-2">
              {!isDeactivated ? (
                <button
                  disabled={savingStatus}
                  onClick={() => toggleStatus("De-activate")}
                  className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm hover:bg-rose-50 hover:border-rose-200"
                  title="De-activate employee"
                >
                  <PauseCircle size={18} className="text-rose-600" />
                  <span className="text-rose-700">De-activate</span>
                </button>
              ) : (
                <button
                  disabled={savingStatus}
                  onClick={() => toggleStatus("Active")}
                  className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-sm hover:bg-emerald-50 hover:border-emerald-200"
                  title="Re-activate employee"
                >
                  <PlayCircle size={18} className="text-emerald-600" />
                  <span className="text-emerald-700">Activate</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className={`px-2 py-1 rounded-full ${isDeactivated ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              Status: {employee.status || "N/A"}
            </span>
            {employee.bloodGroup && (
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">Blood: {employee.bloodGroup}</span>
            )}
            {employee.eid && (
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">EID: {employee.eid}</span>
            )}
            {shiftName && (
              <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-700">Shift: {shiftName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Email" value={employee.email} />
          <Field label="Phone" value={employee.phoneNumber} />
          <Field label="DOB" value={employee.DOB} />
          <Field label="NID" value={employee.NID} />
          <Field label="Address" value={employee.address} />
          <Field label="Designation" value={employee.designation} />
        </div>
      </div>

      {/* Filters for analytics */}
      <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Period presets */}
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-2 rounded-xl text-sm border ${period === p.key ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom dates */}
          <div className={`flex items-center gap-2 ${period === "custom" ? "" : "opacity-60 pointer-events-none"}`}>
            <DatePicker
              selected={start}
              onChange={(d) => setStart(d || new Date())}
              className="w-full rounded-xl border px-3 py-2"
              dateFormat="dd-MMM-yyyy"
            />
            <span className="text-slate-400">to</span>
            <DatePicker
              selected={end}
              onChange={(d) => setEnd(d || new Date())}
              className="w-full rounded-xl border px-3 py-2"
              dateFormat="dd-MMM-yyyy"
            />
          </div>

          {/* Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:shadow"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Compensation snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <DollarSign size={16} /> Base Salary
          </div>
          <div className="mt-2 text-3xl font-extrabold">
            {baseSalary != null ? `৳ ${baseSalary.toLocaleString()}` : "—"}
          </div>
          <div className="text-xs text-slate-500 mt-1">From PFAndSalaryCollections</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <PiggyBank size={16} /> PF Status
          </div>
          <div className="mt-2 text-lg">
            <Badge tone={pfStatus?.toLowerCase() === "active" ? "emerald" : "slate"}>
              {pfStatus ? pfStatus : "—"}
            </Badge>
          </div>
          <div className="text-xs text-slate-500 mt-1">5% of salary goes to PF when salary is given</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <PiggyBank size={16} /> PF to add this payroll (est.)
          </div>
          <div className="mt-2 text-3xl font-extrabold">
            {baseSalary != null ? `৳ ${pfToAddThisPayroll.toLocaleString()}` : "—"}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Applies only if PF is <span className="font-medium">active</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><CalendarDays size={16} /> Present</div>
          <div className="mt-2 text-3xl font-extrabold">{agg.presentDays}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><CalendarDays size={16} /> Absent</div>
          <div className="mt-2 text-3xl font-extrabold">{agg.absentDays}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><CalendarDays size={16} /> On Leave</div>
          <div className="mt-2 text-3xl font-extrabold">{agg.leaveDays}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Clock3 size={16} /> Late Check-ins</div>
          <div className="mt-2 text-3xl font-extrabold">{agg.lateCount}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Clock3 size={16} /> Total Working</div>
          <div className="mt-2 text-2xl font-extrabold">{msToHm(agg.totalWorkMs)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm"><Clock3 size={16} /> Total OT</div>
          <div className="mt-2 text-2xl font-extrabold">{msToHm(agg.totalOtMs)}</div>
        </div>
      </div>

      {/* Detailed per-day table */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="px-4 py-3 border-b font-semibold">
          Attendance — {niceDate(start)} → {niceDate(end)}
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Check-In</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Late</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Check-Out</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Working</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">OT</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dayStatus.map(({ dayKey, status, att }) => (
                <tr key={dayKey} className="hover:bg-slate-50">
                  <td className="px-3 py-2">{dayKey}</td>
                  <td className="px-3 py-2">
                    {status === "Present" && <Badge tone="emerald">Present</Badge>}
                    {status === "On Leave" && <Badge tone="amber">On Leave</Badge>}
                    {status === "Absent" && <Badge tone="rose">Absent</Badge>}
                    {status === "Not Started" && <Badge tone="slate">Not Started</Badge>}
                    {status === "Yet to Check-in" && <Badge tone="orange">Yet to Check-in</Badge>}
                  </td>
                  <td className="px-3 py-2">
                    {att?.checkInTime ? moment(att.checkInTime).tz(tz).format("hh:mm A") : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {lateToMinutes(att?.lateCheckIn) > 0 ? (
                      <Badge tone="orange">{lateToMinutes(att?.lateCheckIn)}m</Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {att?.checkOutTime ? moment(att.checkOutTime).tz(tz).format("hh:mm A") : "-"}
                  </td>
                  <td className="px-3 py-2">{att?.workingHourInSeconds ? msToHm(att.workingHourInSeconds) : "-"}</td>
                  <td className="px-3 py-2">{att?.totalOTInSeconds ? msToHm(att.totalOTInSeconds) : "-"}</td>
                </tr>
              ))}
              {dayStatus.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">No records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-slate-500">
          Shift-aware statuses prevent early “Absent” before this employee’s shift actually starts.
        </div>
      </div>

      {/* Family */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Family Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Father’s Name" value={employee.fathersName} />
          <Field label="Mother’s Name" value={employee.mothersName} />
          <Field label="Spouse" value={employee.spouseName} />
        </div>
      </div>

      {/* Emergency */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold mb-4">Emergency Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Contact Number" value={employee.emergencyContact} />
          <Field label="Person" value={employee.emergencyContactPerson} />
          <Field label="Relation" value={employee.emergencyContactPersonRelation} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">Back to dashboard</Link>
      </div>
    </div>
  );
};

export default EmployeeProfile;
