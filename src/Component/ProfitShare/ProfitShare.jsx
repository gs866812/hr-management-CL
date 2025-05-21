import React, { useContext, useEffect, useState } from 'react';
import { ContextData } from '../../DataProvider';
import useAxiosProtect from '../../utils/useAxiosProtect';
import { useDispatch, useSelector } from 'react-redux';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const ProfitShare = () => {
    const { user, totalProfit } = useContext(ContextData);

    const [activeIndex, setActiveIndex] = useState(0);

    const [yearlyTotals, setYearlyTotals] = useState({
        expense: 0,
        earnings: 0,
        profit: 0
    });

    // *************************************************************************
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };
    // *************************************************************************
    const dispatch = useDispatch();
    const refetch = useSelector((state) => state.refetch.refetch);

    // ******************************************************************
    const COLORS = ['#FF8042', '#8884d8', '#82ca9d'];
    // ******************************************************************
    // Custom pie chart active shape
    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
            fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${formatNumber(value)} BDT`}</text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };
    // ******************************************************************
    // Prepare yearly summary data for pie chart
    const prepareYearlySummaryData = () => {
        return [
            { name: 'Expense', value: Math.abs(yearlyTotals.expense) },
            { name: 'Earnings', value: yearlyTotals.earnings },
            { name: 'Profit', value: Math.abs(yearlyTotals.profit) }
        ];
    };
    // ******************************************************************

    return (
        <div>
            <section>
                <div className='w-1/2 h-52'>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={prepareYearlySummaryData()}
                                cx="60%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {prepareYearlySummaryData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${formatNumber(value)} BDT`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
};

export default ProfitShare;