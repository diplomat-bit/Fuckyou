// components/views/personal/FinancialGoalsView.tsx
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { FinancialGoal } from '../../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GOAL_ICONS: { [key: string]: React.FC<{ className?: string }> } = {
    home: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    plane: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    car: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m14 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    education: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>,
    default: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
};


const FinancialGoalsView: React.FC = () => {
    type GoalView = 'LIST' | 'CREATE' | 'VIEW_PLAN';
    const [currentView, setCurrentView] = useState<GoalView>('LIST');
    const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
    const [loadingGoalId, setLoadingGoalId] = useState<string | null>(null);

    const context = useContext(DataContext);
    if (!context) throw new Error("FinancialGoalsView must be within a DataProvider.");
    // FIX: Destructure missing functions from context to resolve property not found errors.
    const { financialGoals, addFinancialGoal, generateGoalPlan } = context;

    const handleGeneratePlan = async (goalId: string) => {
        setLoadingGoalId(goalId);
        await generateGoalPlan(goalId);
        // The context will update, so we find the new goal state from there
        const updatedGoal = financialGoals.find(g => g.id === goalId);
        if (updatedGoal) {
            setSelectedGoal(updatedGoal);
            // If the plan is now available, switch to view it
            if(updatedGoal.plan) {
                setCurrentView('VIEW_PLAN');
            }
        }
        setLoadingGoalId(null);
    };
    
    const GoalListView: React.FC = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Financial Goals</h2>
                <button onClick={() => setCurrentView('CREATE')} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">New Goal</button>
            </div>
            {financialGoals.map(goal => {
                 const progress = (goal.currentAmount / goal.targetAmount) * 100;
                 const Icon = GOAL_ICONS[goal.iconName] || GOAL_ICONS.default;
                 return (
                    <Card key={goal.id} variant="interactive" onClick={() => { setSelectedGoal(goal); setCurrentView('VIEW_PLAN'); }}>
                         <div className="flex flex-col md:flex-row gap-6">
                             <div className="flex-shrink-0 w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-300 mx-auto">
                                 <Icon className="w-12 h-12" />
                             </div>
                             <div className="flex-grow">
                                <div className="flex justify-between items-baseline">
                                     <h3 className="text-xl font-semibold text-white">{goal.name}</h3>
                                     <p className="text-sm text-gray-400">Target: {goal.targetDate}</p>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                     ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                                </p>
                                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                    <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                             </div>
                         </div>
                    </Card>
                 );
            })}
        </div>
    );
    
    // Placeholder components for other views
    const CreateGoalView: React.FC = () => (
        <div>
            <h2 className="text-3xl font-bold text-white tracking-wider mb-4">Create New Goal</h2>
            <Card><p>Form to create a new goal would go here.</p></Card>
            <button onClick={() => setCurrentView('LIST')} className="mt-4 text-sm text-cyan-400">Back to List</button>
        </div>
    );

    const ViewPlanView: React.FC = () => (
         <div>
            <h2 className="text-3xl font-bold text-white tracking-wider mb-4">{selectedGoal?.name}</h2>
            <Card><p>Details and AI plan for the selected goal would go here.</p></Card>
            <button onClick={() => setCurrentView('LIST')} className="mt-4 text-sm text-cyan-400">Back to List</button>
        </div>
    );


    const renderCurrentView = () => {
        switch (currentView) {
            case 'CREATE':
                return <CreateGoalView />;
            case 'VIEW_PLAN':
                return <ViewPlanView />;
            case 'LIST':
            default:
                return <GoalListView />;
        }
    };

    return (
        <>
            {renderCurrentView()}
        </>
    );
};

export default FinancialGoalsView;
