import React, { useContext } from 'react';
import { ContextData } from '../../DataProvider';

const MorningShift = () => {
    const { employeeList } = useContext(ContextData);
    return (
        <div>
            Morning shift...
        </div>
    );
};

export default MorningShift;