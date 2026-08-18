// components/views/megadashboard/finance/LoanApplicationsView.tsx
import React from 'react';
import Card from '../../../Card';

const LoanApplicationsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Loan Origination System</h2>
            <Card title="Mission Brief">
                <p className="text-gray-400">An AI-powered loan origination and management system built for speed and precision. Automate underwriting, scoring, and document verification to accelerate the entire lending lifecycle from application to closing.</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="AI Pre-Approval Scoring"><p>Get an instant, AI-driven risk assessment and pre-approval decision for new applications, cutting review times from days to seconds.</p></Card>
                <Card title="Risk-Adjusted Loan Offers"><p>Automatically generate personalized loan offers with terms dynamically adjusted for the applicant's holistic risk profile.</p></Card>
                <Card title="Predictive Default Monitoring"><p>Our AI models continuously monitor active loans to predict and flag potential defaults months before they occur, enabling proactive intervention.</p></Card>
            </div>
        </div>
    );
};

export default LoanApplicationsView;