// components/views/personal/PortfolioExplorerView.tsx
import React, { useContext, useMemo, useState } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { PortfolioAsset } from '../../../types';
// FIX: Imported 'Cell' from recharts to be used inside the Treemap component.
import { ResponsiveContainer, Treemap, Tooltip, Cell } from 'recharts';

const ASSET_CLASSES = ['All', 'Equities', 'Fixed Income', 'Alternatives', 'Digital Assets', 'Cash & Equivalents'];
const REGIONS = ['All', 'North America', 'Europe', 'Asia', 'Emerging Markets', 'Global'];

type SortKey = 'name' | 'value' | 'change24h';
type SortDirection = 'asc' | 'desc';

// Custom Content Renderer for Treemap
const CustomTreemapContent = (props: any) => {
    const { depth, x, y, width, height, index, name, value, change24h } = props;
    const isRoot = depth === 0;

    if (isRoot || width < 50 || height < 30) return null;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: 'transparent',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
                <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    color: 'white',
                    fontSize: '12px'
                }}>
                    <div className="font-semibold truncate">{name}</div>
                    <div>
                        <div className="font-mono text-sm">${value.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                        <div className={`font-mono text-xs ${change24h >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </foreignObject>
        </g>
    );
};


const PortfolioExplorerView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PortfolioExplorerView must be within a DataProvider");

    const { portfolioAssets } = context;

    const [assetClassFilter, setAssetClassFilter] = useState('All');
    const [regionFilter, setRegionFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'value', direction: 'desc' });
    
    const filteredAssets = useMemo(() => {
        return portfolioAssets
            .filter(asset => assetClassFilter === 'All' || asset.assetClass === assetClassFilter)
            .filter(asset => regionFilter === 'All' || asset.region === regionFilter);
    }, [portfolioAssets, assetClassFilter, regionFilter]);

    const sortedAssets = useMemo(() => {
        const sortableAssets = [...filteredAssets];
        sortableAssets.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableAssets;
    }, [filteredAssets, sortConfig]);

    const totalValue = useMemo(() => filteredAssets.reduce((sum, asset) => sum + asset.value, 0), [filteredAssets]);
    const overallChange = useMemo(() => {
        if (totalValue === 0) return 0;
        const weightedChange = filteredAssets.reduce((sum, asset) => sum + asset.value * asset.change24h, 0);
        return weightedChange / totalValue;
    }, [filteredAssets, totalValue]);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getColorForChange = (change: number) => {
        if (change > 1) return '#10b981';   // Strong green
        if (change > 0) return '#34d399';    // Green
        if (change < -1) return '#ef4444'; // Strong red
        if (change < 0) return '#f87171';     // Red
        return '#6b7280';                  // Gray
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Portfolio Explorer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">${totalValue.toLocaleString(undefined, {maximumFractionDigits:0})}</p><p className="text-sm text-gray-400 mt-1">Filtered Value</p></Card>
                <Card className="text-center"><p className={`text-3xl font-bold ${overallChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{overallChange >= 0 ? '+' : ''}{overallChange.toFixed(2)}%</p><p className="text-sm text-gray-400 mt-1">24h Change</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{filteredAssets.length}</p><p className="text-sm text-gray-400 mt-1">Assets Shown</p></Card>
            </div>
            
            <Card title="Filters">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="text-sm text-gray-400">Asset Class</label>
                        <select value={assetClassFilter} onChange={e => setAssetClassFilter(e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                            {ASSET_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Region</label>
                        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="w-full mt-1 bg-gray-700/50 border-gray-600 rounded p-2 text-white">
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Portfolio Composition by Value">
                 <ResponsiveContainer width="100%" height={500}>
                    <Treemap
                        data={sortedAssets}
                        dataKey="value"
                        ratio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        isAnimationActive={true}
                        content={<CustomTreemapContent />}
                    >
                         {sortedAssets.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={getColorForChange(entry.change24h)} />
                        ))}
                    </Treemap>
                </ResponsiveContainer>
            </Card>

            <Card title="Asset Details">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th onClick={() => handleSort('name')} className="px-6 py-3 cursor-pointer">Name</th>
                                <th onClick={() => handleSort('value')} className="px-6 py-3 cursor-pointer text-right">Value (USD)</th>
                                <th onClick={() => handleSort('change24h')} className="px-6 py-3 cursor-pointer text-right">24h Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAssets.map(asset => (
                                <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {asset.name}
                                        <span className="block text-xs text-gray-500">{asset.ticker} - {asset.assetClass}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-right text-white">${asset.value.toLocaleString()}</td>
                                    <td className={`px-6 py-4 font-mono text-right ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    );
};

export default PortfolioExplorerView;