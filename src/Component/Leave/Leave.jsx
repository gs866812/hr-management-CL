import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const Leave = () => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/leave', data);
      if (response.status === 201) {
        setSubmissionStatus({ success: true, message: 'Leave application submitted successfully!' });
        reset();
      }
    } catch (error) {
      setSubmissionStatus({ success: false, message: error.response?.data?.message || 'Failed to submit leave application' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate days between dates
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const totalDays = startDate && endDate 
    ? Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    : 0;

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
        {/* Basic Information Section */}
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
                {...register('employeeName', { required: 'Full name is required' })}
                className={`w-full px-3 py-2 border ${errors.employeeName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
                {...register('employeeId', { required: 'Employee ID is required' })}
                className={`w-full px-3 py-2 border ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
                {...register('department', { required: 'Department is required' })}
                className={`w-full px-3 py-2 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
                {...register('position', { required: 'Position is required' })}
                className={`w-full px-3 py-2 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
              />
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
            </div>
          </div>
        </div>

        {/* Leave Details Section */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#6E3FF3] mb-4">Leave Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                id="leaveType"
                {...register('leaveType', { required: 'Leave type is required' })}
                className={`w-full px-3 py-2 border ${errors.leaveType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
                className={`w-full px-3 py-2 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
                className={`w-full px-3 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
                  validate: (value, { startDate }) => 
                    new Date(value) >= new Date(startDate) || 'End date must be after start date'
                })}
                className={`w-full px-3 py-2 border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
            </div>
            
            <div>
              <label htmlFor="totalDays" className="block text-sm font-medium text-gray-700 mb-1">
                Total Days <span className="text-red-500">*</span>
              </label>
              <input
                id="totalDays"
                type="number"
                min="0.5"
                step="0.5"
                value={totalDays || ''}
                readOnly
                {...register('totalDays', { 
                  required: 'Total days is required',
                  min: { value: 0.5, message: 'Minimum 0.5 day' }
                })}
                className={`w-full px-3 py-2 border ${errors.totalDays ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3] bg-gray-50`}
              />
              {errors.totalDays && <p className="mt-1 text-sm text-red-600">{errors.totalDays.message}</p>}
            </div>
          </div>
          
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
              className={`w-full px-3 py-2 border ${errors.reason ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]`}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]"
              placeholder="Name of colleague handling your responsibilities"
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#6E3FF3] mb-4">Additional Information</h2>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="emergencyLeave"
              {...register('emergencyLeave')}
              className="h-4 w-4 text-[#6E3FF3] focus:ring-[#6E3FF3] border-gray-300 rounded"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6E3FF3] focus:border-[#6E3FF3]"
              placeholder="Any other information you'd like to provide..."
            ></textarea>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6E3FF3] disabled:opacity-50"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#6E3FF3] hover:bg-[#903ff3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6E3FF3] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Leave Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Leave;