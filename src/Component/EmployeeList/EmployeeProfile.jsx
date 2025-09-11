import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ContextData } from "../../DataProvider";
import useAxiosProtect from "../../utils/useAxiosProtect";
import { toast } from "react-toastify";

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm text-gray-800">{value || "—"}</span>
  </div>
);

const PencilIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${props.className || ""}`}>
    <path d="M17.414 2.586a2 2 0 00-2.828 0L6.5 10.672V13.5h2.828l8.086-8.086a2 2 0 000-2.828z" />
    <path d="M4 16h12v2H4a2 2 0 01-2-2V4h2v12z" />
  </svg>
);

const EmployeeProfile = () => {
  const axiosProtect = useAxiosProtect();
  const { user } = useContext(ContextData);
  const { id } = useParams();
  const location = useLocation();
  const prefetched = location.state?.prefetched;

  const [employee, setEmployee] = useState(prefetched || null);
  const [loading, setLoading] = useState(!prefetched);
  const [error, setError] = useState("");

  // designation edit states
  const [designations, setDesignations] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState("");

  // Load employee (fallback) if opened directly
  useEffect(() => {
    if (prefetched) {
      setEmployee(prefetched);
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
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

  // Load designations for dropdown
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
        // fallback: minimal list with current designation
        setDesignations((prev) => {
          const cur = prefetched?.designation || employee?.designation;
          const base = ["Admin", "HR-ADMIN", "Team Leader", "Developer", "Employee"];
          const s = new Set([...(prev || []), ...(base || []), cur].filter(Boolean));
          return Array.from(s);
        });
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosProtect, user?.email, employee?._id]);

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
      // update UI
      setEmployee((e) => ({ ...e, designation: selectedDesignation }));
      setEditMode(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update designation");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !employee) return <div className="p-6 text-sm text-gray-600">Loading profile…</div>;

  if (error || !employee) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          {error || "Employee not found"}
        </div>
        <Link to="/" className="inline-block mt-4 text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center gap-6">
        <img
          src={employee.photo}
          alt={employee.fullName}
          className="w-28 h-28 rounded-2xl object-cover border"
        />
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
                <button
                  onClick={saveDesignation}
                  className="rounded-xl bg-slate-900 text-white px-3 py-1.5 text-sm"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded-xl border px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
              Status: {employee.status || "N/A"}
            </span>
            {employee.bloodGroup && (
              <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                Blood: {employee.bloodGroup}
              </span>
            )}
            {employee.eid && (
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                EID: {employee.eid}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Basics */}
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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default EmployeeProfile;
