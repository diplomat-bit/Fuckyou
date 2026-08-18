import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from './ui/index';
import {
  ExternalClearingSystemIdentification1Code,
  ExternalAccountIdentification1Code,
} from '../iso20022';

interface SsiEditorFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const SsiEditorForm: React.FC<SsiEditorFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clearingSystem: initialValues?.clearingSystem || '',
    correspondentBankBic: initialValues?.correspondentBank?.bic || '',
    accountIdentificationType: initialValues?.account?.identificationType || '',
    accountNumber: initialValues?.account?.number || '',
  });

  const clearingSystemOptions = [
    { value: 'USABA', label: 'USABA' },
    { value: 'USCHIPS', label: 'CHIPS' },
    { value: 'SWIFT', label: 'SWIFT' },
  ];

  const accountIdentificationOptions = [
    { value: 'BBAN', label: 'BBAN' },
    { value: 'AIIN', label: 'AIIN' },
    { value: 'CUID', label: 'CUID' },
    { value: 'UPIC', label: 'UPIC' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clearingSystem: formData.clearingSystem,
      correspondentBank: { bic: formData.correspondentBankBic },
      account: {
        identificationType: formData.accountIdentificationType,
        number: formData.accountNumber,
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-xl text-white">SSI Details Management</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="ssi-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase">Clearing System</label>
              <Select
                value={formData.clearingSystem}
                onValueChange={(val) => setFormData({ ...formData, clearingSystem: val })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select clearing system" />
                </SelectTrigger>
                <SelectContent>
                  {clearingSystemOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase">Correspondent Bank BIC</label>
              <Input
                placeholder="BIC Code"
                value={formData.correspondentBankBic}
                onChange={(e) => setFormData({ ...formData, correspondentBankBic: e.target.value })}
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase">Account ID Type</label>
              <Select
                value={formData.accountIdentificationType}
                onValueChange={(val) => setFormData({ ...formData, accountIdentificationType: val })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {accountIdentificationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase">Account Number</label>
              <Input
                placeholder="Enter number"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="bg-gray-900 border-gray-700"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t border-gray-800 pt-6">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" form="ssi-form" className="bg-cyan-600 hover:bg-cyan-500">
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SsiEditorForm;