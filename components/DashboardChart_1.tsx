import React from 'react';
import Card from './Card';
import { 
    ResponsiveContainer, 
    BarChart, Bar, 
    LineChart, Line, 
    AreaChart, Area, 
    PieChart, Pie, Cell, 
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'radar';

interface DashboardChartProps {
    title: string;
    type: ChartType;
    data: any[];
    config: any; // Contains dataKeys, colors, axis keys etc.
}

const DashboardChart: React.FC<DashboardChartProps> = ({ title, type, data, config }) => {
    
    const renderChart = () => {
        if (!data || data.length === 0) {
            return <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data available</div>;
        }

        switch(type) {
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey={config.xAxisKey} stroke="#9ca3af" fontSize={10} interval={config.interval ?? 'preserveEnd'} />
                        <YAxis stroke="#9ca3af" fontSize={10} domain={config.domain} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', fontSize: '12px' }} formatter={config.formatter} />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                        {config.dataKeys.map((item: any, index: number) => (
                            <Bar key={index} dataKey={item.key} fill={item.color} name={item.name} stackId={item.stackId} />
                        ))}
                    </BarChart>
                );
            case 'line':
                 return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey={config.xAxisKey} stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} domain={config.domain} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', fontSize: '12px' }} formatter={config.formatter}/>
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                        {config.dataKeys.map((item: any, index: number) => (
                             <Line key={index} type="monotone" dataKey={item.key} stroke={item.color} name={item.name} dot={false} />
                        ))}
                    </LineChart>
                );
            case 'area':
                 return (
                    <AreaChart data={data}>
                         <defs>
                            {config.dataKeys.map((item: any, index: number) => (
                                <linearGradient key={index} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={item.color} stopOpacity={0}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey={config.xAxisKey} stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', fontSize: '12px' }} formatter={config.formatter}/>
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                        {config.dataKeys.map((item: any, index: number) => (
                             <Area key={index} type="monotone" dataKey={item.key} stroke={item.color} fill={`url(#color-${item.key})`} name={item.name} />
                        ))}
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie data={data} dataKey={config.dataKey} nameKey={config.nameKey} cx="50%" cy="50%" innerRadius={config.innerRadius || 0} outerRadius={60} label={config.label}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={config.colors[index % config.colors.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', fontSize: '12px' }} formatter={config.formatter}/>
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                    </PieChart>
                );
             case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey={config.angleKey} fontSize={10}/>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', fontSize: '12px' }} />
                        <Legend wrapperStyle={{fontSize: '10px'}}/>
                        {config.dataKeys.map((item: any, index: number) => (
                             <Radar key={index} name={item.name} dataKey={item.key} stroke={item.color} fill={item.color} fillOpacity={0.6} />
                        ))}
                    </RadarChart>
                );
            default:
                return <div className="flex items-center justify-center h-full text-gray-500">Unsupported chart type</div>;
        }
    };

    return (
        <Card title={title} className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
            </ResponsiveContainer>
        </Card>
    );
};

export default DashboardChart;