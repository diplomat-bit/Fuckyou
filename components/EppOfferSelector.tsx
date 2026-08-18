import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, CreditCard, CalendarDays, Percent } from 'lucide-react';

interface EPPOffer {
  id: string;
  tenureMonths: number;
  interestRate: number;
  monthlyInstallment: number;
  totalAmount: number;
  processingFee: number;
}

interface EppOfferSelectorProps {
  offers: EPPOffer[];
  onSelect: (offer: EPPOffer) => void;
  selectedOfferId?: string;
}

export const EppOfferSelector: React.FC<EppOfferSelectorProps> = ({ 
  offers, 
  onSelect, 
  selectedOfferId 
}) => {
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedOfferId);

  const handleSelection = (id: string) => {
    setSelectedId(id);
    const offer = offers.find((o) => o.id === id);
    if (offer) onSelect(offer);
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Select Payment Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              onClick={() => handleSelection(offer.id)}
              className={`relative flex items-start space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                selectedId === offer.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="mt-1">
                <input 
                  type="radio" 
                  checked={selectedId === offer.id} 
                  onChange={() => {}}
                  className="w-4 h-4 text-primary border-slate-300 focus:ring-primary"
                />
              </div>
              <Label className="flex-1 cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">{offer.tenureMonths} Months</span>
                  <span className="text-sm font-medium text-slate-600">
                    {offer.interestRate}% p.a.
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    <span>${offer.monthlyInstallment.toFixed(2)}/mo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>Fee: ${offer.processingFee}</span>
                  </div>
                </div>
              </Label>
              {selectedId === offer.id && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
              )}
            </div>
          ))}
        </div>

        {selectedId && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Total Payable</span>
              <span className="font-bold text-lg">
                ${offers.find(o => o.id === selectedId)?.totalAmount.toFixed(2)}
              </span>
            </div>
            <Button className="w-full mt-4" size="lg">
              Confirm Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};