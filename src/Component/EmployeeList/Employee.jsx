import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ContextData } from '../../DataProvider';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { setRefetch } from '../../redux/refetchSlice';
import { FaPhoneAlt, FaUserTie } from 'react-icons/fa';
import { MdBloodtype, MdDriveFileRenameOutline, MdEmail } from 'react-icons/md';
import { IoMdHelpBuoy } from 'react-icons/io';
import { HiMiniCalendarDateRange } from "react-icons/hi2";
import { SiRedhatopenshift } from "react-icons/si";
import ProfileModal from '../Modal/ProfileModal';
import useAxiosProtect from '../../utils/useAxiosProtect';

const StatCard = ({ label, value, accent = "" }) => (
  <div className={`p-3 rounded-md border border-gray-200 ${accent}`}>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-xl font-semibold">{value}</div>
  </div>
);

const Employee = () => {
  const { user, employee } = useContext(ContextData);
  const inputRef = useRef(null);

  // profile pic upload states
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const [workingShift, setWorkingShift] = useState('');

  // --- LEFT PANEL STATE ---
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [attendance, setAttendance] = useState([]);
  const [dailyRows, setDailyRows] = useState([]);
  const [presentDays, setPresentDays] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [leaveDays, setLeaveDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);
  const [totalOTSeconds, setTotalOTSeconds] = useState(0);
  const [rangeLabel, setRangeLabel] = useState("");
  const [leftLoading, setLeftLoading] = useState(false);

  const [pfBalance, setPfBalance] = useState(0);
  const [monthlyPF, setMonthlyPF] = useState(0);

  // NEW — remaining leave balance
  const [leaveBalances, setLeaveBalances] = useState([]); // [{name,total,used,remaining}, ...]
  const totalRemainingLeave = leaveBalances.reduce((s, x) => s + (x?.remaining || 0), 0);

  // --- Utils ---
  const toTime = (ts) =>
    ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
  const fmtHrs = (secs) => {
    const h = Math.floor((secs || 0) / 3600);
    const m = Math.floor(((secs || 0) % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const dispatch = useDispatch();
  const refetch = useSelector((state) => state.refetch.refetch);

  const axiosProtect = useAxiosProtect();
  const axiosSecure = useAxiosSecure();

  // ----- PROFILE PIC UPLOAD -----
  const handleUpload = async () => {
    if (!image) {
      toast.error("No image selected");
      return;
    }
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(image.type)) {
      toast.error("Only JPG and PNG files are allowed.");
      return;
    }
    if (image.size > 1024 * 1024) {
      toast.error("File too large. Max 1MB allowed.");
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('email', user.email);

    setUploadLoading(true);
    try {
      await axiosSecure.post('/uploadProfilePic', formData);
      dispatch(setRefetch(!refetch));
      document.querySelector('#changeProfilePic')?.close();
      toast.success('Profile picture changed successfully');
      setImage(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  // ----- SHIFT -----
  useEffect(() => {
    const fetchWorkingShift = async () => {
      try {
        const response = await axiosProtect.get('/gethWorkingShift', {
          params: { userEmail: user?.email },
        });
        setWorkingShift(response.data);
      } catch (error) {
        toast.error('Error fetching shift');
      }
    };
    if (user?.email) fetchWorkingShift();
  }, [user?.email, refetch]); // eslint-disable-line

  // ----- PF / SALARY (salary stays hidden here) -----
  useEffect(() => {
    const loadPF = async () => {
      try {
        const res = await axiosProtect.get("/getSalaryAndPF", {
          params: { userEmail: user?.email },
        });
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        const salary = Number(data?.salary || 0);
        setPfBalance(Number(data?.pfContribution || 0));
        setMonthlyPF(Math.round((salary * 5) / 100));
      } catch {
        /* ignore */
      }
    };
    if (user?.email) loadPF();
  }, [user?.email, refetch]); // eslint-disable-line

  // ----- RANGE HELPERS -----
  const getRange = () => {
    if (customStart && customEnd) return { start: customStart, end: customEnd };
    const [y, m] = selectedMonth.split("-").map(Number);
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);
    const iso = (d) => d.toISOString().slice(0, 10);
    return { start: iso(startDate), end: iso(endDate) };
  };

  const buildLeaveSetForRange = (leaves, start, end) => {
    const out = new Set();
    const s = new Date(start);
    const e = new Date(end);
    for (const lv of leaves) {
      if (lv.email !== user?.email) continue;
      if (lv.status !== "Approved") continue;
      let ls = lv.startDate ? new Date(lv.startDate) : (lv.date ? new Date(lv.date) : null);
      let le = lv.endDate ? new Date(lv.endDate) : null;
      if (!le && ls && lv.totalDays) {
        le = new Date(ls.getTime() + (lv.totalDays - 1) * 86400000);
      }
      if (!ls || !le) continue;
      const from = new Date(Math.max(s.getTime(), ls.getTime()));
      const to = new Date(Math.min(e.getTime(), le.getTime()));
      if (from > to) continue;
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        out.add(d.toISOString().slice(0, 10));
      }
    }
    return out;
  };

  // BD weekend Fri/Sat (change if your org differs)
  const workingDaysInRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay(); // 0 Sun .. 6 Sat
      if (dow === 5 || dow === 6) continue;
      count++;
    }
    return count;
  };

  // ----- LOAD LEFT PANEL -----
  const handleLoad = async () => {
    try {
      setLeftLoading(true);
      const { start, end } = getRange();
      setRangeLabel(`${start} → ${end}`);

      // 1) Attendance
      const aRes = await axiosProtect.get("/admin/attendance/list", {
        params: {
          userEmail: user?.email,
          start,
          end,
          employeeEmail: user?.email,
        },
      });
      const att = Array.isArray(aRes.data) ? aRes.data : [];
      setAttendance(att);

      // 2) Leaves (applied days in range, to compute leaveDays stat)
      const lRes = await axiosProtect.get("/getAppliedLeave", {
        params: { userEmail: user?.email },
      });
      const leaves = Array.isArray(lRes.data) ? lRes.data : [];
      const leaveSet = buildLeaveSetForRange(leaves, start, end);

      // rows
      const rows = att.map((r) => ({
        ...r,
        date:
          r.date ||
          new Date(r.checkInTime || r.checkOutTime || Date.now()).toLocaleDateString("en-CA"),
      }));
      rows.sort((a, b) => {
        if (a.date === b.date) return (a.checkInTime || 0) - (b.checkInTime || 0);
        return a.date < b.date ? -1 : 1;
      });
      setDailyRows(rows);

      // stats
      const uniqueDates = new Set(rows.map((r) => r.date));
      const present = uniqueDates.size;
      setPresentDays(present);
      setLateCount(rows.filter((r) => !!r.lateCheckIn).length);
      setTotalWorkSeconds(rows.reduce((s, r) => s + Number(r.workingHourInSeconds || 0), 0));
      setTotalOTSeconds(rows.reduce((s, r) => s + Number(r.totalOTInSeconds || 0), 0));

      setLeaveDays(leaveSet.size);
      const wd = workingDaysInRange(start, end);
      setAbsentDays(Math.max(wd - present - leaveSet.size, 0));
    } catch (err) {
      toast.error("Failed to load month details");
    } finally {
      setLeftLoading(false);
    }
  };

  // auto-load on mount / when user ready
  useEffect(() => {
    if (user?.email) handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // ----- LOAD REMAINING LEAVE BALANCE -----

  useEffect(() => {
    const loadLeaveBalance = async () => {
      if (!user?.email) return;
      try {
        const { data } = await axiosProtect.get('/employee/leave-balance', {
          params: { userEmail: user.email }
        });
        // data: [{name, remaining}]
        setLeaveBalances(Array.isArray(data) ? data : []);
      } catch {
        setLeaveBalances([]);
      }
    };
    loadLeaveBalance();
  }, [user?.email, refetch]); // eslint-disable-line


  return (
    <div>
      <div className='flex gap-4 overflow-hidden h-[calc(100vh-64px)]'>
        {/* LEFT: analytics + month filter + daily details */}
        <div className="w-3/4 !border !border-gray-300 shadow rounded-md p-4 overflow-y-auto custom-scrollbar">
          {/* Controls */}
          <section className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Select month</label>
              <input
                type="month"
                className="input input-bordered !border !border-gray-300"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <div className="flex-1" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From (optional)</label>
                <input
                  type="date"
                  className="input input-bordered !border !border-gray-300"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To (optional)</label>
                <input
                  type="date"
                  className="input input-bordered !border !border-gray-300"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleLoad}
              className="btn bg-[#6E3FF3] text-white"
              disabled={leftLoading}
            >
              {leftLoading ? "Loading..." : "Load"}
            </button>
          </section>

          {/* Top summary */}
          <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <StatCard label="Present days" value={presentDays} accent="bg-green-100 text-green-700" />
            <StatCard label="Late check-ins" value={lateCount} accent="bg-yellow-100 text-yellow-700" />
            <StatCard label="Leave days (selected range)" value={leaveDays} accent="bg-blue-100 text-blue-700" />
            <StatCard label="No attendance" value={absentDays} accent="bg-red-100 text-red-700" />
            <StatCard label="Total work hrs" value={fmtHrs(totalWorkSeconds)} accent="bg-indigo-100 text-indigo-700" />
            <StatCard label="Total OT hrs" value={fmtHrs(totalOTSeconds)} accent="bg-purple-100 text-purple-700" />
          </section>

          {/* PF & Salary (salary masked here; password-gated on dashboard) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Monthly PF (≈ 5%)</div>
              <div className="text-lg font-semibold">
                {monthlyPF > 0 ? `BDT ${monthlyPF.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
              </div>
            </div>
            <div className="p-3 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">PF Balance</div>
              <div className="text-lg font-semibold">
                {Number(pfBalance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Salary</div>
              <div className="text-lg font-semibold tracking-wider">•••••</div>
              <div className="text-xs text-gray-500 mt-1">View salary from Dashboard (password protected)</div>
            </div>
          </section>

          {/* NEW — Remaining Leave Balance */}
          {/* Remaining Leave Balance (remaining-only) */}
          <section className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Remaining Leave Balance</h3>
              <span className="text-sm text-gray-500">
                Total remaining: <b>{leaveBalances.reduce((s, x) => s + (x?.remaining || 0), 0)}</b> day(s)
              </span>
            </div>

            {leaveBalances?.length ? (
              <div className="space-y-2">
                {leaveBalances.map((lv, idx) => (
                  <div key={idx} className="p-3 rounded-md border border-gray-200 flex items-center justify-between">
                    <div className="text-sm font-medium">{lv.name}</div>
                    <div className="text-sm">
                      <span className="text-gray-600">Remaining: </span>
                      <span className="font-semibold">{lv.remaining}</span> day(s)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 border rounded-md p-3">No leave balance found.</div>
            )}
          </section>


          {/* Daily table */}
          <section>
            <h3 className="font-semibold mb-2">Daily details ({rangeLabel})</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-[#6E3FF3] text-white">
                    <th>Date</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Working</th>
                    <th>OT</th>
                    <th>Late</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRows.length ? (
                    dailyRows.map((r, idx) => (
                      <tr key={`${r.date}-${idx}`} className={r.lateCheckIn ? "text-red-500" : ""}>
                        <td>{r.date}</td>
                        <td>{r.checkInTime ? toTime(r.checkInTime) : "—"}</td>
                        <td>{r.checkOutTime ? toTime(r.checkOutTime) : "—"}</td>
                        <td>{r.workingDisplay || (r.workingHourInSeconds ? fmtHrs(r.workingHourInSeconds) : "—")}</td>
                        <td>{r.totalOTInSeconds ? fmtHrs(r.totalOTInSeconds) : r.displayOTHour || "—"}</td>
                        <td>
                          {r.lateCheckIn ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              {typeof r.lateCheckIn === "string" ? r.lateCheckIn : "Late"}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">On time</span>
                          )}
                        </td>
                        <td>{r.remarks || ""}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 py-6">
                        No attendance found for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT PROFILE CARD */}
        <div className='!border !border-gray-300 w-1/4 shadow rounded-md py-2 px-4 h-[calc(100vh-64px)] sticky top-0'>
          <section className='flex justify-center'>
            <div
              className="relative w-40 h-40 rounded-full !border !border-gray-300 overflow-hidden group"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <img
                src={employee.photo || 'https://i.ibb.co/7gY0J3C/placeholder.png'}
                alt={employee.fullName}
                className="w-full h-full object-cover !border !border-gray-300 rounded-md shadow"
              />
              {hovered && (
                <div
                  className="absolute cursor-pointer bottom-0 w-full bg-[#6E3FF3] text-white text-center py-2 text-sm"
                  onClick={() => document.getElementById('changeProfilePic').showModal()}
                >
                  Change photo
                </div>
              )}
            </div>
          </section>

          <section>
            <div className='mt-4 space-y-[2px]'>
              <h2 className='font-semibold flex items-center gap-2'>
                <MdDriveFileRenameOutline className='text-[#6E3FF3] text-xl' />{employee.fullName}
              </h2>
              <p className='text-sm flex items-center gap-2 tooltip' data-tip="Designation">
                <FaUserTie className='text-[#6E3FF3]' /> {employee.designation}
              </p>
              <p className='text-sm'>
                <a href={`tel:${employee.phoneNumber}`} className='tooltip flex items-center gap-2' data-tip={`Call to ${employee.fullName}`}>
                  <FaPhoneAlt className='text-[#6E3FF3]' /> {employee.phoneNumber}
                </a>
              </p>
              <p className='text-sm'>
                <a href={`mailto:${employee.email}`} className='underline tooltip flex gap-2 items-center'
                  data-tip={`Send mail to ${employee.fullName}`}>
                  <MdEmail className='text-[#6E3FF3]' />{employee.email}
                </a>
              </p>
              <p className='text-sm flex items-center gap-2'>
                <MdBloodtype className='text-[#6E3FF3]' /> {employee.bloodGroup}
              </p>
              <p className='text-sm'>
                <a href={`tel:${employee.emergencyContact}`} className='tooltip flex items-center gap-2'
                  data-tip={`Call to ${employee.emergencyContactPerson} (${employee.emergencyContactPersonRelation})`}>
                  <IoMdHelpBuoy className='text-[#6E3FF3]' /> {employee.emergencyContact}
                </a>
              </p>
              <p className='text-sm flex items-center gap-2 tooltip' data-tip="Joining date">
                <HiMiniCalendarDateRange className='text-[#6E3FF3]' /> Filled-up by admin
              </p>
              <p className='text-sm flex items-center gap-2 tooltip' data-tip="Shift">
                <SiRedhatopenshift className='text-[#6E3FF3]' /> {workingShift}
              </p>
              <p className='text-sm'>
                Status: <span className='!border !border-green-500 rounded-md px-1 capitalize'>
                  {employee.status}
                </span>
              </p>
              <p className='text-sm underline cursor-pointer hover:text-[#6E3FF3] transition-all duration-200 mt-2'
                onClick={() => document.getElementById('viewProfile').showModal()}>
                View full profile
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Change profile picture */}
      <dialog id="changeProfilePic" className="modal">
        <div className="modal-box flex flex-col items-center">
          <input
            type="file"
            ref={inputRef}
            className="file-input file-input-primary !border bg-gray-300"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label className="text-[12px]">Max size 1MB</label>
          <button
            onClick={handleUpload}
            disabled={uploadLoading}
            className={`mt-5 bg-[#6E3FF3] rounded-sm px-3 py-2 text-white ${uploadLoading ? 'opacity-50' : ''}`}
          >
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <ProfileModal />
    </div>
  );
};

export default Employee;
