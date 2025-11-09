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

const priorities = [
  { key: "info", label: "Info", tone: "sky" },
  { key: "normal", label: "Normal", tone: "slate" },
  { key: "high", label: "High", tone: "rose" },
];

const NoticeBoardAdmin = () => {
  const axiosProtect = useAxiosProtect();
  const { user } = useContext(ContextData);

  // form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [effectiveDate, setEffectiveDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(null);
  const [file, setFile] = useState(null);
  const [sendEmail, setSendEmail] = useState(true);

  // list & UI state
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title?.trim()) return toast.info("Title is required");
    if (!body?.trim() && !file) return toast.info("Message or PDF attachment is required");

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("body", body.trim());
    fd.append("priority", priority);
    fd.append("effectiveDate", effectiveDate ? moment(effectiveDate).toISOString() : "");
    fd.append("expiryDate", expiryDate ? moment(expiryDate).toISOString() : "");
    fd.append("sendEmail", String(sendEmail));
    if (file) fd.append("file", file);

    setSubmitting(true);
    setError("");
    try {
      await axiosProtect.post("/notice/create", fd, {
        params: { userEmail: user?.email },
        headers: { "Content-Type": "multipart/form-data" },
      });

      // reset form
      setTitle("");
      setBody("");
      setPriority("normal");
      setEffectiveDate(new Date());
      setExpiryDate(null);
      setFile(null);
      setSendEmail(true);

      // refresh list
      fetchNotices();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to submit notice");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return notices
      .filter((n) => {
        const inText =
          !s ||
          n?.title?.toLowerCase().includes(s) ||
          n?.body?.toLowerCase().includes(s) ||
          n?.priority?.toLowerCase().includes(s) ||
          n?.createdBy?.fullName?.toLowerCase().includes(s);
        if (!inText) return false;

        // date window
        const ed = n.effectiveDate ? moment(n.effectiveDate) : null;
        const fromOk = !dateFrom || (ed && ed.isSameOrAfter(moment(dateFrom).startOf("day")));
        const toOk = !dateTo || (ed && ed.isSameOrBefore(moment(dateTo).endOf("day")));
        return fromOk && toOk;
      })
      .sort((a, b) => moment(b.effectiveDate || b.createdAt).valueOf() - moment(a.effectiveDate || a.createdAt).valueOf());
  }, [notices, search, dateFrom, dateTo]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notice Board — Admin</h1>
          <p className="text-sm text-slate-500">Create notices, attach PDF, and email all employees.</p>
        </div>
      </div>

      {/* Create Notice */}
      <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Title *</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Maintenance downtime on Friday"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Priority</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {priorities.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Effective Date</label>
            <DatePicker
              selected={effectiveDate}
              onChange={(d) => setEffectiveDate(d || new Date())}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              dateFormat="dd-MMM-yyyy"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Expiry Date (optional)</label>
            <DatePicker
              selected={expiryDate}
              onChange={(d) => setExpiryDate(d)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              dateFormat="dd-MMM-yyyy"
              isClearable
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-600">Message</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Short description for the notice"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Attach PDF (optional)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
            />
            <p className="text-xs text-slate-500 mt-1">Max ~10MB.</p>
          </div>
          <div className="flex items-end gap-3">
            <label className="inline-flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">Send email to all employees</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:shadow disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Publish Notice"}
          </button>
          {error && <div className="text-sm text-rose-600">{error}</div>}
        </div>
      </form>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="rounded-xl border px-3 py-2"
            placeholder="Search title / message / priority / author"
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
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b font-semibold flex items-center justify-between">
          <span>Recent Notices</span>
          {loading && <span className="text-xs text-slate-500">Loading…</span>}
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-slate-600 font-medium">Title</th>
                <th className="px-3 py-2 text-left text-slate-600 font-medium">Dates</th>
                <th className="px-3 py-2 text-left text-slate-600 font-medium">Priority</th>
                <th className="px-3 py-2 text-left text-slate-600 font-medium">Attachment</th>
                <th className="px-3 py-2 text-left text-slate-600 font-medium">Author</th>
                <th className="px-3 py-2 text-left text-slate-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((n) => {
                const pr = priorities.find((p) => p.key === n.priority) || priorities[1];
                const nearExpiry =
                  n.expiryDate && moment(n.expiryDate).diff(moment(), "days") <= 3;
                const expired = n.expiryDate && moment(n.expiryDate).isBefore(moment(), "day");
                return (
                  <tr key={n._id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="font-medium">{n.title}</div>
                      {n.body && (
                        <div className="text-xs text-slate-500 line-clamp-2">{n.body}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-slate-600">
                        Effective: {fmt(n.effectiveDate)}
                      </div>
                      <div className="text-xs text-slate-600">
                        Expiry: {fmt(n.expiryDate)}
                      </div>
                      {expired && <div className="mt-1"><Badge tone="rose">Expired</Badge></div>}
                      {!expired && nearExpiry && <div className="mt-1"><Badge tone="amber">Expiring Soon</Badge></div>}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={pr.tone}>{pr.label}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      {n.fileUrl ? (
                        <a
                          className="text-indigo-600 hover:underline"
                          href={n.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        {n.createdBy?.fullName || "—"}
                        {n.createdBy?.email && (
                          <div className="text-slate-500">{n.createdBy.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        {n.fileUrl && (
                          <a
                            className="rounded-lg border px-2 py-1 text-xs hover:shadow"
                            href={n.fileUrl}
                            download
                          >
                            Download
                          </a>
                        )}
                        {/* Optional: delete handler if you add a DELETE endpoint
                        <button
                          onClick={() => handleDelete(n._id)}
                          className="rounded-lg border px-2 py-1 text-xs hover:shadow text-rose-600 border-rose-200"
                        >
                          Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    No notices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs text-slate-500">
          Showing {filtered.length} of {notices.length}
        </div>
      </div>
    </div>
  );
};

export default NoticeBoardAdmin;
