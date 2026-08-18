import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface Plan {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
}

interface PlanFormProps {
  initialPlan?: Plan;
  onSubmit: (plan: Plan) => void;
  isSubmitting: boolean;
}

const AVAILABLE_FEATURES = [
  'User & Account Management',
  'Transaction Insights',
  'Budgeting Tools',
  'Financial Goals',
  'Investment Portfolio Management',
  'AI Financial Advisor',
  'AI Financial Oracle (Simulations)',
  'AI Business Incubator',
  'Corporate Finance Suite',
  'Web3 & Crypto Integration',
  'Sustainability & ESG Tracking',
  'Lending & Credit Services',
  'Developer API Access',
];

const PlanForm: React.FC<PlanFormProps> = ({ initialPlan, onSubmit, isSubmitting }) => {
  const [plan, setPlan] = useState<Plan>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [],
  });

  useEffect(() => {
    if (initialPlan) {
      setPlan(initialPlan);
    }
  }, [initialPlan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPlan((prevPlan) => ({
      ...prevPlan,
      [name]: value,
    }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setPlan((prevPlan) => {
      const newFeatures = checked
        ? [...prevPlan.features, feature]
        : prevPlan.features.filter((f) => f !== feature);
      // Keep features sorted in the order they appear in the UI
      return { ...prevPlan, features: newFeatures.sort((a, b) => AVAILABLE_FEATURES.indexOf(a) - AVAILABLE_FEATURES.indexOf(b)) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!plan.name || !plan.description || plan.price <= 0 || !plan.currency || !plan.billingPeriod) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (plan.features.length === 0) {
      toast.error('Please select at least one feature for the plan.');
      return;
    }

    onSubmit(plan);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialPlan ? 'Edit Plan' : 'Create New Plan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              name="name"
              value={plan.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={plan.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={plan.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                name="currency"
                value={plan.currency}
                onValueChange={(value) => setPlan((prev) => ({ ...prev, currency: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  {/* Add more currencies as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="billingPeriod">Billing Period</Label>
            <Select
              name="billingPeriod"
              value={plan.billingPeriod}
              onValueChange={(value: 'monthly' | 'yearly') => setPlan((prev) => ({ ...prev, billingPeriod: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select billing period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Features</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {AVAILABLE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={plan.features.includes(feature)}
                    onCheckedChange={(checked) => handleFeatureChange(feature, !!checked)}
                  />
                  <Label htmlFor={feature} className="font-normal cursor-pointer">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialPlan ? 'Update Plan' : 'Create Plan')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanForm;