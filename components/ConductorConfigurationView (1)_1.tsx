import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/index';
import { PlusCircle, Edit2, Trash2, ArrowUp, ArrowDown, Settings2 } from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: { field: string; operator: string; value: string }[];
  actions: { type: string; value: string }[];
}

const ConductorConfigurationView: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState<Rule | null>(null);

  useEffect(() => {
    setRules([
      {
        id: 'rule-1',
        name: 'High Priority Rails',
        description: 'Route immediate wires to premium nodes.',
        priority: 1,
        conditions: [{ field: 'priority', operator: '=', value: 'HIGH' }],
        actions: [{ type: 'ROUTING', value: 'QUANTUM_PRIMARY' }],
      },
      {
        id: 'rule-2',
        name: 'Low Value Batching',
        description: 'Aggregate small payments for fee optimization.',
        priority: 2,
        conditions: [{ field: 'amount', operator: '<', value: '100' }],
        actions: [{ type: 'ROUTING', value: 'BATCH_RECONCILIATION' }],
      },
    ]);
  }, []);

  const handleAddRule = () => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      name: 'New Routing Rule',
      description: 'Configure routing logic here.',
      priority: rules.length + 1,
      conditions: [{ field: 'payment.type', operator: '=', value: 'ach' }],
      actions: [{ type: 'ROUTING', value: 'STANDARD_QUEUE' }],
    };
    setRules([...rules, newRule]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const newRules = [...rules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRules.length) return;
    
    [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
    setRules(newRules);
  };

  const openEdit = (rule: Rule) => {
    setCurrentRule(rule);
    setIsEditDialogOpen(true);
  };

  const saveEdit = () => {
    if (currentRule) {
      setRules(rules.map((r) => (r.id === currentRule.id ? currentRule : r)));
      setIsEditDialogOpen(false);
      setCurrentRule(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings2 className="text-cyan-400" /> Payment Conductor
          </h2>
          <p className="text-gray-400 mt-1">Orchestrate transaction flow and smart routing rules.</p>
        </div>
        <Button onClick={handleAddRule} className="bg-cyan-600 hover:bg-cyan-500">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Routing Rule
        </Button>
      </div>

      <Card className="border-gray-800 bg-gray-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="w-12 text-center text-gray-500">#</TableHead>
              <TableHead>Rule Name</TableHead>
              <TableHead className="hidden md:table-cell">Logic Summary</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule, idx) => (
              <TableRow key={rule.id} className="border-gray-800 hover:bg-gray-800/30">
                <TableCell className="text-gray-500 font-mono text-xs text-center">{idx + 1}</TableCell>
                <TableCell>
                  <div className="font-bold text-white">{rule.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{rule.description}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex gap-2">
                    {rule.conditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-900/30 text-indigo-300 text-[10px] rounded border border-indigo-500/20">
                        {c.field} {c.operator} {c.value}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2 text-gray-400">
                     <button 
                        disabled={idx === 0} 
                        onClick={() => handleMoveRule(idx, 'up')}
                        className="p-1 hover:text-cyan-400 disabled:opacity-20 transition-colors"
                     >
                       <ArrowUp size={14} />
                     </button>
                     <button 
                        disabled={idx === rules.length - 1} 
                        onClick={() => handleMoveRule(idx, 'down')}
                        className="p-1 hover:text-cyan-400 disabled:opacity-20 transition-colors"
                     >
                       <ArrowDown size={14} />
                     </button>
                   </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(rule)} className="text-gray-400 hover:text-white">
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configure Routing Logic</DialogTitle>
          </DialogHeader>
          {currentRule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Rule Designation</label>
                <Input 
                  value={currentRule.name} 
                  onChange={e => setCurrentRule({...currentRule, name: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Intent Description</label>
                <textarea 
                  value={currentRule.description} 
                  onChange={e => setCurrentRule({...currentRule, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-sm text-white focus:border-cyan-500 outline-none h-20"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-cyan-600 hover:bg-cyan-500">Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConductorConfigurationView;