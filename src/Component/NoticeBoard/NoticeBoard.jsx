import React, { useContext, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import useAxiosProtect from "../../utils/useAxiosProtect";
import { ContextData } from "../../DataProvider";


const tz = "Asia/Dhaka";
const fmt = (d) => (d ? moment(d).tz(tz).format("DD-MMM-YYYY") : "—");

const Badge = ({ tone = "slate", children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${tone}-100 text-${tone}-700`}>
    {children}
  </span>
);

const priorities = {
  info: { label: "Info", tone: "sky" },
  normal: { label: "Normal", tone: "slate" },
  high: { label: "High", tone: "rose" },
};

const NoticeBoard = () => {
  const axiosProtect = useAxiosProtect();
  const { user } = useContext(ContextData);

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const fetchNotices = async () => {
    if (!user?.email) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosProtect.get("/notice/list", {
        params: { userEmail: user.email },
      });
      setNotices(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line
  }, [user?.email]);

  const filtered = useMemo(() => {
    const now = moment();
    const s = search.toLowerCase();

    return notices
      .filter((n) => {
        const expired = n.expiryDate && moment(n.expiryDate).isBefore(now, "day");
        if (showActiveOnly && expired) return false;

        const matchText =
          !s ||
          n?.title?.toLowerCase().includes(s) ||
          n?.body?.toLowerCase().includes(s) ||
          n?.priority?.toLowerCase().includes(s);
        if (!matchText) return false;

        // date filter uses effectiveDate if available, else createdAt
        const ref = n.effectiveDate || n.createdAt;
        const refM = ref ? moment(ref) : null;
        const fromOk = !dateFrom || (refM && refM.isSameOrAfter(moment(dateFrom).startOf("day")));
        const toOk = !dateTo || (refM && refM.isSameOrBefore(moment(dateTo).endOf("day")));
        return fromOk && toOk;
      })
      .sort((a, b) => moment(b.effectiveDate || b.createdAt).valueOf() - moment(a.effectiveDate || a.createdAt).valueOf());
  }, [notices, search, showActiveOnly, dateFrom, dateTo]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notice Board</h1>
          <p className="text-sm text-slate-500">Read notices and download attached PDFs.</p>
        </div>
        {loading && <div className="text-xs text-slate-500">Loading…</div>}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Search title / message / priority"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 w-20">From</span>
            <DatePicker
              selected={dateFrom}
              onChange={(d) => setDateFrom(d)}
              className="w-full rounded-xl border px-3 py-2"
              dateFormat="dd-MMM-yyyy"
              isClearable
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 w-20">To</span>
            <DatePicker
              selected={dateTo}
              onChange={(d) => setDateTo(d)}
              className="w-full rounded-xl border px-3 py-2"
              dateFormat="dd-MMM-yyyy"
              isClearable
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
            />
            Show active only
          </label>
        </div>
      </div>

      {/* Cards list */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((n) => {
          const pr = priorities[n.priority] || priorities.normal;
          const expired = n.expiryDate && moment(n.expiryDate).isBefore(moment(), "day");
          const nearExpiry = n.expiryDate && moment(n.expiryDate).diff(moment(), "days") <= 3;

          return (
            <div key={n._id} className="rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{n.title}</h3>
                <Badge tone={pr.tone}>{pr.label}</Badge>
              </div>
              <div className="text-sm text-slate-600 whitespace-pre-wrap">{n.body || "—"}</div>

              <div className="text-xs text-slate-500">
                <div>Effective: {fmt(n.effectiveDate)}</div>
                <div>Expiry: {fmt(n.expiryDate)}</div>
                {expired && <div className="mt-1"><Badge tone="rose">Expired</Badge></div>}
                {!expired && nearExpiry && <div className="mt-1"><Badge tone="amber">Expiring Soon</Badge></div>}
              </div>

              <div className="flex items-center gap-3 mt-2">
                {n.fileUrl ? (
                  <>
                    <a
                      href={n.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border px-3 py-1.5 text-sm hover:shadow"
                    >
                      View PDF
                    </a>
                    <a
                      href={n.fileUrl}
                      download
                      className="rounded-xl border px-3 py-1.5 text-sm hover:shadow"
                    >
                      Download
                    </a>
                  </>
                ) : (
                  <span className="text-slate-400 text-sm">No attachment</span>
                )}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Posted by {n.createdBy?.fullName || "Admin"} {n.createdAt ? `• ${fmt(n.createdAt)}` : ""}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
          No notices found.
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
