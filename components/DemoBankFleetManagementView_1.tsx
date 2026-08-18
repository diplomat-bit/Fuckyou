import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer, createContext, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenerativeAI } from "@google/generative-ai";

// SECTION 1: TYPES & INTERFACES =======================================================

export type VehicleStatus = 'idle' | 'en_route' | 'at_stop' | 'maintenance' | 'offline';
export type VehicleType = 'armored_truck' | 'courier_van' | 'sedan' | 'motorcycle';
export type DriverStatus = 'on_duty' | 'off_duty' | 'on_break';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';
export type AlertType = 'speeding' | 'geofence_exit' | 'harsh_braking' | 'engine_fault' | 'panic_button';
export type ViewType = 'dashboard' | 'vehicles' | 'drivers' | 'alerts';

export interface Coordinates { lat: number; lng: number; }

export interface Stop extends Coordinates {
    id: string;
    name: string;
    address: string;
    type: 'pickup' | 'delivery' | 'service' | 'depot';
    completed: boolean;
}

export interface Route {
    id: string;
    name: string;
    stops: Stop[];
    vehicleId: string | null;
    driverId: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin: string;
    type: VehicleType;
    status: VehicleStatus;
    driverId: string | null;
    currentRouteId: string | null;
    location: Coordinates;
    fuelLevel: number;
    odometer: number;
    telemetry: { speed: number; engineTemp: number; oilPressure: number; };
}

export interface Driver {
    id: string;
    name: string;
    employeeId: string;
    status: DriverStatus;
    assignedVehicleId: string | null;
    performance: { safetyScore: number; onTimeRate: number; };
}

export interface Alert {
    id: string;
    timestamp: string;
    type: AlertType;
    vehicleId: string;
    driverId: string | null;
    details: string;
    isAcknowledged: boolean;
}

export interface FleetState {
    vehicles: Vehicle[];
    drivers: Driver[];
    routes: Route[];
    alerts: Alert[];
}

export type FleetAction =
    | { type: 'SET_INITIAL_STATE'; payload: FleetState }
    | { type: 'UPDATE_VEHICLE'; payload: Partial<Vehicle> & { id: string } }
    | { type: 'UPDATE_ROUTE'; payload: Partial<Route> & { id: string } }
    | { type: 'CREATE_ALERT'; payload: Alert }
    | { type: 'ACKNOWLEDGE_ALERT'; payload: string };

// SECTION 2: MOCK DATA GENERATORS =====================================================

const SIMULATION_TICK_RATE_MS = 3000;
const generateId = (p: string) => `${p}_${Math.random().toString(36).substr(2, 9)}`;

const createInitialState = (): FleetState => {
    const vehicles: Vehicle[] = Array.from({ length: 15 }, (_, i) => ({
        id: `v-${i}`,
        make: i % 2 === 0 ? 'Ford' : 'Mercedes',
        model: i % 2 === 0 ? 'Transit' : 'Sprinter',
        year: 2022,
        licensePlate: `ABC-${1000 + i}`,
        vin: generateId('VIN'),
        type: 'courier_van',
        status: i < 5 ? 'en_route' : 'idle',
        driverId: `d-${i}`,
        currentRouteId: i < 5 ? `r-${i}` : null,
        location: { lat: 34.0522 + (Math.random() - 0.5) * 0.1, lng: -118.2437 + (Math.random() - 0.5) * 0.1 },
        fuelLevel: 80,
        odometer: 15000 + i * 100,
        telemetry: { speed: 0, engineTemp: 90, oilPressure: 300 }
    }));

    const drivers: Driver[] = vehicles.map((v, i) => ({
        id: `d-${i}`,
        name: `Driver ${i + 1}`,
        employeeId: `EMP-${5000 + i}`,
        status: 'on_duty',
        assignedVehicleId: v.id,
        performance: { safetyScore: 95 - i, onTimeRate: 98 }
    }));

    const routes: Route[] = vehicles.filter(v => v.currentRouteId).map((v, i) => ({
        id: v.currentRouteId!,
        name: `Express Delivery #${i + 101}`,
        vehicleId: v.id,
        driverId: v.driverId,
        status: 'in_progress',
        stops: [
            { id: 's1', name: 'Stop 1', address: '123 Main St', lat: v.location.lat + 0.01, lng: v.location.lng + 0.01, type: 'delivery', completed: false }
        ]
    }));

    return { vehicles, drivers, routes, alerts: [] };
};

// SECTION 3: REDUCER & CONTEXT =========================================================

const fleetReducer = (state: FleetState, action: FleetAction): FleetState => {
    switch (action.type) {
        case 'SET_INITIAL_STATE': return action.payload;
        case 'UPDATE_VEHICLE':
            return { ...state, vehicles: state.vehicles.map(v => v.id === action.payload.id ? { ...v, ...action.payload } : v) };
        case 'UPDATE_ROUTE':
            return { ...state, routes: state.routes.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r) };
        case 'CREATE_ALERT':
            return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 50) };
        case 'ACKNOWLEDGE_ALERT':
            return { ...state, alerts: state.alerts.map(a => a.id === action.payload ? { ...a, isAcknowledged: true } : a) };
        default: return state;
    }
};

const FleetContext = createContext<{ state: FleetState; dispatch: React.Dispatch<FleetAction> } | null>(null);

// SECTION 4: SUB-COMPONENTS ============================================================

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className={`p-4 rounded-xl border border-gray-100 shadow-sm ${color}`}>
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
);

const VehicleList = () => {
    const { state } = useContext(FleetContext)!;
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                        <th className="p-3 font-semibold">Vehicle</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Fuel</th>
                        <th className="p-3 font-semibold">Speed</th>
                        <th className="p-3 font-semibold">Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {state.vehicles.map(v => (
                        <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium">{v.make} {v.model} <br/><span className="text-xs text-gray-400">{v.licensePlate}</span></td>
                            <td className="p-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    v.status === 'en_route' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>{v.status.replace('_', ' ')}</span>
                            </td>
                            <td className="p-3 text-sm">{v.fuelLevel.toFixed(1)}%</td>
                            <td className="p-3 text-sm">{v.telemetry.speed.toFixed(0)} km/h</td>
                            <td className="p-3 text-xs text-gray-500">{v.location.lat.toFixed(4)}, {v.location.lng.toFixed(4)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AlertPanel = () => {
    const { state, dispatch } = useContext(FleetContext)!;
    const activeAlerts = state.alerts.filter(a => !a.isAcknowledged);

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-700 flex justify-between">
                Live Alerts 
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{activeAlerts.length}</span>
            </h3>
            {activeAlerts.length === 0 && <p className="text-sm text-gray-400 italic">No critical issues detected.</p>}
            {activeAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-red-50 border-l-4 border-red-500 rounded flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-red-700 uppercase">{alert.type}</p>
                        <p className="text-sm text-red-600">{alert.details}</p>
                    </div>
                    <button 
                        onClick={() => dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alert.id })}
                        className="text-xs bg-white px-2 py-1 rounded shadow-sm border border-red-200 hover:bg-red-100"
                    >
                        Dismiss
                    </button>
                </div>
            ))}
        </div>
    );
};

// SECTION 5: SIMULATION HOOK ===========================================================

const useFleetSimulator = (dispatch: React.Dispatch<FleetAction>, state: FleetState) => {
    const stateRef = useRef(state);
    stateRef.current = state;

    useEffect(() => {
        const interval = setInterval(() => {
            const { vehicles } = stateRef.current;
            
            vehicles.forEach(vehicle => {
                if (vehicle.status === 'en_route') {
                    // Slight location drift simulation
                    const newLocation = {
                        lat: vehicle.location.lat + (Math.random() - 0.5) * 0.001,
                        lng: vehicle.location.lng + (Math.random() - 0.5) * 0.001
                    };
                    const speed = 40 + Math.random() * 20;

                    dispatch({
                        type: 'UPDATE_VEHICLE',
                        payload: {
                            id: vehicle.id,
                            location: newLocation,
                            fuelLevel: Math.max(0, vehicle.fuelLevel - 0.05),
                            telemetry: { ...vehicle.telemetry, speed }
                        }
                    });

                    // Random Alert Generation
                    if (Math.random() < 0.05) {
                        dispatch({
                            type: 'CREATE_ALERT',
                            payload: {
                                id: generateId('alert'),
                                timestamp: new Date().toISOString(),
                                type: 'speeding',
                                vehicleId: vehicle.id,
                                driverId: vehicle.driverId,
                                details: `${vehicle.licensePlate} exceeded 65 km/h limit`,
                                isAcknowledged: false
                            }
                        });
                    }
                }
            });
        }, SIMULATION_TICK_RATE_MS);
        return () => clearInterval(interval);
    }, [dispatch]);
};

// SECTION 6: MAIN VIEW =================================================================

export default function DemoBankFleetManagementView() {
    const [state, dispatch] = useReducer(fleetReducer, { vehicles: [], drivers: [], routes: [], alerts: [] });
    const [activeTab, setActiveTab] = useState<ViewType>('dashboard');
    const [aiInsight, setAiInsight] = useState<string>("Analyzing fleet data for optimizations...");

    useEffect(() => {
        dispatch({ type: 'SET_INITIAL_STATE', payload: createInitialState() });
    }, []);

    useFleetSimulator(dispatch, state);

    // AI Insight Generator (Mocking actual call to Google GenAI)
    useEffect(() => {
        const getAiSummary = async () => {
            try {
                // Example of how you'd use the import provided in your snippet:
                // const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
                // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                // const prompt = `Analyze this fleet: ${state.vehicles.length} vehicles, ${state.alerts.length} alerts.`;
                // const result = await model.generateContent(prompt);
                
                // For demo stability, we simulate the result:
                setTimeout(() => {
                    setAiInsight("Gemini Suggestion: Fuel efficiency is down 4% in armored trucks. Recommend checking tire pressure on 3 vehicles.");
                }, 2000);
            } catch (e) {
                console.error("AI Error", e);
            }
        };
        getAiSummary();
    }, [state.vehicles.length]);

    return (
        <FleetContext.Provider value={{ state, dispatch }}>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
                <Card>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-blue-900">DEMO BANK <span className="font-light text-gray-500">FLEET OS</span></h1>
                            <p className="text-sm text-gray-500 font-medium">Real-time Logistics & Asset Monitoring</p>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['dashboard', 'vehicles', 'alerts'] as ViewType[]).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                        activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Dashboard View */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <StatCard title="Active Fleet" value={state.vehicles.length} color="bg-blue-50 text-blue-700" />
                                    <StatCard title="En Route" value={state.vehicles.filter(v => v.status === 'en_route').length} color="bg-green-50 text-green-700" />
                                    <StatCard title="Total Alerts" value={state.alerts.length} color="bg-orange-50 text-orange-700" />
                                    <StatCard title="Avg Safety" value="94.2%" color="bg-purple-50 text-purple-700" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-bold uppercase tracking-widest opacity-80">AI Fleet Advisor</span>
                                            </div>
                                            <p className="text-lg font-medium leading-relaxed italic">"{aiInsight}"</p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                            <h3 className="font-bold mb-4">Quick Vehicle Overview</h3>
                                            <VehicleList />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <AlertPanel />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vehicles View */}
                        {activeTab === 'vehicles' && (
                            <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
                                <VehicleList />
                            </div>
                        )}

                        {/* Alerts View */}
                        {activeTab === 'alerts' && (
                            <div className="max-w-2xl mx-auto">
                                <AlertPanel />
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </FleetContext.Provider>
    );
}
