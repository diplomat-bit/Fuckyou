import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

interface ProductDisbursementDetailsProps {
  className?: string;
}

export const ProductDisbursementDetails: React.FC<ProductDisbursementDetailsProps> = ({ className = '' }) => {
  const { control, watch, formState: { errors } } = useFormContext();
  const selectedMethod = watch('disbursementMethod');

  return (
    <div className={`space-y-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Disbursement Details</h3>
        <p className="text-sm text-slate-500">Configure how the loan funds will be transferred to the borrower.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">Disbursement Method</label>
          <Controller
            name="disbursementMethod"
            control={control}
            rules={{ required: 'Please select a disbursement method' }}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select a method</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            )}
          />
          {errors.disbursementMethod && (
            <p className="mt-1 text-xs text-red-500">{errors.disbursementMethod.message as string}</p>
          )}
        </div>

        {selectedMethod === 'bank_transfer' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
              <Controller
                name="bankName"
                control={control}
                rules={{ required: 'Bank name is required' }}
                render={({ field }) => (
                  <input {...field} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
              <Controller
                name="accountNumber"
                control={control}
                rules={{ required: 'Account number is required' }}
                render={({ field }) => (
                  <input {...field} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                )}
              />
            </div>
          </>
        )}

        {(selectedMethod === 'mobile_money' || selectedMethod === 'wallet') && (
          <div className="col-span-full">
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number / Wallet ID</label>
            <Controller
              name="recipientIdentifier"
              control={control}
              rules={{ required: 'This field is required' }}
              render={({ field }) => (
                <input {...field} type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};