import React, { useContext, useEffect, useMemo, useState } from "react";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ContextData } from "../../DataProvider";
import useAxiosProtect from "../../utils/useAxiosProtect";

// ---------- constants & helpers ----------
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

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom" },
];

const GROUPS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

// parse "1h 20m" → 80 (minutes)
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

const Badge = ({ children, tone = "slate" }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${tone}-100 text-${tone}-700`}
  >
    {children}
  </span>
);

// shift window per day (use employees’ own shift)
const shiftWindowForDay = (shiftName, day) => {
  const d = moment(day).tz(tz).startOf("day");
  switch ((shiftName || "").toLowerCase()) {
    case "morning":
      return { start: d.clone().hour(6), end: d.clone().hour(14) }; // 6am–2pm
    case "general":
      return { start: d.clone().hour(10), end: d.clone().hour(18) }; // 10am–6pm
    case "evening":
      return { start: d.clone().hour(14).minute(5), end: d.clone().hour(22) }; // 2:05pm–10pm
    default:
      return {
        start: d.clone().hour(0),
        end: d.clone().hour(23).minute(59).second(59),
      };
  }
};

// ---------- main ----------
const EmployeeDetails = () => {
  const axiosProtect = useAxiosProtect();
  const { user } = useContext(ContextData);

  // filters
  const [period, setPeriod] = useState("today");
  const [groupBy, setGroupBy] = useState("daily");
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [search, setSearch] = useState("");

  // data
  const [employees, setEmployees] = useState([]);
  const [shiftMap, setShiftMap] = useState(new Map()); // email → shiftName
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [otAggRows, setOtAggRows] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [checkinsToday, setCheckinsToday] = useState([]); // <-- NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // period → dates
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

  // load employees
  useEffect(() => {
    let alive = true;
    if (!user?.email) return;
    (async () => {
      try {
        const { data } = await axiosProtect.get("/getEmployeeList", {
          params: { userEmail: user.email, search: "" },
        });
        if (!alive) return;
        setEmployees(Array.isArray(data) ? data : []);
      } catch {/* ignore */}
    })();
    return () => { alive = false; };
  }, [axiosProtect, user?.email]);

  // load leaves
  useEffect(() => {
    let alive = true;
    if (!user?.email) return;
    (async () => {
      try {
        const { data } = await axiosProtect.get("/getAppliedLeave", {
          params: { userEmail: user.email },
        });
        if (!alive) return;
        setLeaves(Array.isArray(data) ? data : []);
      } catch {/* ignore */}
    })();
    return () => { alive = false; };
  }, [axiosProtect, user?.email]);

  // load shift map
  useEffect(() => {
    let alive = true;
    if (!user?.email) return;
    (async () => {
      try {
        const { data } = await axiosProtect.get("/gethShiftedEmployee", {
          params: { userEmail: user.email },
        });
        if (!alive) return;
        const m = new Map();
        (Array.isArray(data) ? data : []).forEach((s) => {
          const k = s.actualEmail || s.email;
          if (!k) return;
          m.set(k, s.shiftName);
        });
        setShiftMap(m);
      } catch {/* ignore */}
    })();
    return () => { alive = false; };
  }, [axiosProtect, user?.email]);

  // fetch attendance + OT (+today's check-ins)
  const fetchData = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError("");
    try {
      const [att, ot] = await Promise.all([
        axiosProtect.get("/admin/attendance/list", {
          params: {
            userEmail: user.email,
            start: fmtDate(start),
            end: fmtDate(end),
            employeeEmail: employeeEmail || undefined,
            q: search || undefined,
          },
        }),
        axiosProtect.get("/admin/ot/list", {
          params: {
            userEmail: user.email,
            start: fmtDate(start),
            end: fmtDate(end),
            employeeEmail: employeeEmail || undefined,
            groupBy,
          },
        }),
      ]);

      setAttendanceRows(Array.isArray(att.data) ? att.data : []);
      setOtAggRows(Array.isArray(ot.data) ? ot.data : []);

      // If it's a single-day range, also fetch raw check-ins for that day
      if (moment(start).isSame(end, "day")) {
        const { data: checks } = await axiosProtect.get("/admin/checkins/list", {
          params: {
            userEmail: user.email,
            date: fmtDate(start),
            employeeEmail: employeeEmail || undefined,
          },
        });
        setCheckinsToday(Array.isArray(checks) ? checks : []);
      } else {
        setCheckinsToday([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load report");
      setAttendanceRows([]);
      setOtAggRows([]);
      setCheckinsToday([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [period, start, end, groupBy, employeeEmail, search]);

  // maps for quick lookup
  const empMap = useMemo(() => {
    const m = new Map();
    employees.forEach((e) => m.set(e.email, e));
    return m;
  }, [employees]);

  // leave sets per day in range
  const makeLeaveByDay = (startDate, endDate) => {
    const map = new Map();
    const rangeStart = moment(startDate).tz(tz).startOf("day").valueOf();
    const rangeEnd = moment(endDate).tz(tz).endOf("day").valueOf();
    (leaves || [])
      .filter((l) => l?.status === "Approved")
      .forEach((l) => {
        // supports either (fromDate/toDate) or (startDate/endDate/leaveDates)
        const from = moment(l.fromDate || l.startDate, ["DD-MMM-YYYY","YYYY-MM-DD"]).valueOf();
        const to   = moment(l.toDate   || l.endDate,   ["DD-MMM-YYYY","YYYY-MM-DD"]).valueOf();
        if (isNaN(from) || isNaN(to)) return;
        const s = Math.max(from, rangeStart);
        const e = Math.min(to, rangeEnd);
        if (s > e) return;
        const c = moment(s).startOf("day");
        const stop = moment(e).startOf("day");
        while (c.isSameOrBefore(stop)) {
          const key = c.tz(tz).format("DD-MMM-YYYY");
          if (!map.has(key)) map.set(key, new Set());
          map.get(key).add(l.email);
          c.add(1, "day");
        }
      });
    return map;
  };

  // determine status for a single day when no check-in yet
  const statusWithoutCheckin = (employeeEmail, dayMoment, leaveSetForDay) => {
    if (leaveSetForDay.has(employeeEmail)) return "On Leave";
    const { start: s, end: e } = shiftWindowForDay(shiftMap.get(employeeEmail), dayMoment);
    const now = moment().tz(tz);
    const isToday = dayMoment.isSame(now, "day");
    if (isToday) {
      if (now.isBefore(s)) return "Not Started";      // before own shift
      if (now.isSameOrBefore(e)) return "Yet to Check-in"; // during own shift
      return "Absent";                                // after own shift end
    }
    if (dayMoment.isBefore(now, "day")) return "Absent";
    return "Not Started";
  };

  // build present set for "today" = union(attendanceRows[day], checkinsToday)
  const presentSetToday = useMemo(() => {
    if (!moment(start).isSame(end, "day")) return new Set();
    const dayKey = moment(start).tz(tz).format("DD-MMM-YYYY");
    const set = new Set(
      attendanceRows
        .filter((r) => niceDate(r.date) === dayKey && r.checkInTime)
        .map((r) => r.email)
    );
    (checkinsToday || []).forEach((c) => {
      if (c?.email) set.add(c.email);
    });
    return set;
  }, [attendanceRows, checkinsToday, start, end]);

  // summary counters
  const summary = useMemo(() => {
    const isSingle = moment(start).isSame(end, "day");
    const startD = moment(start).tz(tz).startOf("day");
    const endD = moment(end).tz(tz).endOf("day");

    const allEmails = employees.map((e) => e.email);
    const leaveByDay = makeLeaveByDay(start, end);

    // late count: union of attendanceRows + (today’s check-ins that contain lateCheckIn)
    const lateFromAttendance = attendanceRows.reduce(
      (acc, r) => acc + (lateToMinutes(r.lateCheckIn) > 0 ? 1 : 0),
      0
    );
    const lateFromCheckins =
      isSingle
        ? (checkinsToday || []).filter((c) => lateToMinutes(c?.lateCheckIn) > 0).length
        : 0;
    const late = lateFromAttendance + lateFromCheckins;

    if (isSingle) {
      const dayMoment = startD.clone();
      const leaveSet = leaveByDay.get(dayMoment.format("DD-MMM-YYYY")) || new Set();

      let present = 0, onLeave = 0, absent = 0;
      const now = moment().tz(tz);

      allEmails.forEach((email) => {
        if (presentSetToday.has(email)) {
          present += 1;
          return;
        }
        if (leaveSet.has(email)) {
          // only count as on leave if they didn't check in
          onLeave += 1;
          return;
        }
        // not checked in & not on leave → only absent AFTER their shift end
        const { end: e } = shiftWindowForDay(shiftMap.get(email), dayMoment);
        if (now.isAfter(e)) absent += 1;
      });

      return { present, absent, onLeave, late };
    }

    // multi-day: unique present emails from attendance
    const presentEmails = new Set(attendanceRows.map((r) => r.email));
    const leaveEmails = new Set(
      (leaves || []).filter((l) => l.status === "Approved").map((l) => l.email)
    );
    const present = presentEmails.size;
    const onLeave = Array.from(leaveEmails).filter((em) => allEmails.includes(em)).length;
    const absent = Math.max(0, allEmails.length - present - onLeave);
    return { present, absent, onLeave, late };
  }, [attendanceRows, checkinsToday, employees, start, end, leaves, shiftMap, presentSetToday]);

  // today roster (shift-aware, uses presentSetToday)
  const todayRoster = useMemo(() => {
    const isSingle = moment(start).isSame(end, "day");
    if (!isSingle) return [];
    const dayKey = moment(start).tz(tz).format("DD-MMM-YYYY");
    const dayMoment = moment(dayKey, "DD-MMM-YYYY").tz(tz);

    const leaveByDay = makeLeaveByDay(start, end);
    const leaveSet = leaveByDay.get(dayKey) || new Set();

    return employees
      .filter((e) => !employeeEmail || e.email === employeeEmail)
      .map((e) => {
        // use attendanceRows to show work/ot if exists, otherwise dashes
        const row =
          attendanceRows.find(
            (r) => r.email === e.email && niceDate(r.date) === dayKey
          ) || {};
        const hasCheckedIn =
          presentSetToday.has(e.email); // union of attendance + raw check-ins

        const lateMinutes = hasCheckedIn
          ? (row.lateCheckIn ? lateToMinutes(row.lateCheckIn) : 0) ||
            // if only in checkInsToday, try that value
            lateToMinutes(
              (checkinsToday || []).find((c) => c.email === e.email)?.lateCheckIn
            )
          : 0;

        const status = hasCheckedIn
          ? "Present"
          : statusWithoutCheckin(e.email, dayMoment, leaveSet);

        return {
          email: e.email,
          eid: e.eid,
          fullName: e.fullName,
          designation: e.designation,
          status,
          lateMinutes,
          work: row.workingHourInSeconds ? msToHm(row.workingHourInSeconds) : "-",
          ot: row.totalOTInSeconds ? msToHm(row.totalOTInSeconds) : "-",
        };
      })
      .filter((r) =>
        search
          ? (r.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.email || "").toLowerCase().includes(search.toLowerCase()) ||
            String(r.eid || "").toLowerCase().includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
  }, [attendanceRows, employees, employeeEmail, start, end, search, shiftMap, checkinsToday, presentSetToday]);

  const exportCsv = () => {
    const rows = [
      [
        "Date",
        "Employee",
        "Email",
        "EID",
        "Status",
        "Check-In",
        "Late (min)",
        "Check-Out",
        "Working",
        "OT",
      ],
      ...attendanceRows.map((r) => [
        niceDate(r.date),
        r.fullName || empMap.get(r.email)?.fullName || "",
        r.email,
        empMap.get(r.email)?.eid || "",
        r.checkInTime ? "Present" : "Absent",
        r.checkInTime ? moment(r.checkInTime).tz(tz).format("hh:mm A") : "",
        lateToMinutes(r.lateCheckIn) || "",
        r.checkOutTime ? moment(r.checkOutTime).tz(tz).format("hh:mm A") : "",
        r.workingHourInSeconds ? msToHm(r.workingHourInSeconds) : "",
        r.totalOTInSeconds ? msToHm(r.totalOTInSeconds) : "",
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${fmtDate(start)}_${fmtDate(end)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isRoster = moment(start).isSame(end, "day");
  const noRowsColSpan = isRoster ? 6 : 8;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Employee Attendance & Overtime
          </h1>
          <p className="text-sm text-slate-500">Admin & Accountant view</p>
        </div>
        <button
          onClick={exportCsv}
          className="rounded-xl border px-3 py-2 text-sm font-medium hover:shadow"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Period presets */}
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-2 rounded-xl text-sm border ${
                  period === p.key ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom dates */}
          <div
            className={`flex items-center gap-2 ${
              period === "custom" ? "" : "opacity-60 pointer-events-none"
            }`}
          >
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

          {/* Group by */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 w-24">Group by</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            >
              {GROUPS.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Employee */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600 w-24">Employee</label>
            <select
              value={employeeEmail}
              onChange={(e) => setEmployeeEmail(e.target.value)}
              className="w-full rounded-xl border px-3 py-2"
            >
              <option value="">All employees</option>
              {employees.map((e) => (
                <option key={e.email} value={e.email}>
                  {e.fullName} ({e.eid || "—"})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / email / EID"
              className="w-full rounded-xl border px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Present</div>
          <div className="mt-2 text-3xl font-extrabold">{summary.present}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Absent</div>
          <div className="mt-2 text-3xl font-extrabold">{summary.absent}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">On Leave</div>
          <div className="mt-2 text-3xl font-extrabold">{summary.onLeave}</div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Late Check-ins</div>
          <div className="mt-2 text-3xl font-extrabold">{summary.late}</div>
        </div>
      </div>

      {/* Error / Loading */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-xl border bg-white p-3 text-slate-600 text-sm">
          Loading…
        </div>
      )}

      {/* Roster or Period Summary */}
      <div className="rounded-2xl border bg-white shadow-sm ">
        <div className="px-4 py-3 border-b  flex items-center justify-between">
          <div className="font-semibold ">
            {isRoster
              ? `Today's Roster — ${niceDate(start)}`
              : `Period Summary — ${niceDate(start)} → ${niceDate(end)}`}
          </div>
          <div className="text-xs text-slate-500 ">
            {employeeEmail ? empMap.get(employeeEmail)?.fullName : "All employees"}
          </div>
        </div>

        {/* table */}
        <div className="overflow-auto !rounded-b-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              {isRoster ? (
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Employee
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    EID
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Late (min)
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Working
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    OT
                  </th>
                </tr>
              ) : (
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Employee
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    EID
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Check-In
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Late
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Check-Out
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Working
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    OT
                  </th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y">
              {isRoster ? (
                todayRoster.map((r) => (
                  <tr key={r.email} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{r.fullName}</td>
                    <td className="px-3 py-2">{r.eid || "—"}</td>
                    <td className="px-3 py-2">
                      {r.status === "Present" && <Badge tone="emerald">Present</Badge>}
                      {r.status === "On Leave" && <Badge tone="amber">On Leave</Badge>}
                      {r.status === "Absent" && <Badge tone="rose">Absent</Badge>}
                      {r.status === "Not Started" && <Badge tone="slate">Not Started</Badge>}
                      {r.status === "Yet to Check-in" && (
                        <Badge tone="orange">Yet to Check-in</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.lateMinutes > 0 ? (
                        <Badge tone="orange">{r.lateMinutes}m</Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2">{r.work}</td>
                    <td className="px-3 py-2">{r.ot}</td>
                  </tr>
                ))
              ) : (
                employees
                  .filter((e) => !employeeEmail || e.email === employeeEmail)
                  .map((e) => {
                    const rows = attendanceRows.filter((r) => r.email === e.email);
                    const presentDays = new Set(rows.map((r) => niceDate(r.date))).size;
                    const late = rows.filter((r) => lateToMinutes(r.lateCheckIn) > 0).length;
                    const totalWorkMs = rows.reduce(
                      (acc, r) => acc + (r.workingHourInSeconds || 0),
                      0
                    );
                    const totalOtMs = rows.reduce(
                      (acc, r) => acc + (r.totalOTInSeconds || 0),
                      0
                    );
                    return (
                      <tr key={e.email} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{e.fullName}</td>
                        <td className="px-3 py-2">{e.eid || "—"}</td>
                        <td className="px-3 py-2">
                          <Badge tone="emerald">{presentDays} day(s) present</Badge>{" "}
                          <span className="text-slate-400">/</span>{" "}
                          <Badge tone="orange">{late} late</Badge>
                        </td>
                        <td className="px-3 py-2">—</td>
                        <td className="px-3 py-2">—</td>
                        <td className="px-3 py-2">—</td>
                        <td className="px-3 py-2">{msToHm(totalWorkMs)}</td>
                        <td className="px-3 py-2">{msToHm(totalOtMs)}</td>
                      </tr>
                    );
                  })
              )}
              {((isRoster && todayRoster.length === 0) ||
                (!isRoster && employees.length === 0)) && (
                <tr>
                  <td
                    colSpan={noRowsColSpan}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Attendance */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="px-4 py-3 border-b font-semibold">Detailed Attendance</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Employee</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Email</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Check-In</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Late</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Check-Out</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Working</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">OT</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendanceRows
                .filter((r) => !employeeEmail || r.email === employeeEmail)
                .filter((r) =>
                  search
                    ? (r.fullName || "")
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      (r.email || "")
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      String(empMap.get(r.email)?.eid || "")
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    : true
                )
                .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
                .map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{niceDate(r.date)}</td>
                    <td className="px-3 py-2">
                      {r.fullName || empMap.get(r.email)?.fullName || "—"}
                    </td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">
                      {r.checkInTime
                        ? moment(r.checkInTime).tz(tz).format("hh:mm A")
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {lateToMinutes(r.lateCheckIn) > 0 ? (
                        <Badge tone="orange">{lateToMinutes(r.lateCheckIn)}m</Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {r.checkOutTime
                        ? moment(r.checkOutTime).tz(tz).format("hh:mm A")
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {r.workingHourInSeconds ? msToHm(r.workingHourInSeconds) : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {r.totalOTInSeconds ? msToHm(r.totalOTInSeconds) : "-"}
                    </td>
                  </tr>
                ))}
              {attendanceRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                    No records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overtime Analytics */}
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="px-4 py-3 border-b font-semibold">
          Overtime — {GROUPS.find((g) => g.key === groupBy)?.label}
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Bucket
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Employee
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Total OT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {otAggRows
                .filter((r) => !employeeEmail || r.email === employeeEmail)
                .map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2">{r.bucketLabel}</td>
                    <td className="px-3 py-2">
                      {r.fullName || empMap.get(r.email)?.fullName || "—"}
                    </td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{msToHm(r.totalOTInSeconds || 0)}</td>
                  </tr>
                ))}
              {otAggRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    No overtime records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-slate-500">
          Grouping:
          <span className="ml-1">{groupBy}</span> • Range: {niceDate(start)} →{" "}
          {niceDate(end)}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
