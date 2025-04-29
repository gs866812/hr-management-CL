import React, { useState } from 'react';
import axios from 'axios';

const Employee = () => {
    const [inTime, setInTime] = useState(null);
    const [outTime, setOutTime] = useState(null);
    const [isInClicked, setIsInClicked] = useState(false);
    const [workingHours, setWorkingHours] = useState(null);

    const handleInTime = async () => {
        if (isInClicked) return;

        const now = new Date();
        setInTime(now);
        setIsInClicked(true);

        try {
            await axios.post('/api/employee/in-time', { time: now });
            toast.success('In-Time recorded');
        } catch (error) {
            toast.error('Failed to save In-Time');
        }
    };

    const handleOutTime = async () => {
        if (!inTime) {
            toast.error('In-Time not recorded yet');
            return;
        }

        const now = new Date();
        setOutTime(now);

        const workedMs = new Date(now) - new Date(inTime);
        const hours = (workedMs / (1000 * 60 * 60)).toFixed(2);
        setWorkingHours(hours);

        try {
            await axios.post('/api/employee/out-time', {
                inTime,
                outTime: now,
                workedHours: hours
            });
            toast.success('Out-Time recorded');
        } catch (error) {
            toast.error('Failed to save Out-Time');
        }

        // Reset to allow next session
        setTimeout(() => {
            setIsInClicked(false);
            setInTime(null);
            setOutTime(null);
            setWorkingHours(null);
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-semibold mb-4">Employee Time Tracker</h2>
            <div className="flex gap-4">
                <button
                    className="btn btn-primary"
                    onClick={handleInTime}
                    disabled={isInClicked}
                >
                    In Time
                </button>

                <button
                    className="btn btn-secondary"
                    onClick={handleOutTime}
                    disabled={!isInClicked || outTime}
                >
                    Out Time
                </button>
            </div>

            <div className="mt-4 text-sm text-gray-700">
                {inTime && <p>In Time: {new Date(inTime).toLocaleTimeString()}</p>}
                {outTime && <p>Out Time: {new Date(outTime).toLocaleTimeString()}</p>}
                {workingHours && <p>Worked: {workingHours} hours</p>}
            </div>
        </div>
    );
};

export default Employee;
