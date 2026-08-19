/**
import {

/**
import {

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'z

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE =

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE =

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',


/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',


/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY =import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING =

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY =import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = '

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY =import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = '

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  account

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  account

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn:import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt:

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn:import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt:

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook forimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(),

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook forimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(),

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({


/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) returnimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});



/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) returnimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});



/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => accimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});



/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtual

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtual

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
exportimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
exportimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDtoimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDtoimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUALimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccountimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  set

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(idimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(idimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;


/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;


/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError,

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError,

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Exporting API Service Bundle
 */
export const VirtualAccountsService = {
  get: getVirtualAccounts,
  import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError, public readonly status: number) {
    super(error.message);
    this.name = 'VirtualAccountApiError';
  

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Exporting API Service Bundle
 */
export const VirtualAccountsService = {
  get: getVirtualAccounts,
  import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError, public readonly status: number) {
    super(error.message);
    this.name = 'VirtualAccountApiError';
  

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Exporting API Service Bundle
 */
export const VirtualAccountsService = {
  get: getVirtualAccounts,
  getById: getVirtualAccountById,
  create: createVirtualAccount,
  update: updateVirtualAccount,import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError, public readonly status: number) {
    super(error.message);
    this.name = 'VirtualAccountApiError';
  }
}

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Exporting API Service Bundle
 */
export const VirtualAccountsService = {
  get: getVirtualAccounts,
  getById: getVirtualAccountById,
  create: createVirtualAccount,
  update: updateVirtualAccount,import { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError, public readonly status: number) {
    super(error.message);
    this.name = 'VirtualAccountApiError';
  }
}

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Exporting API Service Bundle
 */
export const VirtualAccountsService = {
  get: getVirtualAccounts,
  getById: getVirtualAccountById,
  create: createVirtualAccount,
  update: updateVirtualAccount,
  delete: deleteVirtualAccount,
  bulkDelete: bulkDeleteVirtualAccounts,
  exportCsv: exportVirtualAccountsCsvimport { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

// --- System Configuration & Constants ---

export const VIRTUAL_ACCOUNTS_API_BASE = '/api/v1/virtual-accounts';

export enum VirtualAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// --- Zod Schemas for Runtime Validation ---

export const VirtualAccountSchema = z.object({
  id: z.string().uuid(),
  accountNumber: z.string(),
  accountName: z.string(),
  status: z.nativeEnum(VirtualAccountStatus),
  currency: z.nativeEnum(CurrencyCode),
  balance: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const VirtualAccountListResponseSchema = z.object({
  data: z.array(VirtualAccountSchema),
  count: z.number().int().nonnegative(),
  nextPageToken: z.string().nullable().optional(),
});

export const CreateVirtualAccountSchema = z.object({
  accountName: z.string().min(1).max(255),
  currency: z.nativeEnum(CurrencyCode),
  metadata: z.record(z.string(), z.any()).optional(),
});

// --- TypeScript Interfaces ---

export interface IVirtualAccount extends z.infer<typeof VirtualAccountSchema> {}

export interface IVirtualAccountListResponse extends z.infer<typeof VirtualAccountListResponseSchema> {}

export interface ICreateVirtualAccountRequest extends z.infer<typeof CreateVirtualAccountSchema> {}

export interface IVirtualAccountApiError {
  code: string;
  message: string;
  details?: unknown;
}

// --- State Store Definition (Zustand/Context Pattern) ---

export interface IVirtualAccountState {
  accounts: IVirtualAccount[];
  isLoading: boolean;
  error: IVirtualAccountApiError | null;
  totalCount: number;
  
  // Actions
  setAccounts: (accounts: IVirtualAccount[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: IVirtualAccountApiError | null) => void;
  updateAccount: (id: string, updates: Partial<IVirtualAccount>) => void;
  removeAccount: (id: string) => void;
}

// --- API Client Configuration ---

export interface ApiClientConfig {
  instance: AxiosInstance;
}

export class VirtualAccountApiError extends Error {
  constructor(public readonly error: IVirtualAccountApiError, public readonly status: number) {
    super(error.message);
    this.name = 'VirtualAccountApiError';
  }
}

/**
 * UI Component Integration Hooks & State Management
 * Provides high-level abstractions for React/Next.js consumption
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export const VIRTUAL_ACCOUNTS_QUERY_KEY = ['virtualAccounts'];

/**
 * Hook for fetching virtual accounts with integrated caching and pagination
 */
export const useVirtualAccounts = (
  params: { page?: number; limit?: number; filter?: Record<string, any> } = {},
  options?: UseQueryOptions<{ data: VirtualAccount[]; count: number }, Error>
) => {
  return useQuery({
    queryKey: [...VIRTUAL_ACCOUNTS_QUERY_KEY, params],
    queryFn: () => getVirtualAccounts(params),
    ...options,
  });
};

/**
 * Hook for deleting a virtual account with optimistic UI updates
 */
export const useDeleteVirtualAccount = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVirtualAccount,
    onSuccess: (_, id) => {
      queryClient.setQueryData(VIRTUAL_ACCOUNTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((acc: VirtualAccount) => acc.id !== id),
          count: old.count - 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for creating a new virtual account
 */
export const useCreateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, CreateVirtualAccountDto>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Hook for updating existing virtual account details
 */
export const useUpdateVirtualAccount = (
  options?: UseMutationOptions<VirtualAccount, Error, { id: string; data: UpdateVirtualAccountDto }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateVirtualAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VIRTUAL_ACCOUNTS_QUERY_KEY });
    },
    ...options,
  });
};

/**
 * Exporting API Service Bundle
 */
export const VirtualAccountsService = {
  get: getVirtualAccounts,
  getById: getVirtualAccountById,
  create: createVirtualAccount,
  update: updateVirtualAccount,
  delete: deleteVirtualAccount,
  bulkDelete: bulkDeleteVirtualAccounts,
  exportCsv: exportVirtualAccountsCsv,
};

export default VirtualAccountsService;

// End of File: api/virtualAccountsApi.ts