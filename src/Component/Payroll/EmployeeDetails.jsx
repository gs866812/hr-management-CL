import React, { useContext, useEffect, useMemo, useState } from "react";
import moment from "moment-timezone";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ContextData } from "../../DataProvider";
import useAxiosProtect from "../../utils/useAxiosProtect";



// ---------- helpers ----------
const tz = "Asia/Dhaka";
const fmtDate = (d) => moment(d).tz(tz).format("YYYY-MM-DD");
const niceDate = (d) => moment(d, ["YYYY-MM-DD", "DD-MMM-YYYY"]).tz(tz).format("DD-MMM-YYYY");
const msToHm = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return `${h}h ${m}m`;
};
const z = (n) => (n ?? 0);

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

const Badge = ({ children, tone = "slate" }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${tone}-100 text-${tone}-700`}>
        {children}
    </span>
);

// ---------- main component ----------
const EmployeeDetails = () => {
    const axiosProtect = useAxiosProtect();
    const { user } = useContext(ContextData);

    // filters
    const [period, setPeriod] = useState("today");
    const [groupBy, setGroupBy] = useState("daily");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [employeeEmail, setEmployeeEmail] = useState(""); // all by default
    const [search, setSearch] = useState("");

    // data
    const [loading, setLoading] = useState(false);
    const [attendanceRows, setAttendanceRows] = useState([]);   // list across employees
    const [otAggRows, setOtAggRows] = useState([]);             // grouped OT rows
    const [leaves, setLeaves] = useState([]);                   // all leave docs (existing endpoint)
    const [error, setError] = useState("");

    // derived range from presets
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

    // fetch employees (existing)
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data } = await axiosProtect.get("/getEmployeeList", {
                    params: { userEmail: user?.email, search: "" },
                });
                if (!alive) return;
                setEmployees(Array.isArray(data) ? data : []);
            } catch (e) {
                // fail silently; UI still works
            }
        })();
        return () => (alive = false);
    }, [axiosProtect, user?.email]);

    // fetch leaves (existing; returns all leaves)
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data } = await axiosProtect.get("/getAppliedLeave", {
                    params: { userEmail: user?.email },
                });
                if (!alive) return;
                setLeaves(Array.isArray(data) ? data : []);
            } catch (e) {
                // ignore
            }
        })();
        return () => (alive = false);
    }, [axiosProtect, user?.email]);

    // fetch attendance + OT (admin endpoints to add)
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
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to load report");
            setAttendanceRows([]);
            setOtAggRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [period, start, end, groupBy, employeeEmail, search]);

    // map employees by email for quick lookup
    const empMap = useMemo(() => {
        const m = new Map();
        employees.forEach((e) => m.set(e.email, e));
        return m;
    }, [employees]);

    // compute summary
    const summary = useMemo(() => {
        // date keys in range
        const startD = moment(start).tz(tz).startOf("day");
        const endD = moment(end).tz(tz).endOf("day");
        const days = [];
        const cursor = startD.clone();
        while (cursor.isSameOrBefore(endD)) {
            days.push(cursor.format("DD-MMM-YYYY"));
            cursor.add(1, "day");
        }

        const allEmails = employees.map((e) => e.email);
        const filteredRows = attendanceRows.filter((r) =>
            (!employeeEmail || r.email === employeeEmail) &&
            (search ? (r.fullName?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())) : true)
        );

        // present by day
        const presentByDay = new Map();
        filteredRows.forEach((r) => {
            const d = niceDate(r.date);
            if (!presentByDay.has(d)) presentByDay.set(d, new Set());
            presentByDay.get(d).add(r.email);
        });

        // leave emails by day (Approved only + overlap)
        const leaveByDay = new Map();
        const rangeStart = moment(start).tz(tz).startOf("day").valueOf();
        const rangeEnd = moment(end).tz(tz).endOf("day").valueOf();
        leaves
            .filter((l) => l?.status === "Approved")
            .forEach((l) => {
                const from = moment(l?.fromDate).valueOf();
                const to = moment(l?.toDate).valueOf();
                if (isNaN(from) || isNaN(to)) return;
                const s = Math.max(from, rangeStart);
                const e = Math.min(to, rangeEnd);
                if (s > e) return;
                const c = moment(s).startOf("day");
                const stop = moment(e).startOf("day");
                while (c.isSameOrBefore(stop)) {
                    const dKey = c.tz(tz).format("DD-MMM-YYYY");
                    if (!leaveByDay.has(dKey)) leaveByDay.set(dKey, new Set());
                    leaveByDay.get(dKey).add(l.email);
                    c.add(1, "day");
                }
            });

        // late count
        const lateCount = filteredRows.reduce((acc, r) => acc + (r.lateCheckIn ? 1 : 0), 0);

        // if single-day like "Today", compute roster counts for that day; otherwise aggregate unique emails across range
        if (period === "today" || days.length === 1) {
            const d = days[0];
            const presentSet = presentByDay.get(d) || new Set();
            const leaveSet = leaveByDay.get(d) || new Set();
            const present = presentSet.size;
            const onLeave = leaveSet.size;
            const absent = Math.max(0, allEmails.length - present - onLeave);
            return { present, absent, onLeave, late: lateCount };
        }

        // range summary (unique)
        const presentEmails = new Set(filteredRows.map((r) => r.email));
        const leaveEmails = new Set(
            leaves.filter((l) => l.status === "Approved").map((l) => l.email)
        );

        const present = presentEmails.size;
        const onLeave = Array.from(leaveEmails).filter((em) => allEmails.includes(em)).length;
        const absent = Math.max(0, allEmails.length - present - onLeave);

        return { present, absent, onLeave, late: lateCount };
    }, [attendanceRows, employees, employeeEmail, leaves, period, start, end, search]);

    // build "today roster" rows (only for single day)
    const todayRoster = useMemo(() => {
        const isSingle = moment(start).isSame(end, "day");
        if (!isSingle) return [];
        const dayKey = moment(start).tz(tz).format("DD-MMM-YYYY");

        const presentSet = new Set(attendanceRows.filter(r => niceDate(r.date) === dayKey).map(r => r.email));
        const leaveSet = new Set(
            leaves
                .filter((l) => l.status === "Approved" && moment(dayKey, "DD-MMM-YYYY").isBetween(moment(l.fromDate).startOf("day"), moment(l.toDate).endOf("day"), undefined, "[]"))
                .map((l) => l.email)
        );

        return employees
            .filter(e => !employeeEmail || e.email === employeeEmail)
            .map(e => {
                const isPresent = presentSet.has(e.email);
                const isLeave = leaveSet.has(e.email);
                const status = isPresent ? "Present" : isLeave ? "On Leave" : "Absent";

                const row = attendanceRows.find(r => r.email === e.email && niceDate(r.date) === dayKey) || {};
                return {
                    email: e.email,
                    eid: e.eid,
                    fullName: e.fullName,
                    designation: e.designation,
                    status,
                    lateCheckIn: row.lateCheckIn || false,
                    checkIn: row.checkInTime ? moment(row.checkInTime).tz(tz).format("hh:mm A") : "-",
                    checkOut: row.checkOutTime ? moment(row.checkOutTime).tz(tz).format("hh:mm A") : "-",
                    work: row.workingHourInSeconds ? msToHm(row.workingHourInSeconds) : "-",
                    ot: row.totalOTInSeconds ? msToHm(row.totalOTInSeconds) : "-",
                };
            })
            .filter(r => (search ? (r.fullName?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase()) || String(r.eid || "").includes(search)) : true))
            .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    }, [attendanceRows, employees, employeeEmail, leaves, start, end, search]);

    // CSV export
    const exportCsv = () => {
        const rows = [
            ["Date", "Employee", "Email", "EID", "Status", "Check-In", "Late", "Check-Out", "Working", "OT"],
            ...attendanceRows.map(r => [
                niceDate(r.date),
                r.fullName || empMap.get(r.email)?.fullName || "",
                r.email,
                empMap.get(r.email)?.eid || "",
                r.status || (r.checkInTime ? "Present" : "Absent"),
                r.checkInTime ? moment(r.checkInTime).tz(tz).format("hh:mm A") : "",
                r.lateCheckIn ? (typeof r.lateCheckIn === "string" ? r.lateCheckIn : "Yes") : "",
                r.checkOutTime ? moment(r.checkOutTime).tz(tz).format("hh:mm A") : "",
                r.workingHourInSeconds ? msToHm(r.workingHourInSeconds) : "",
                r.totalOTInSeconds ? msToHm(r.totalOTInSeconds) : "",
            ]),
        ];
        const csv = rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${fmtDate(start)}_${fmtDate(end)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employee Attendance & Overtime</h1>
                    <p className="text-sm text-slate-500">Admin & Accountant view</p>
                </div>
                <button onClick={exportCsv} className="rounded-xl border px-3 py-2 text-sm font-medium hover:shadow">
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border bg-white p-4 md:p-5 shadow-sm">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Period presets */}
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPeriod(p.key)}
                                className={`px-3 py-2 rounded-xl text-sm border ${period === p.key ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"}`}
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

                    {/* Group by */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600 w-24">Group by</label>
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2"
                        >
                            {GROUPS.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
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
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>}
            {loading && <div className="rounded-xl border bg-white p-3 text-slate-600 text-sm">Loading…</div>}

            {/* Roster or Period Summary */}
            <div className="rounded-2xl border bg-white shadow-sm ">
                <div className="px-4 py-3 border-b  flex items-center justify-between">
                    <div className="font-semibold ">
                        {moment(start).isSame(end, "day")
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
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Employee</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">EID</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Status</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Check-In</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Late</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Check-Out</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Working</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">OT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {moment(start).isSame(end, "day") ? (
                                todayRoster.map((r) => (
                                    <tr key={r.email} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">{r.fullName}</td>
                                        <td className="px-3 py-2">{r.eid || "—"}</td>
                                        <td className="px-3 py-2">
                                            {r.status === "Present" && <Badge tone="emerald">Present</Badge>}
                                            {r.status === "On Leave" && <Badge tone="amber">On Leave</Badge>}
                                            {r.status === "Absent" && <Badge tone="rose">Absent</Badge>}
                                        </td>
                                        <td className="px-3 py-2">{r.checkIn}</td>
                                        <td className="px-3 py-2">{r.lateCheckIn ? <Badge tone="orange">{r.lateCheckIn === true ? "Late" : r.lateCheckIn}</Badge> : "-"}</td>
                                        <td className="px-3 py-2">{r.checkOut}</td>
                                        <td className="px-3 py-2">{r.work}</td>
                                        <td className="px-3 py-2">{r.ot}</td>
                                    </tr>
                                ))
                            ) : (
                                // When range > 1 day: show compact employee summary (present days, late count, total OT)
                                employees
                                    .filter(e => !employeeEmail || e.email === employeeEmail)
                                    .map(e => {
                                        const rows = attendanceRows.filter(r => r.email === e.email);
                                        const presentDays = new Set(rows.map(r => niceDate(r.date))).size;
                                        const late = rows.filter(r => r.lateCheckIn).length;
                                        const totalWorkMs = rows.reduce((acc, r) => acc + z(r.workingHourInSeconds), 0);
                                        const totalOtMs = rows.reduce((acc, r) => acc + z(r.totalOTInSeconds), 0);
                                        return (
                                            <tr key={e.email} className="hover:bg-slate-50">
                                                <td className="px-3 py-2">{e.fullName}</td>
                                                <td className="px-3 py-2">{e.eid || "—"}</td>
                                                <td className="px-3 py-2"><Badge tone="emerald">{presentDays} day(s) present</Badge> <span className="text-slate-400">/</span> <Badge tone="orange">{late} late</Badge></td>
                                                <td className="px-3 py-2">—</td>
                                                <td className="px-3 py-2">—</td>
                                                <td className="px-3 py-2">—</td>
                                                <td className="px-3 py-2">{msToHm(totalWorkMs)}</td>
                                                <td className="px-3 py-2">{msToHm(totalOtMs)}</td>
                                            </tr>
                                        );
                                    })
                            )}
                            {((moment(start).isSame(end, "day") && todayRoster.length === 0) ||
                                (!moment(start).isSame(end, "day") && employees.length === 0)) && (
                                    <tr>
                                        <td colSpan={8} className="px-3 py-6 text-center text-slate-500">No records</td>
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
                                .filter(r => (!employeeEmail || r.email === employeeEmail))
                                .filter(r => (search ? (r.fullName?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())) : true))
                                .sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf())
                                .map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">{niceDate(r.date)}</td>
                                        <td className="px-3 py-2">{r.fullName || empMap.get(r.email)?.fullName || "—"}</td>
                                        <td className="px-3 py-2">{r.email}</td>
                                        <td className="px-3 py-2">{r.checkInTime ? moment(r.checkInTime).tz(tz).format("hh:mm A") : "-"}</td>
                                        <td className="px-3 py-2">{r.lateCheckIn ? <Badge tone="orange">{typeof r.lateCheckIn === "string" ? r.lateCheckIn : "Late"}</Badge> : "-"}</td>
                                        <td className="px-3 py-2">{r.checkOutTime ? moment(r.checkOutTime).tz(tz).format("hh:mm A") : "-"}</td>
                                        <td className="px-3 py-2">{r.workingHourInSeconds ? msToHm(r.workingHourInSeconds) : "-"}</td>
                                        <td className="px-3 py-2">{r.totalOTInSeconds ? msToHm(r.totalOTInSeconds) : "-"}</td>
                                    </tr>
                                ))}
                            {attendanceRows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-3 py-6 text-center text-slate-500">No records</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Overtime Analytics */}
            <div className="rounded-2xl border bg-white shadow-sm">
                <div className="px-4 py-3 border-b font-semibold">Overtime — {GROUPS.find(g => g.key === groupBy)?.label}</div>
                <div className="overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Bucket</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Employee</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Email</th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600">Total OT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {otAggRows
                                .filter(r => (!employeeEmail || r.email === employeeEmail))
                                .map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-3 py-2">{r.bucketLabel}</td>
                                        <td className="px-3 py-2">{r.fullName || empMap.get(r.email)?.fullName || "—"}</td>
                                        <td className="px-3 py-2">{r.email}</td>
                                        <td className="px-3 py-2">{msToHm(r.totalOTInSeconds || 0)}</td>
                                    </tr>
                                ))}
                            {otAggRows.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">No overtime records</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 text-xs text-slate-500">
                    Grouping:
                    <span className="ml-1">{groupBy}</span> • Range: {niceDate(start)} → {niceDate(end)}
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
