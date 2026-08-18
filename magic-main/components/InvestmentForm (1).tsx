import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const InvestmentForm: React.FC = () => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>New Investment Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium text-gray-300">Company Name</Label>
            <Input id="companyName" placeholder="Enter company name" className="bg-gray-900 border-gray-600" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="investmentRound" className="text-sm font-medium text-gray-300">Round</Label>
            <Select>
              <SelectTrigger className="bg-gray-900 border-gray-600">
                <SelectValue placeholder="Select round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                <SelectItem value="seed">Seed</SelectItem>
                <SelectItem value="series-a">Series A</SelectItem>
                <SelectItem value="series-b">Series B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="investmentAmount" className="text-sm font-medium text-gray-300">Investment Amount (USD)</Label>
          <Input id="investmentAmount" type="number" placeholder="0.00" className="bg-gray-900 border-gray-600" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="investmentThesis" className="text-sm font-medium text-gray-300">Thesis / Notes</Label>
          <textarea 
            id="investmentThesis"
            className="flex w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]" 
            placeholder="Investment rationale..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700">Submit Proposal</Button>
        </div>
      </CardContent>
    </Card>
  );
};