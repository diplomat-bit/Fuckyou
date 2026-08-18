// components/views/megadashboard/security/RoleManagementView.tsx
import React from 'react';
import Card from '../../../Card';

const RoleManagementView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Identity & Role Command</h2>
            <Card title="Mission Brief">
                <p className="text-gray-400">Define and manage the nervous system of your organization. This is where you define user roles and permissions across the entire Demo Bank platform. Implement least-privilege access with AI-powered suggestions to ensure security by default.</p>
            </Card>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title="AI Role Clustering"><p>Our AI automatically groups users with similar access patterns to suggest new, optimized roles, reducing complexity and human error.</p></Card>
                 <Card title="Least-Privilege Suggestions"><p>Receive continuous, AI-driven recommendations to remove unnecessary permissions from roles, hardening your security posture automatically.</p></Card>
                 <Card title="Role Drift Detection"><p>Get alerted when a role's permissions have significantly changed over time, preventing unintended privilege escalation.</p></Card>
            </div>
        </div>
    );
};

export default RoleManagementView;