import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';

interface RepaymentConfig {
  method: 'direct_debit' | 'credit_card' | 'bank_transfer';
  autoPay: boolean;
  accountHolder: string;
  accountNumber: string;
  routingNumber: string;
}

export const ProductRepaymentConfig: React.FC = () => {
  const [config, setConfig] = useState<RepaymentConfig>({
    method: 'direct_debit',
    autoPay: true,
    accountHolder: '',
    accountNumber: '',
    routingNumber: '',
  });

  const handleUpdate = (key: keyof RepaymentConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-lg shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Banknote className="w-5 h-5 text-primary" />
          Repayment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="repayment-method">Repayment Method</Label>
          <Select 
            value={config.method} 
            onValueChange={(v: any) => handleUpdate('method', v)}
          >
            <SelectTrigger id="repayment-method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct_debit">Direct Debit (ACH)</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Auto-Pay</Label>
            <p className="text-sm text-slate-500">Automatically deduct payments on due dates.</p>
          </div>
          <Switch 
            checked={config.autoPay} 
            onCheckedChange={(v) => handleUpdate('autoPay', v)} 
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-holder">Account Holder Name</Label>
            <Input 
              id="account-holder"
              placeholder="John Doe"
              value={config.accountHolder}
              onChange={(e) => handleUpdate('accountHolder', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input 
                id="account-number"
                type="password"
                placeholder="••••••••"
                value={config.accountNumber}
                onChange={(e) => handleUpdate('accountNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input 
                id="routing-number"
                placeholder="000000000"
                value={config.routingNumber}
                onChange={(e) => handleUpdate('routingNumber', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Your payment details are encrypted and stored securely.</span>
        </div>

        <Button className="w-full" size="lg">
          Save Payment Settings
        </Button>
      </CardContent>
    </Card>
  );
};