import React, { useContext } from "react";
import { ContextData } from "../../DataProvider";
import { Link } from "react-router-dom";

const EmployeeList = () => {
  const { employeeList, setSearchEmployee } = useContext(ContextData);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Employee List</h1>

      {/* Search & Add */}
      <section>
        <div className="flex gap-2 items-center mb-4">
          <input
            type="text"
            placeholder="Search Employee"
            className="bg-gray-200 rounded-lg p-2 w-full"
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
          {employeeList?.map((emp) => (
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
                className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-gray-800 text-center">{emp.fullName}</h2>
              <p className="text-sm text-gray-500 text-center mb-2">{emp.designation}</p>
              <div className="text-sm text-gray-700 space-y-1 text-center">
                <p><span className="font-semibold">Phone:</span> {emp.phoneNumber}</p>
                <p><span className="font-semibold">Blood Group:</span> {emp.bloodGroup}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EmployeeList;
