import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ContextData } from '../DataProvider';

const Home = () => {

    // const user = useSelector((state) => state.user.user);
    const {user} = useContext(ContextData);
    

    return (
        <div>
            <button className="btn btn-primary">Primary Button</button>
        </div>
    );
};

export default Home;