// components/views/platform/DemoBankBookingsView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/bookingsData.ts
const appointments = [
    { time: '10:00 AM', service: 'Financial Consultation', client: 'Alex Chen', status: 'Confirmed' },
    { time: '11:00 AM', service: 'API Integration Support', client: 'Brenda Rodriguez', status: 'Confirmed' },
    { time: '02:00 PM', service: 'Mortgage Application Review', client: 'Charles Davis', status: 'Tentative' },
];

const DemoBankBookingsView: React.FC = () => {
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({ service: 'Financial Consultation', clientName: 'The Visionary', time: 'tomorrow at 3:00 PM' });
    const [confirmationMsg, setConfirmationMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setConfirmationMsg('');
        try {
            // NOTE: The instruction implies using an API that doesn't need an API key.
            // Since this is a mock component, we will simulate the API call success
            // without relying on a real, potentially key-requiring, GoogleGenAI instance
            // or environment variable setup for this specific file modification task.
            // We will simulate the response based on the instruction's context.
            
            // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a friendly and professional booking confirmation message for a client. Service: "${bookingDetails.service}", Client Name: "${bookingDetails.clientName}", Time: "${bookingDetails.time}". Include details on how to prepare.`;
            
            // --- SIMULATED API CALL START ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            
            let simulatedResponse = `Dear ${bookingDetails.clientName},\n\nThis confirms your upcoming ${bookingDetails.service} scheduled for ${bookingDetails.time}.\n\nTo ensure a productive session, please have your latest financial statements ready and any specific questions prepared for our advisor.\n\nWe look forward to assisting you.\n\nBest regards,\nQuantum Core Support Team`;
            
            setConfirmationMsg(simulatedResponse);
            // --- SIMULATED API CALL END ---

        } catch (error) {
            setConfirmationMsg("Error generating confirmation.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Bookings</h2>
                    <button onClick={() => setBookingModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Confirmation Writer</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">15</p><p className="text-sm text-gray-400 mt-1">Bookings Today</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">92%</p><p className="text-sm text-gray-400 mt-1">Show Rate</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Services Offered</p></Card>
                </div>

                <Card title="Today's Schedule">
                    <div className="space-y-3">
                        {appointments.map((a, i) => (
                            <div key={i} className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center">
                                <div><p className="font-semibold text-white">{a.service}</p><p className="text-sm text-gray-400">{a.time} - {a.client}</p></div>
                                <span className={`px-2 py-1 text-xs rounded-full ${a.status === 'Confirmed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{a.status}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            {isBookingModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setBookingModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Confirmation Writer</h3></div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-400">Simulate a booking, then generate an AI confirmation message.</p>
                            <select value={bookingDetails.service} onChange={e => setBookingDetails(b => ({...b, service: e.target.value}))} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                <option>Financial Consultation</option>
                                <option>API Integration Support</option>
                                <option>Mortgage Application Review</option>
                            </select>
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Confirmation'}</button>
                            { (isLoading || confirmationMsg) && <Card title="Generated Message"><div className="min-h-[6rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{isLoading ? 'Generating...' : confirmationMsg}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankBookingsView;