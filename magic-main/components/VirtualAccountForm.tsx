import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, Control } from 'react-hook-form';

// ============================================================================
// 0. CORE DEFINITIONS & TYPES
// ============================================================================

export interface VirtualAccount {
    id: string;
    name: string;
    description?: string;
    counterparty_id?: string;
    internal_account_id: string;
    debit_ledger_account_id?: string;
    credit_ledger_account_id?: string;
    metadata?: Record<string, string>;
    account_details?: Array<{ key: string; value: string; encrypted: boolean }>;
    routing_details?: Array<{ scheme: string; address: string }>;
    custom_field_1?: string;
    custom_field_2?: string;
    custom_field_3?: number;
    tags?: string[];
    currency?: string;
    initial_balance?: number;
    status?: 'active' | 'inactive' | 'pending' | 'archived' | 'frozen';
    external_reference?: string;
    linked_accounts?: string[];
    permissions?: string[];
}

// Simulated Hooks
const useInternalAccounts = () => ({
    data: [
        { id: 'int_1', name: 'General Operating (USD)' }, 
        { id: 'int_2', name: 'Treasury Reserve (EUR)' },
        { id: 'int_3', name: 'Client Segregated (GBP)' }
    ],
    isLoading: false,
});

const useCounterparties = () => ({
    data: [
        { id: 'cp_1', name: 'Acme Corp International' }, 
        { id: 'cp_2', name: 'Globex Inc' },
        { id: 'cp_3', name: 'Sovereign Wealth Fund A' }
    ],
    isLoading: false,
});

// ============================================================================
// 1. UI PRIMITIVES
// ============================================================================

const Label = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {children} {required && <span className="text-red-500">*</span>}
    </label>
);

const Input = React.forwardRef<HTMLInputElement, any>(({ label, error, ...props }, ref) => (
    <div className="mb-4">
        {label && <Label required={props.required}>{label}</Label>}
        <input
            ref={ref}
            className={`w-full bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-700'} rounded p-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            {...props}
        />
        {error && <span className="text-red-400 text-xs mt-1 block">{error}</span>}
    </div>
));

const Select = React.forwardRef<HTMLSelectElement, any>(({ label, error, children, ...props }, ref) => (
    <div className="mb-4">
        {label && <Label required={props.required}>{label}</Label>}
        <select
            ref={ref}
            className={`w-full bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-700'} rounded p-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none`}
            {...props}
        >
            {children}
        </select>
        {error && <span className="text-red-400 text-xs mt-1 block">{error}</span>}
    </div>
));

const Tabs = ({ activeTab, setActiveTab, tabs }: any) => (
    <div className="flex border-b border-gray-700 mb-6 space-x-1">
        {tabs.map((tab: string) => (
            <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
            >
                {tab}
            </button>
        ))}
    </div>
);

// ============================================================================
// 2. MAIN COMPONENT: VirtualAccountForm
// ============================================================================

interface VirtualAccountFormProps {
    initialValues?: VirtualAccount;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    onCancel?: () => void;
    formType: 'create' | 'update';
}

const VirtualAccountForm: React.FC<VirtualAccountFormProps> = ({
    initialValues,
    onSubmit,
    isSubmitting,
    onCancel,
    formType,
}) => {
    const [activeTab, setActiveTab] = useState('General');
    const [auditLog, setAuditLog] = useState<string[]>([]);

    const { register, control, handleSubmit, watch, formState: { errors, isValid } } = useForm<VirtualAccount>({
        defaultValues: initialValues || {
            status: 'active',
            currency: 'USD',
            account_details: [],
            routing_details: [],
            tags: [],
            permissions: []
        }
    });

    const { fields: detailFields, append: appendDetail, remove: removeDetail } = useFieldArray({
        control,
        name: "account_details"
    });

    const { fields: routingFields, append: appendRouting, remove: removeRouting } = useFieldArray({
        control,
        name: "routing_details"
    });

    // Watch values for real-time validation preview
    const formValues = watch();

    // Log interaction
    const logInteraction = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setAuditLog(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 10));
    };

    const handleFormSubmit = (data: any) => {
        logInteraction("Form submission initiated...");
        onSubmit(data);
    };

    // --- RENDER SECTIONS ---

    const renderGeneralTab = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="md:col-span-2">
                <Input
                    label="Account Name"
                    {...register('name', { required: 'Account Name is mandatory.' })}
                    error={errors.name?.message}
                    placeholder="e.g. Project Alpha Operating Account"
                    onFocus={() => logInteraction("Focus: Name Field")}
                />
            </div>
            
            <div className="md:col-span-2">
                <Input
                    label="Description"
                    {...register('description')}
                    placeholder="Brief description of the account purpose"
                />
            </div>

            <div className="md:col-span-1">
                <Input
                    label="Currency"
                    {...register('currency', { required: true, maxLength: 3 })}
                    placeholder="USD"
                    error={errors.currency && "Currency code required (3 chars)"}
                />
            </div>

            <div className="md:col-span-1">
                <Input
                    label="Initial Balance"
                    type="number"
                    step="0.01"
                    {...register('initial_balance')}
                    placeholder="0.00"
                />
            </div>

            <div className="md:col-span-1">
                <Select label="Status" {...register('status')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="frozen">Frozen (Regulatory)</option>
                    <option value="archived">Archived</option>
                </Select>
            </div>

            <div className="md:col-span-1">
                <Input
                    label="External Reference ID"
                    {...register('external_reference')}
                    placeholder="REF-XXXX-YYYY"
                />
            </div>
        </div>
    );

    const renderLedgerTab = () => {
        const { data: internalAccounts } = useInternalAccounts();
        const { data: counterparties } = useCounterparties();

        return (
            <div className="space-y-6 animate-fadeIn">
                 <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded text-sm text-blue-200">
                    <strong className="block mb-1">Ledger Configuration</strong>
                    Map this virtual account to your internal general ledger and an optional external counterparty.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select label="Internal Omnibus Account" {...register('internal_account_id', { required: "Internal Account is required" })} error={errors.internal_account_id?.message}>
                        <option value="">-- Select Internal Ledger --</option>
                        {internalAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </Select>

                    <Select label="Counterparty (Optional)" {...register('counterparty_id')}>
                         <option value="">-- Select External Entity --</option>
                         {counterparties.map(cp => <option key={cp.id} value={cp.id}>{cp.name}</option>)}
                    </Select>
                    
                    <Input
                        label="Debit Ledger ID (GL)"
                        {...register('debit_ledger_account_id')}
                        placeholder="GL-XXXX-DB"
                    />

                    <Input
                        label="Credit Ledger ID (GL)"
                        {...register('credit_ledger_account_id')}
                        placeholder="GL-XXXX-CR"
                    />
                </div>
            </div>
        );
    };

    const renderRoutingTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-300 uppercase">Routing Addresses</h3>
                <button
                    type="button"
                    onClick={() => appendRouting({ scheme: 'iban', address: '' })}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white transition-colors"
                >
                    + Add Route
                </button>
            </div>
            
            {routingFields.length === 0 && <p className="text-gray-500 text-sm italic">No routing details configured.</p>}

            {routingFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start bg-gray-900/50 p-3 rounded border border-gray-700">
                    <div className="w-1/3">
                        <Select {...register(`routing_details.${index}.scheme` as const)}>
                            <option value="iban">IBAN</option>
                            <option value="sort_code">Sort Code</option>
                            <option value="ach">ACH Routing</option>
                            <option value="swift">SWIFT/BIC</option>
                            <option value="crypto_address">Wallet Address</option>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Input 
                            {...register(`routing_details.${index}.address` as const, { required: true })} 
                            placeholder="Address / Number"
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => removeRouting(index)}
                        className="mt-1 text-red-500 hover:text-red-400"
                    >
                        &times;
                    </button>
                </div>
            ))}

            <div className="mt-8 border-t border-gray-700 pt-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-300 uppercase">Custom Key-Values</h3>
                    <button
                        type="button"
                        onClick={() => appendDetail({ key: '', value: '', encrypted: false })}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white transition-colors"
                    >
                        + Add Detail
                    </button>
                </div>
                {detailFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-start mb-2">
                        <input
                            {...register(`account_details.${index}.key` as const)}
                            placeholder="Key"
                            className="w-1/3 bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                        />
                        <input
                            {...register(`account_details.${index}.value` as const)}
                            placeholder="Value"
                            className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm"
                        />
                         <button 
                            type="button" 
                            onClick={() => removeDetail(index)}
                            className="text-red-500 hover:text-red-400 px-2"
                        >
                            Del
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderMetadataTab = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Custom Field 1" {...register('custom_field_1')} />
                <Input label="Custom Field 2" {...register('custom_field_2')} />
                <Input label="Custom Field 3 (Numeric)" type="number" {...register('custom_field_3')} />
            </div>

            <div>
                <Label>Raw Metadata (JSON)</Label>
                <textarea
                    {...register('metadata', { 
                        validate: (value: any) => {
                            if (!value) return true;
                            try {
                                if (typeof value === 'string') JSON.parse(value);
                                return true;
                            } catch {
                                return "Invalid JSON format";
                            }
                        }
                    })}
                    className="w-full h-32 bg-gray-900 border border-gray-700 rounded p-3 text-white font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder='{"client_segment": "enterprise", "risk_score": "low"}'
                />
                {errors.metadata && <p className="text-red-400 text-xs mt-1">Invalid JSON provided.</p>}
            </div>
            
            <div>
                 <Label>Tags (Comma Separated)</Label>
                 <Input 
                    placeholder="e.g. urgent, high-value, europe"
                    {...register('tags')} // Ideally transform string to array on submit
                 />
            </div>
        </div>
    );

    // --- MAIN RENDER ---

    return (
        <div className="flex gap-6 max-w-7xl mx-auto">
            {/* LEFT COLUMN: THE FORM */}
            <div className="flex-1 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700 bg-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-sm"></span>
                        {formType === 'create' ? 'Create Virtual Account' : 'Update Virtual Account'}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1 ml-4">
                        Configure ledger mapping, routing protocols, and metadata.
                    </p>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <Tabs 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                            tabs={['General', 'Ledger', 'Routing & Details', 'Metadata']} 
                        />

                        <div className="min-h-[400px]">
                            {activeTab === 'General' && renderGeneralTab()}
                            {activeTab === 'Ledger' && renderLedgerTab()}
                            {activeTab === 'Routing & Details' && renderRoutingTab()}
                            {activeTab === 'Metadata' && renderMetadataTab()}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-700">
                             <div className="text-xs text-gray-500">
                                {isValid ? <span className="text-green-500">✓ Validation Passed</span> : <span className="text-red-500">⚠ Validation Pending</span>}
                             </div>
                             <div className="flex gap-3">
                                {onCancel && (
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-900/50 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Processing...' : formType === 'create' ? 'Create Account' : 'Save Changes'}
                                </button>
                             </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* RIGHT COLUMN: PREVIEW & LOGS (THE "LONGER" PART) */}
            <div className="w-80 space-y-6 hidden xl:block">
                
                {/* 1. Live Data Preview */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-800 pb-2">
                        Data Object Preview
                    </h3>
                    <pre className="text-[10px] leading-relaxed text-green-400 font-mono overflow-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-700">
                        {JSON.stringify(formValues, null, 2)}
                    </pre>
                </div>

                {/* 2. Audit Log Console */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-gray-800 pb-2">
                        Interaction Log
                    </h3>
                    <div className="space-y-1.5">
                        {auditLog.length === 0 && <span className="text-gray-600 text-xs italic">Waiting for input...</span>}
                        {auditLog.map((log, i) => (
                            <div key={i} className="text-[10px] text-gray-400 font-mono border-l-2 border-gray-700 pl-2">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. System Status */}
                 <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-gray-400">Ledger API</span>
                         <span className="text-xs text-green-500 font-bold">ONLINE</span>
                    </div>
                     <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-gray-400">Compliance Check</span>
                         <span className="text-xs text-green-500 font-bold">READY</span>
                    </div>
                    <div className="w-full bg-gray-700 h-1 rounded mt-2">
                        <div className="bg-blue-500 h-1 rounded w-3/4 animate-pulse"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VirtualAccountForm;

// ============================================================================
// 3. JAMES BURVEL O’CALLAGHAN III CODE - API SPECIFICATION DOCUMENTATION
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * THE JAMES BURVEL O’CALLAGHAN III PROTOCOL - VIRTUAL ACCOUNT API v1.0.0
 * ----------------------------------------------------------------------------
 * 
 * This documentation outlines the exact contractual obligations of the Virtual Account
 * Lifecycle Management System. All endpoints are secured via JWT and enforced by
 * Role-Based Access Control (RBAC).
 * 
 * ============================================================================
 * SECTION 1: CORE CRUD OPERATIONS
 * ============================================================================
 * 
 * 1.01 [POST] /api/v1/virtual-accounts
 *      - Description: Provisions a new Virtual Account (VA) entity.
 *      - Trigger: Form Submission (Create Mode).
 *      - Required Permissions: 'va_write', 'ledger_access'.
 *      - Side Effects: 
 *          1. Creates a ledger entry in the shadow table.
 *          2. Emits 'VirtualAccountCreated' event to the Kafka stream.
 * 
 * 1.02 [GET] /api/v1/virtual-accounts/:id
 *      - Description: Retrieves full hydration of a VA entity.
 *      - Parameters: id (UUID).
 *      - Response: JSON (See 'Data Object Preview' in UI).
 * 
 * 1.03 [PUT] /api/v1/virtual-accounts/:id
 *      - Description: Updates mutable fields (name, description, metadata, status).
 *      - Immutable Fields: internal_account_id, currency (post-transaction).
 *      - Validation: Deep object comparison to generate audit trail diffs.
 * 
 * 1.04 [DELETE] /api/v1/virtual-accounts/:id
 *      - Description: Soft-deletes a VA.
 *      - Constraint: Account balance must be 0.00.
 *      - Constraint: No pending transactions in the mempool.
 * 
 * ============================================================================
 * SECTION 2: ADVANCED LEDGER OPERATIONS (JBOCC-ALO)
 * ============================================================================
 * 
 * 2.01 [POST] /api/v1/virtual-accounts/:id/freeze
 *      - Description: Freezes account for compliance review.
 *      - Trigger: 'status' changed to 'frozen'.
 *      - Notify: Compliance Officer, Account Owner.
 * 
 * 2.02 [GET] /api/v1/virtual-accounts/:id/audit-trail
 *      - Description: Retrieves the immutable log of all changes.
 *      - Use Case: Regulator Audit Request (SAR).
 * 
 * 2.03 [POST] /api/v1/virtual-accounts/:id/reconcile
 *      - Description: Forces a reconciliation against the Internal Omnibus Account.
 *      - Algorithm: Double-entry verification of sum(VA_balances) == Real_Account_Balance.
 * 
 * ============================================================================
 * SECTION 3: USE CASES & BUSINESS LOGIC
 * ============================================================================
 * 
 * UC-101: Onboarding High-Volume Client
 *      - Actor: Operations Manager.
 *      - Action: Creates VA with 'internal_account_id' pointing to the USD Operating Omnibus.
 *      - Detail: Adds 5 'routing_details' (ACH, Wire, SWIFT, SEPA, RTP).
 *      - Result: Client can immediately receive funds via 5 rails.
 * 
 * UC-102: Compliance Suspension
 *      - Actor: Compliance Algo / Risk Officer.
 *      - Action: Updates status to 'inactive'.
 *      - Detail: Metadata updated with {"risk_reason": "flagged_transaction_123"}.
 *      - Result: All incoming credits are bounced; debits are queued for manual review.
 * 
 * UC-103: Treasury Sweep
 *      - Actor: System (Cron).
 *      - Action: Checks 'initial_balance' vs current.
 *      - Detail: Moves excess funds to 'credit_ledger_account_id'.
 * 
 * ============================================================================
 * SECTION 4: FIELD VALIDATION RULES (JBOCC-VAL)
 * ============================================================================
 * 
 * - name: String(255), Not Null, Unique per Internal Account.
 * - currency: ISO 4217, 3 chars, must match Internal Account currency.
 * - metadata: JSONB, Max 2MB.
 * - routing_details: Array, verified against Luhn algorithm where applicable (IBAN).
 * - tags: Array<String>, indexed for elastic search.
 * 
 * ============================================================================
 * SECTION 5: ERROR CODES
 * ============================================================================
 * 
 * - E_4001: Invalid Currency Match (VA currency != Parent currency).
 * - E_4002: Ledger ID Not Found.
 * - E_4003: Account Not Empty (Cannot delete).
 * - E_4009: Idempotency Key Replay Detected.
 * 
 * (End of Specification - James Burvel O’Callaghan III)
 */