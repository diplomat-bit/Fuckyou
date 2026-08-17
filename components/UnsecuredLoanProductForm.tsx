import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const unsecuredLoanSchema = z.object({
  disbursementMethod: z.enum(['bank_transfer', 'digital_wallet', 'check']),
  repaymentSchedule: z.enum(['monthly', 'bi_weekly', 'quarterly']),
  loanAmount: z.number().min(1000).max(1000000),
  hasCoApplicant: z.boolean(),
  coApplicantName: z.string().optional(),
  coApplicantEmail: z.string().email().optional().or(z.literal('')),
});

type UnsecuredLoanFormData = z.infer<typeof unsecuredLoanSchema>;

export const UnsecuredLoanProductForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UnsecuredLoanFormData>({
    resolver: zodResolver(unsecuredLoanSchema),
    defaultValues: {
      hasCoApplicant: false,
      disbursementMethod: 'bank_transfer',
      repaymentSchedule: 'monthly',
    },
  });

  const hasCoApplicant = watch('hasCoApplicant');

  const onSubmit = (data: UnsecuredLoanFormData) => {
    console.log('Form Submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800">Unsecured Loan Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Loan Amount ($)</label>
        <input
          type="number"
          {...register('loanAmount', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.loanAmount && <p className="text-red-500 text-xs mt-1">{errors.loanAmount.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Disbursement Method</label>
          <select {...register('disbursementMethod')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="bank_transfer">Bank Transfer</option>
            <option value="digital_wallet">Digital Wallet</option>
            <option value="check">Check</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Repayment Schedule</label>
          <select {...register('repaymentSchedule')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="monthly">Monthly</option>
            <option value="bi_weekly">Bi-Weekly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input type="checkbox" {...register('hasCoApplicant')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
        <label className="ml-2 block text-sm text-gray-900">Include Co-Applicant</label>
      </div>

      {hasCoApplicant && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">Co-Applicant Name</label>
            <input {...register('coApplicantName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Co-Applicant Email</label>
            <input {...register('coApplicantEmail')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit Application
      </button>
    </form>
  );
};