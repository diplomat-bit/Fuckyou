import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  insuranceCoverage: z.boolean().default(false),
  supplementaryCards: z.number().min(0).max(5).default(0),
  repaymentPreference: z.enum(['full', 'minimum', 'custom']),
  autoDebit: z.boolean().default(true),
  creditLimitRequest: z.number().min(1000).max(100000),
});

type FormData = z.infer<typeof formSchema>;

export const CreditCardProductForm: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insuranceCoverage: false,
      supplementaryCards: 0,
      repaymentPreference: 'full',
      autoDebit: true,
      creditLimitRequest: 5000,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form Submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-xl shadow-md space-y-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800">Credit Card Preferences</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Insurance Coverage</label>
          <Controller
            name="insuranceCoverage"
            control={control}
            render={({ field }) => (
              <input type="checkbox" checked={field.value} onChange={field.onChange} className="toggle" />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Supplementary Cards (0-5)</label>
          <Controller
            name="supplementaryCards"
            control={control}
            render={({ field }) => (
              <input type="number" {...field} className="w-full mt-1 p-2 border rounded-md" />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Repayment Preference</label>
          <Controller
            name="repaymentPreference"
            control={control}
            render={({ field }) => (
              <select {...field} className="w-full mt-1 p-2 border rounded-md">
                <option value="full">Full Statement</option>
                <option value="minimum">Minimum Amount</option>
                <option value="custom">Custom Amount</option>
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Requested Credit Limit</label>
          <Controller
            name="creditLimitRequest"
            control={control}
            render={({ field }) => (
              <input type="number" {...field} className="w-full mt-1 p-2 border rounded-md" />
            )}
          />
          {errors.creditLimitRequest && <p className="text-red-500 text-xs mt-1">Invalid limit range</p>}
        </div>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Save Preferences
      </button>
    </form>
  );
};