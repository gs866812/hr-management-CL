import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ContextData } from '../../DataProvider';
import moment from 'moment';
import useAxiosSecure from '../../utils/useAxiosSecure';
import { toast } from 'react-toastify';

const LeaveApplication = () => {
  const { user, employeeList } = useContext(ContextData);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm();

  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveDates, setLeaveDates] = useState([]); // ✅ leave dates state

  const currentEmployee = employeeList.find(emp => emp.email === user?.email);

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (currentEmployee) {
      setValue('employeeName', currentEmployee?.fullName);
      setValue('employeeId', currentEmployee.eid);
      setValue('department', currentEmployee.department || 'Webbriks');
      setValue('position', currentEmployee?.designation);
    }
  }, [currentEmployee, setValue]);

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // ✅ Helper: Get leave dates excluding Sundays
  const getLeaveDates = (start, end) => {
    const startDt = moment(start);
    const endDt = moment(end);
    const dateList = [];

    while (startDt <= endDt) {
      if (startDt.day() !== 0) { // 0 = Sunday
        dateList.push(startDt.format('DD-MMM-YYYY'));
      }
      startDt.add(1, 'days');
    }

    return dateList;
  };


  // ✅ Watch for date change and update leaveDates
  useEffect(() => {
    if (startDate && endDate) {
      const list = getLeaveDates(startDate, endDate);
      setLeaveDates(list);
    } else {
      setLeaveDates([]);
    }
  }, [startDate, endDate]);

  const onSubmit = async (data) => {
    const updatedData = {
      ...data,
      startDate: moment(data.startDate).format('DD-MMM-YYYY'),
      endDate: moment(data.endDate).format('DD-MMM-YYYY'),
      leaveDates,
      totalDays: leaveDates.length,
      appliedDate: moment().format('DD-MMM-YYYY'),
      email: user?.email,
      status: 'Pending',
    };

    // console.log(updatedData);
    setIsSubmitting(true);
    try {
      const response = await axiosSecure.post('/appliedLeave', updatedData);
      if (response.data.message === 'success') {
        toast.success('Leave request submitted successfully');
        console.log(response.data);
        reset();
      }else{
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to submit leave application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDays = leaveDates.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Application</h1>
        <p className="text-gray-600">Submit your leave request here. Please provide all necessary details.</p>
      </div>

      {submissionStatus && (
        <div className={`mb-6 p-4 rounded-md ${submissionStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submissionStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6">
        {/* Basic Information */}
        {/* ... (no change in basic info section) */}

        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#6E3FF3] mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="employeeName"
                type="text"
                readOnly
                {...register('employeeName', { required: 'Full name is required' })}
                className={`w-full px-3 py-2 border ${errors.employeeName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              />
              {errors.employeeName && <p className="mt-1 text-sm text-red-600">{errors.employeeName.message}</p>}
            </div>

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                id="employeeId"
                type="text"
                readOnly
                {...register('employeeId', { required: 'Employee ID is required' })}
                className={`w-full px-3 py-2 border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              />
              {errors.employeeId && <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                id="department"
                type="text"
                readOnly
                {...register('department', { required: 'Department is required' })}
                className={`w-full px-3 py-2 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              />
              {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                id="position"
                type="text"
                readOnly
                {...register('position', { required: 'Position is required' })}
                className={`w-full px-3 py-2 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              />
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
            </div>
          </div>
        </div>

        {/* Leave Details */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#6E3FF3] mb-4">Leave Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Type, Contact Number, Dates */}
            {/* ... unchanged inputs ... */}

            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leaveType"
                {...register('leaveType', { required: 'Leave type is required' })}
                className={`w-full px-3 py-2 border ${errors.leaveType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              >
                <option value="">Select Leave Type</option>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
              </select>
              {errors.leaveType && <p className="mt-1 text-sm text-red-600">{errors.leaveType.message}</p>}
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number During Leave <span className="text-red-500">*</span>
              </label>
              <input
                id="contactNumber"
                type="tel"
                {...register('contactNumber', {
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[0-9]{10,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className={`w-full px-3 py-2 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
                placeholder="e.g. 017xxxxxxxx"
              />
              {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>}
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="startDate"
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className={`w-full px-3 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="endDate"
                type="date"
                {...register('endDate', {
                  required: 'End date is required',
                  validate: (value) => !startDate || new Date(value) >= new Date(startDate) || 'End date must be after start date'
                })}
                className={`w-full px-3 py-2 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
            </div>

            <div>
              <label htmlFor="totalDays" className="block text-sm font-medium text-gray-700 mb-1">
                Total Days (excluding Sundays)
              </label>
              <input
                id="totalDays"
                type="number"
                value={totalDays || ''}
                readOnly
                {...register('totalDays')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
          </div>

          {/* ✅ Show leaveDates list */}
          {leaveDates.length > 0 && (
            <div className="mt-4 text-sm text-gray-700">
              <strong>Leave Dates (excluding Sundays):</strong>
              <ul className="list-disc ml-5 mt-1">
                {leaveDates.map(date => (
                  <li key={date}>{date}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reason and Handover */}
          <div className="mt-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows="4"
              {...register('reason', {
                required: 'Reason is required',
                minLength: { value: 10, message: 'Reason must be at least 10 characters' }
              })}
              className={`w-full px-3 py-2 border ${errors.reason ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
              placeholder="Please provide details about your leave reason..."
            ></textarea>
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
          </div>

          <div className="mt-6">
            <label htmlFor="handoverPerson" className="block text-sm font-medium text-gray-700 mb-1">
              Handover To (if applicable)
            </label>
            <input
              id="handoverPerson"
              type="text"
              {...register('handoverPerson')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Name of colleague handling your responsibilities"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#6E3FF3] mb-4">Additional Information</h2>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="emergencyLeave"
              {...register('emergencyLeave')}
              className="h-4 w-4 text-[#6E3FF3] border-gray-300 rounded"
            />
            <label htmlFor="emergencyLeave" className="ml-2 block text-sm text-gray-700">
              This is an emergency leave
            </label>
          </div>

          <div>
            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              rows="3"
              {...register('additionalNotes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Any other information you'd like to provide..."
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#6E3FF3] hover:bg-[#903ff3]"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Leave Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveApplication;
