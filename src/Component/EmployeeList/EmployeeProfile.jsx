import React, { useContext, useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ContextData } from "../../DataProvider";
import useAxiosProtect from "../../utils/useAxiosProtect";

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm text-gray-800">{value || "—"}</span>
  </div>
);

const EmployeeProfile = () => {
  const axiosProtect = useAxiosProtect();
  const { user } = useContext(ContextData);
  const { id } = useParams(); // <-- _id from URL
  const location = useLocation();
  const prefetched = location.state?.prefetched;

  const [employee, setEmployee] = useState(prefetched || null);
  const [loading, setLoading] = useState(!prefetched);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefetched) return; // already have the employee from the list click

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Use existing endpoint; fetch list once and find by _id on client
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

  if (loading) return <div className="p-6 text-sm text-gray-600">Loading profile…</div>;

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
          <div className="text-sm text-gray-500">{employee.designation}</div>
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
        {/* <button
          onClick={() => window.print()}
          className="rounded-xl border px-3 py-2 text-sm font-medium hover:shadow bg-white"
        >
          Print
        </button> */}
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
};

export default EmployeeProfile;
