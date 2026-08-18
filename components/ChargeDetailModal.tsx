import React from 'react';

interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string | null;
  created: number;
  receipt_url?: string | null;
  payment_intent?: string | { id: string } | null;
  balance_transaction?: string | { id: string } | null;
  captured: boolean;
  payment_method_details?: any;
  amount_refunded: number;
  refunded: boolean;
  refunds?: {
    data: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
    }>;
  };
  customer?: string | { id: string } | null;
  billing_details?: any;
  metadata?: Record<string, string>;
}

interface ChargeDetailModalProps {
  charge: Charge;
  isOpen: boolean;
  onClose: () => void;
}

const getChargeStatusColor = (status: string) => {
  switch (status) {
    case 'succeeded': return 'success';
    case 'pending': return 'warning';
    case 'failed': return 'danger';
    default: return 'default';
  }
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: React.ReactNode; size?: string; children: React.ReactNode }> = ({ isOpen, onClose, title, size, children }) => {
  if (!isOpen) return null;
  const maxWidth = size === 'large' ? 'max-w-4xl' : 'max-w-2xl';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`bg-gray-900 rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto border border-gray-800`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
    <h3 className="text-md font-semibold text-white mb-4">{title}</h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const DetailItem: React.FC<{ title: string; value: React.ReactNode; isMono?: boolean }> = ({ title, value, isMono }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 py-1">
    <span className="text-sm text-gray-400">{title}</span>
    <span className={`text-sm text-white ${isMono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

const NexusLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <a href={to} className="text-blue-400 hover:text-blue-300 underline transition-colors">
    {children}
  </a>
);

const Amount: React.FC<{ amount: number; currency: string; className?: string }> = ({ amount, currency, className = '' }) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
  return <span className={className}>{formatted}</span>;
};

const Timestamp: React.FC<{ ts: number }> = ({ ts }) => {
  const date = new Date(ts * 1000);
  return <span>{date.toLocaleString()}</span>;
};

const StatusBadge: React.FC<{ status: string; color: string }> = ({ status, color }) => {
  const colorClasses = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    default: 'bg-gray-500/20 text-gray-400',
  }[color] || 'bg-gray-500/20 text-gray-400';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colorClasses}`}>
      {status}
    </span>
  );
};

const Metadata: React.FC<{ metadata: Record<string, string> }> = ({ metadata }) => (
  <div className="space-y-2">
    {Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="flex flex-col">
        <span className="text-xs text-gray-500">{key}</span>
        <span className="text-sm text-gray-300 font-mono break-all">{value}</span>
      </div>
    ))}
  </div>
);

const BillingDetails: React.FC<{ details: any }> = ({ details }) => {
  if (!details) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Billing Details</h4>
      {details.name && <DetailItem title="Name" value={details.name} />}
      {details.email && <DetailItem title="Email" value={details.email} />}
      {details.phone && <DetailItem title="Phone" value={details.phone} />}
      {details.address && (
        <div className="text-sm text-gray-400 mt-2">
          {details.address.line1 && <div>{details.address.line1}</div>}
          {details.address.line2 && <div>{details.address.line2}</div>}
          <div>
            {[details.address.city, details.address.state, details.address.postal_code].filter(Boolean).join(', ')}
          </div>
          {details.address.country && <div>{details.address.country}</div>}
        </div>
      )}
    </div>
  );
};

const PaymentMethodDetails: React.FC<{ details: any }> = ({ details }) => {
  if (!details) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Payment Method</h4>
      <DetailItem title="Type" value={details.type} />
      {details.card && (
        <>
          <DetailItem title="Brand" value={details.card.brand} />
          <DetailItem title="Last 4" value={`•••• ${details.card.last4}`} isMono />
          <DetailItem title="Expires" value={`${details.card.exp_month}/${details.card.exp_year}`} />
        </>
      )}
    </div>
  );
};

export const ChargeDetailModal: React.FC<ChargeDetailModalProps> = ({
  charge,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Charge</span>
          <span className="font-mono text-white">{charge.id}</span>
        </div>
      }
      size="large"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
        <div className="md:col-span-2 space-y-6">
          <Section title="Summary">
            <DetailItem title="ID" value={charge.id} isMono />
            <DetailItem
              title="Amount"
              value={
                <Amount
                  amount={charge.amount}
                  currency={charge.currency || 'USD'}
                  className="font-bold text-lg text-white"
                />
              }
            />
            <DetailItem
              title="Status"
              value={
                <StatusBadge
                  status={charge.status}
                  color={getChargeStatusColor(charge.status)}
                />
              }
            />
            <DetailItem title="Description" value={charge.description || 'N/A'} />
            <DetailItem title="Created" value={<Timestamp ts={charge.created} />} />
            {charge.receipt_url && (
              <DetailItem
                title="Receipt"
                value={
                  <a href={charge.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                    View Receipt
                  </a>
                }
              />
            )}
          </Section>

          <Section title="Payment Details">
            {charge.payment_intent && (
              <DetailItem
                title="Payment Intent"
                value={
                  <NexusLink to={`/payment_intents/${typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id}`}>
                     {typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id}
                  </NexusLink>
                }
              />
            )}
            {charge.balance_transaction && (
              <DetailItem
                title="Balance Transaction"
                value={
                  <NexusLink to={`/balance_transactions/${typeof charge.balance_transaction === 'string' ? charge.balance_transaction : charge.balance_transaction?.id}`}>
                    {typeof charge.balance_transaction === 'string' ? charge.balance_transaction : charge.balance_transaction?.id}
                  </NexusLink>
                }
              />
            )}
            <DetailItem title="Captured" value={charge.captured ? 'Yes' : 'No'} />
            {charge.payment_method_details && <PaymentMethodDetails details={charge.payment_method_details} />}
          </Section>

          <Section title="Refunds">
             <DetailItem
                title="Amount Refunded"
                value={<Amount amount={charge.amount_refunded} currency={charge.currency || 'USD'} />}
             />
             <DetailItem title="Refunded" value={charge.refunded ? 'Yes' : 'No'} />
             {charge.refunds && charge.refunds.data.length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Refund List</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                        {charge.refunds.data.map((refund) => (
                            <li key={refund.id}>
                                <NexusLink to={`/refunds/${refund.id}`}>{refund.id}</NexusLink>
                                {' - '}
                                <Amount amount={refund.amount} currency={refund.currency || 'USD'} /> ({refund.status})
                            </li>
                        ))}
                    </ul>
                </div>
             )}
          </Section>
        </div>

        <div className="md:col-span-1 space-y-6">
          <Section title="Customer">
            {charge.customer ? (
              <DetailItem
                title="ID"
                value={
                  <NexusLink to={`/customers/${typeof charge.customer === 'string' ? charge.customer : charge.customer.id}`}>
                    {typeof charge.customer === 'string' ? charge.customer : charge.customer.id}
                  </NexusLink>
                }
              />
            ) : (
                <DetailItem title="Customer" value="Guest" />
            )}
            <BillingDetails details={charge.billing_details} />
          </Section>

          {charge.metadata && Object.keys(charge.metadata).length > 0 && (
            <Section title="Metadata">
              <Metadata metadata={charge.metadata} />
            </Section>
          )}
        </div>
      </div>
    </Modal>
  );
};