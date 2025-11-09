import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Clock,
  ChevronRight,
  Bell,
  Info,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  BadgeCheck,
  TimerReset,
  Lock,
  Unlock,
  KeyRound,
} from 'lucide-react';
import moment from 'moment-timezone';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import useAxiosProtect from '../../utils/useAxiosProtect';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { ContextData } from '../../DataProvider';
import { setRefetch } from '../../redux/refetchSlice';

const SALARY_UNLOCK_KEY = 'salaryUnlocked:v1'; // session storage key

const EmployeeDashboard = () => {
  const axiosProtect = useAxiosProtect(); // GET
  const axiosSecure = useAxiosSecure();   // POST/PUT/DELETE

  const { user, attendanceInfo, salaryAndPF } = useContext(ContextData);
  const dispatch = useDispatch();
  const refetch = useSelector((state) => state.refetch.refetch);
  const navigate = useNavigate();

  // ---------------- UI state ----------------
  const [clock, setClock] = useState({ hh: '--', mm: '--', ss: '--', ap: '--' });

  // Salary lock state
  const [salaryUnlocked, setSalaryUnlocked] = useState(
    typeof window !== 'undefined' ? sessionStorage.getItem(SALARY_UNLOCK_KEY) === '1' : false
  );
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // ---------------- DB-backed state ----------------
  const [employee, setEmployee] = useState(null);              // /getEmployee
  const [checkIn, setCheckIn] = useState(null);                // /getCheckInInfo (today)
  const [checkOut, setCheckOut] = useState(null);              // /getCheckOutInfo (today)
  const [otStart, setOtStart] = useState(null);                // /getStartOTInfo (today)
  const [otStop, setOtStop] = useState(null);                  // /getStopOTTime (today)
  const [shiftedEmployees, setShiftedEmployees] = useState([]);// /gethShiftedEmployee
  const [notifications, setNotifications] = useState([]);      // /getEmployeeNotification

  // ---------------- Live clock ----------------
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const parts = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const [time, ap] = parts.split(' ');
      const [hh, mm, ss] = time.split(':');
      setClock({ hh, mm, ss, ap });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const todayStr = useMemo(() => moment(new Date()).format('DD-MMM-YYYY'), []);
  const monthName = moment().format('MMMM');

  // ---------------- Fetch: profile ----------------
  useEffect(() => {
    if (!user?.email) return;
    const run = async () => {
      try {
        const res = await axiosProtect.get('/getEmployee', {
          params: { userEmail: user.email },
        });
        setEmployee(res.data || null);
      } catch {}
    };
    run();
  }, [axiosProtect, user?.email]);

  // ---------------- Fetch: shift list (for current user's shift) ----------------
  useEffect(() => {
    if (!user?.email) return;
    const run = async () => {
      try {
        const res = await axiosProtect.get('/gethShiftedEmployee', {
          params: { userEmail: user.email },
        });
        setShiftedEmployees(res.data || []);
      } catch {}
    };
    run();
  }, [axiosProtect, user?.email, refetch]);

  // ---------------- Fetch: notifications ----------------
  useEffect(() => {
    if (!user?.email) return;
    const run = async () => {
      try {
        const res = await axiosProtect.get('/getEmployeeNotification', {
          params: { userEmail: user.email },
        });
        setNotifications(res.data || []);
      } catch {}
    };
    run();
  }, [axiosProtect, user?.email, refetch]);

  // ---------------- Fetch: check-in/out and OT states (today) ----------------
  useEffect(() => {
    if (!user?.email) return;

    const load = async () => {
      try {
        const [ci, co, otS, otE] = await Promise.all([
          axiosProtect.get('/getCheckInInfo',  { params: { userEmail: user.email, date: todayStr } }),
          axiosProtect.get('/getCheckOutInfo', { params: { userEmail: user.email, date: todayStr } }),
          axiosProtect.get('/getStartOTInfo',  { params: { userEmail: user.email, date: todayStr } }),
          axiosProtect.get('/getStopOTTime',   { params: { userEmail: user.email, date: todayStr } }),
        ]);
        setCheckIn(ci.data || null);
        setCheckOut(co.data || null);
        setOtStart(otS.data || null);
        setOtStop(otE.data || null);
      } catch {}
    };
    load();
  }, [axiosProtect, user?.email, todayStr, refetch]);

  // ---------------- Quick stats (this month) from ContextData.attendanceInfo ----------------
  const thisMonthAttendance = useMemo(() => {
    return (attendanceInfo || []).filter(a => a?.email === user?.email && a?.month === monthName);
  }, [attendanceInfo, user?.email, monthName]);

  const presentCount = thisMonthAttendance.length || 0;
  const lateCount = thisMonthAttendance.filter(a => !!a.lateCheckIn).length || 0;
  const totalOTSecondsThisMonth = thisMonthAttendance.reduce((acc, a) => acc + (Number(a.totalOTInSeconds) || 0), 0);
  const totalOTH = Math.floor(totalOTSecondsThisMonth / 3600);
  const totalOTM = Math.floor((totalOTSecondsThisMonth % 3600) / 60);

  // ---------------- Today: work & OT ----------------
  const inTime = checkIn?.checkInTime || 0;
  const outTime = checkOut?.checkOutTime || 0;
  const workedMs = outTime && inTime ? (outTime - inTime) : 0;
  const workedH = Math.floor((workedMs / 1000) / 3600) || 0;
  const workedM = Math.floor(((workedMs / 1000) % 3600) / 60) || 0;

  const otStartMs = otStart?.startingOverTime || 0;
  const otStopMs = otStop?.OTStopTime || 0;
  const otMs = (otStartMs && otStopMs) ? (otStopMs - otStartMs) : 0;
  const otH = Math.floor((otMs / 1000) / 3600) || 0;
  const otM = Math.floor(((otMs / 1000) % 3600) / 60) || 0;

  // ---------------- Shift name for check-out early confirmation ----------------
  const myShiftName = useMemo(() => {
    const byEmail = shiftedEmployees.find(e => e.email === user?.email);
    return byEmail?.shiftName || 'General';
  }, [shiftedEmployees, user?.email]);

  // ---------------- Actions ----------------
  const handleCheckIn = async () => {
    try {
      const payload = {
        date: todayStr,
        month: moment().format('MMMM'),
        checkInTime: Date.now(),
        displayTime: moment().format('hh:mm:ss A'),
        signInTime: moment(user?.metadata?.lastSignInTime).format('DD MMM hh:mm:ss A'),
        email: user.email,
      };
      const res = await axiosSecure.post('/employee/checkIn', payload);
      dispatch(setRefetch(!refetch));
      res.data?.message === 'Check-in successful' ? toast.success(res.data.message) : toast.warning(res.data?.message);
    } catch {
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const now = moment().tz('Asia/Dhaka');
      const morningShiftEnd = now.clone().startOf('day').add(14, 'hours').valueOf();  // 2:00 PM
      const generalShiftEnd = now.clone().startOf('day').add(18, 'hours').valueOf();  // 6:00 PM
      const eveningShiftEnd = now.clone().startOf('day').add(22, 'hours').valueOf();  // 10:00 PM

      const isEarly =
        (myShiftName === 'Morning' && now.valueOf() < morningShiftEnd) ||
        (myShiftName === 'General' && now.valueOf() < generalShiftEnd) ||
        (myShiftName === 'Evening' && now.valueOf() < eveningShiftEnd);

      if (isEarly) {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'You are going to check out before the end of your shift.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, check-out',
        });
        if (!result.isConfirmed) return;
      }

      const payload = {
        date: todayStr,
        month: moment().format('MMMM'),
        checkOutTime: Date.now(),
        displayTime: moment().format('hh:mm:ss A'),
        email: user.email,
      };
      const res = await axiosSecure.post('/employee/checkOut', payload);
      dispatch(setRefetch(!refetch));
      res.data?.message === 'Check-out successful' ? toast.success(res.data.message) : toast.warning(res.data?.message || 'Check-out response unknown');
    } catch {
      toast.error('Check-out failed');
    }
  };

  const handleStartOT = async () => {
    try {
      if (checkIn?.checkInTime && !checkOut?.checkOutTime) {
        return toast.error('You are still on duty.');
      }
      const payload = {
        date: todayStr,
        month: moment().format('MMMM'),
        startingOverTime: Date.now(),
        displayTime: moment().format('hh:mm:ss A'),
        signInTime: moment(user?.metadata?.lastSignInTime).format('DD MMM hh:mm:ss A'),
        email: user.email,
      };
      const res = await axiosSecure.post('/employee/startOverTime', payload);
      dispatch(setRefetch(!refetch));
      res.data?.message === 'Over time started' ? toast.success(res.data.message) : toast.warning(res.data?.message);
    } catch {
      toast.error('OT start failed');
    }
  };

  const handleStopOT = async () => {
    try {
      const payload = {
        date: todayStr,
        month: moment().format('MMMM'),
        OTStopTime: Date.now(),
        displayTime: moment().format('hh:mm:ss A'),
        email: user.email,
      };
      const res = await axiosSecure.post('/employee/stopOverTime', payload);
      dispatch(setRefetch(!refetch));
      res.data?.message === 'OT stop successful' ? toast.success(res.data.message) : toast.warning(res.data?.message);
    } catch {
      toast.error('OT stop failed');
    }
  };

  const goToLeaveApplication = () => navigate('/leaveApplication');

  // ---------------- Salary lock handlers ----------------
  const openUnlockModal = () => {
    setUnlockPin('');
    setShowUnlockModal(true);
  };
  const closeUnlockModal = () => setShowUnlockModal(false);

  const submitUnlock = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosSecure.post(
        '/employee/salary-pin/verify',
        { pin: unlockPin },
        { params: { userEmail: user.email } }
      );
      if (res.data?.success) {
        setSalaryUnlocked(true);
        sessionStorage.setItem(SALARY_UNLOCK_KEY, '1'); // unlock for this tab/session
        toast.success('Salary unlocked for this session');
        closeUnlockModal();
      } else {
        toast.error(res.data?.message || 'Invalid PIN');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to verify PIN');
    }
  };

  const lockSalary = () => {
    setSalaryUnlocked(false);
    sessionStorage.removeItem(SALARY_UNLOCK_KEY);
    toast.info('Salary locked');
  };

  const openChangePinModal = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setShowChangePinModal(true);
  };
  const closeChangePinModal = () => setShowChangePinModal(false);

  const submitChangePin = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4 || newPin.length > 12) {
      return toast.error('PIN must be 4-12 characters');
    }
    if (newPin !== confirmPin) return toast.error('PINs do not match');

    try {
      const res = await axiosSecure.post(
        '/employee/salary-pin/set',
        { currentPin: currentPin || undefined, newPin },
        { params: { userEmail: user.email } }
      );
      if (res.data?.success) {
        toast.success('PIN saved');
        closeChangePinModal();
      } else {
        toast.error(res.data?.message || 'Failed to save PIN');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save PIN');
    }
  };

  // ---------------- Helpers ----------------
  const fmt = (ms) => (ms ? moment(ms).format('hh:mm:ss A') : '—');

  const maskedSalary = '••••';
  const monthlySalary = Number(salaryAndPF?.salary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const monthlyPF = Number(((Number(salaryAndPF?.salary || 0) * 5) / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pfBalance = Number(salaryAndPF?.pfContribution || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-6 space-y-6">
      {/* Header / Profile */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={employee?.photo || 'https://i.ibb.co/6WfW6mS/user.png'}
              alt={employee?.fullName || 'profile'}
              className="w-20 h-20 rounded-xl object-cover border"
            />
            <div>
              <div className="text-xl font-semibold">{employee?.fullName || '--'}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Briefcase size={16} /> {employee?.designation || '—'}
                <span className="mx-2">•</span>
                <BadgeCheck size={16} />
                <span className={employee?.status === 'Active' ? 'text-green-600' : 'text-red-500'}>
                  {employee?.status || '—'}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1"><Mail size={14} /> {employee?.email || user?.email}</span>
                {employee?.phoneNumber && <span className="inline-flex items-center gap-1"><Phone size={14} /> {employee.phoneNumber}</span>}
                {employee?.address && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {employee.address}</span>}
                {employee?.DOB && <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> DOB: {employee.DOB}</span>}
              </div>
            </div>
          </div>

          {/* Live clock + shift */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">Current Time</div>
              <div className="flex items-center gap-1 justify-center text-lg font-semibold">
                <Clock size={18} />
                <span className="bg-indigo-600 text-white px-2 py-1 rounded">{clock.hh}</span>:
                <span className="bg-indigo-600 text-white px-2 py-1 rounded">{clock.mm}</span>:
                <span className="bg-indigo-600 text-white px-2 py-1 rounded">{clock.ss}</span>
                <span className="bg-indigo-600 text-white px-2 py-1 rounded">{clock.ap}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">Shift: <b>{(shiftedEmployees.find(e => e.email === user?.email)?.shiftName) || 'General'}</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Tracking */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Time Tracking (Today)</h2>
          <div className="text-xs text-gray-500">Date: {todayStr}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Check-in</div>
            <div className="text-lg font-semibold">{checkIn?.displayTime || '—'}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Check-out</div>
            <div className="text-lg font-semibold">{checkOut?.displayTime || '—'}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Worked</div>
            <div className="text-lg font-semibold">{`${workedH}h ${workedM}m`}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-1">Overtime</div>
            <div className="text-lg font-semibold">{`${otH}h ${otM}m`}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          {!checkIn
            ? (!checkOut && (
                <button onClick={handleCheckIn} className="btn bg-green-600 hover:bg-green-700 text-white">Check In</button>
              ))
            : (!checkOut && (
                <button onClick={handleCheckOut} className="btn bg-red-600 hover:bg-red-700 text-white">Check Out</button>
              ))
          }

          {!otStart
            ? (
              <button onClick={handleStartOT} className="btn bg-yellow-600 hover:bg-yellow-700 text-white">Start OT</button>
            )
            : (!otStop && (
              <button onClick={handleStopOT} className="btn bg-red-600 hover:bg-red-700 text-white">Stop OT</button>
            ))
          }

          <button onClick={goToLeaveApplication} className="btn bg-indigo-600 hover:bg-indigo-700 text-white">
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Quick Stats + Salary/PF + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">This Month</h3>
            <span className="text-xs text-gray-500">{monthName}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center border">
              <div className="text-xs text-gray-500">Present</div>
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center border">
              <div className="text-xs text-gray-500">Late In</div>
              <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center border">
              <div className="text-xs text-gray-500">Total OT</div>
              <div className="text-2xl font-bold text-indigo-600">
                {totalOTH}h
                <span className="text-sm text-gray-500 ml-1">{totalOTM}m</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
            <TimerReset size={14} /> Updated now
          </div>
        </div>

        {/* Salary & PF (Salary locked by PIN) */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Salary & PF</h3>
            <div className="flex items-center gap-2">
              {!salaryUnlocked ? (
                <button onClick={openUnlockModal} className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
                  <Unlock size={16} /> Unlock
                </button>
              ) : (
                <button onClick={lockSalary} className="btn btn-sm bg-gray-200 text-gray-700 flex items-center gap-1">
                  <Lock size={16} /> Lock
                </button>
              )}
              <button onClick={openChangePinModal} className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1">
                <KeyRound size={16} />PIN
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Salary – masked until unlocked */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-500">Monthly Salary</div>
              <div className={`font-semibold ${salaryUnlocked ? 'text-green-600' : 'text-gray-700'}`}>
                {salaryUnlocked ? monthlySalary : maskedSalary}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-500">PF Status</div>
              <div className="font-semibold">{salaryAndPF?.pfStatus || 'inactive'}</div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-500">Monthly PF (5%)</div>
              <div className="font-semibold text-blue-600">
                {monthlyPF}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-500">Total PF Balance</div>
              <div className="font-semibold text-blue-600">
                {pfBalance}
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 text-sm rounded-lg border border-blue-100 flex items-start">
            <Info size={16} className="text-blue-600 mr-2 mt-0.5" />
            <div>
              Your salary is hidden by default on this device. Click <b>Unlock Salary</b> and enter your PIN to view it. It will re-lock when you close this tab.
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Bell size={18} /> Notifications
            </h3>
            <span className="text-xs text-gray-500">Recent</span>
          </div>
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {notifications?.length
              ? notifications.map((n) => (
                  <div key={String(n._id)} className="border-b border-gray-100 pb-2">
                    <div className="text-sm">{n.notification}</div>
                    <div className="text-xs text-gray-500 mt-1">{n.createdAt ? moment(n.createdAt).fromNow() : ''}</div>
                  </div>
                ))
              : <div className="text-sm text-gray-500">No notifications.</div>}
          </div>
        </div>
      </div>

      {/* Attendance – last 7 days */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Attendance (Last 7 days)</h3>
          <div className="text-xs text-gray-500">Auto-fetched</div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Worked</th>
                <th>OT</th>
                <th>Late In</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(attendanceInfo) && attendanceInfo.length ? (
                attendanceInfo.map((row, idx) => (
                  <tr key={idx} className={row.lateCheckIn ? 'text-red-600' : ''}>
                    <td>{row.date || '—'}</td>
                    <td>{fmt(row.checkInTime)}</td>
                    <td>{fmt(row.checkOutTime)}</td>
                    <td>{row.workingDisplay || '—'}</td>
                    <td>{row.displayOTHour || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {row.lateCheckIn || 'On time'}
                        {row.lateCheckIn && (
                          <sup className="ml-1 bg-red-500 px-2 py-0.5 rounded-2xl text-white text-[10px]">late</sup>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-sm text-gray-500">No records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Info / Misc */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Company & Policy</h3>
          <button className="text-blue-600 text-sm flex items-center gap-1">
            View Details <ChevronRight size={16} />
          </button>
        </div>
        <div className="mt-2 p-3 bg-blue-50 text-sm rounded-lg border border-blue-100 flex items-start">
          <Info size={16} className="text-blue-600 mr-2 mt-0.5" />
          <div>
            <span className="font-medium">Data privacy: </span>
            Never share your salary PIN. Your salary view unlock lasts only while this tab is open.
          </div>
        </div>
      </div>

      {/* Unlock Salary Modal */}
      {showUnlockModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3">Unlock Salary</h3>
            <form onSubmit={submitUnlock} className="space-y-3">
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Enter PIN"
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                autoFocus
              />
              <div className="modal-action">
                <button type="button" className="btn" onClick={closeUnlockModal}>Cancel</button>
                <button type="submit" className="btn bg-indigo-600 text-white">Unlock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set / Change PIN Modal */}
      {showChangePinModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-3">Set / Change Salary PIN</h3>
            <form onSubmit={submitChangePin} className="space-y-3">
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Current PIN (leave blank if none)"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
              />
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="New PIN (4-12 chars)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                required
              />
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Confirm New PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                required
              />
              <div className="modal-action">
                <button type="button" className="btn" onClick={closeChangePinModal}>Cancel</button>
                <button type="submit" className="btn bg-yellow-600 text-white">Save PIN</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
