import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { GoogleGenAI } from "@google/genai";
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  Paper,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Badge,
  LinearProgress,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import ReactFlow, {
  Zoom,
  useNodes,
  useEdges,
  useReactFlow,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  NodeTypes,
  EdgeTypes,
  addEdge,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  NodeChange,
  EdgeChange,
  Panel,
  BackgroundVariant
} from 'reactflow';
// Styles loaded via index.html
// import 'reactflow/dist/style.css';
import {
  ChevronLeft,
  ChevronRight,
  Fullscreen,
  FullscreenExit,
  SmartToy,
  Send,
  Security,
  Speed,
  BugReport,
  Assessment,
  History,
  Psychology,
  Terminal,
  Close,
  Refresh,
  AddCircleOutline,
  WarningAmber
} from '@mui/icons-material';
import {
  useStripeData,
  ResourceType,
  StripeResource,
  NodeData,
  EdgeData,
  isEdge,
  isNode,
} from '../hooks/useStripeData';
import {
  AccountNode,
  AccountLinkNode,
  ApplePayDomainNode,
  ApplicationFeeNode,
  AppsSecretNode,
  BalanceNode,
  BalanceTransactionNode,
  BankAccountNode,
  BillingPortalConfigurationNode,
  BillingPortalSessionNode,
  CapabilityNode,
  CardNode,
  CashBalanceNode,
  ChargeNode,
  CheckoutSessionNode,
  CountrySpecNode,
  CouponNode,
  CreditNoteNode,
  CreditNoteLineItemNode,
  CustomerNode,
  CustomerBalanceTransactionNode,
  CustomerCashBalanceTransactionNode,
  DeletedAccountNode,
  DeletedApplePayDomainNode,
  DeletedCouponNode,
  DeletedCustomerNode,
  DeletedDiscountNode,
  DeletedExternalAccountNode,
  DeletedInvoiceNode,
  DeletedInvoiceitemNode,
  DeletedPaymentSourceNode,
  DeletedPersonNode,
  DeletedPlanNode,
  DeletedProductNode,
  DeletedRadarValueListNode,
  DeletedRadarValueListItemNode,
  DeletedSubscriptionItemNode,
  DeletedTaxIdNode,
  DeletedTerminalConfigurationNode,
  DeletedTerminalLocationNode,
  DeletedTerminalReaderNode,
  DeletedTestHelpersTestClockNode,
  DeletedWebhookEndpointNode,
  DiscountNode,
  DisputeNode,
  EphemeralKeyNode,
  EventNode,
  ExchangeRateNode,
  ExternalAccountNode,
  FeeRefundNode,
  FileNode,
  FileLinkNode,
  FinancialConnectionsAccountNode,
  FinancialConnectionsAccountOwnerNode,
  FinancialConnectionsSessionNode,
  FundingInstructionsNode,
  IdentityVerificationReportNode,
  IdentityVerificationSessionNode,
  InvoiceNode,
  InvoiceitemNode,
  IssuingAuthorizationNode,
  IssuingCardNode,
  IssuingCardholderNode,
  IssuingDisputeNode,
  IssuingSettlementNode,
  IssuingTransactionNode,
  ItemNode,
  LineItemNode,
  LoginLinkNode,
  MandateNode,
  PaymentIntentNode,
  PaymentLinkNode,
  PaymentMethodNode,
  PaymentSourceNode,
  PayoutNode,
  PersonNode,
  PlanNode,
  PriceNode,
  ProductNode,
  PromotionCodeNode,
  QuoteNode,
  RadarEarlyFraudWarningNode,
  RadarValueListNode,
  RadarValueListItemNode,
  RefundNode,
  ReportingReportRunNode,
  ReportingReportTypeNode,
  ReviewNode,
  ScheduledQueryRunNode,
  SetupAttemptNode,
  SetupIntentNode,
  ShippingRateNode,
  SourceNode,
  SourceMandateNotificationNode,
  SourceTransactionNode,
  SubscriptionNode,
  SubscriptionItemNode,
  SubscriptionScheduleNode,
  TaxCodeNode,
  TaxIdNode,
  TaxRateNode,
  TerminalConfigurationNode,
  TerminalConnectionTokenNode,
  TerminalLocationNode,
  TerminalReaderNode,
  TestHelpersTestClockNode,
  TokenNode,
  TopupNode,
  TransferNode,
  TransferReversalNode,
  TreasuryCreditReversalNode,
  TreasuryDebitReversalNode,
  TreasuryFinancialAccountNode,
  TreasuryFinancialAccountFeaturesNode,
  TreasuryInboundTransferNode,
  TreasuryOutboundPaymentNode,
  TreasuryOutboundTransferNode,
  TreasuryReceivedCreditNode,
  TreasuryReceivedDebitNode,
  TreasuryTransactionNode,
  TreasuryTransactionEntryNode,
  WebhookEndpointNode,
  AccountNoticeNode,
  AccountSessionNode,
  ApplicationNode,
  BalanceSettingsNode,
  BillingAlertNode,
  BillingAlertTriggeredNode,
  BillingCreditBalanceSummaryNode,
  BillingCreditBalanceTransactionNode,
  BillingCreditGrantNode,
  BillingMeterNode,
  BillingMeterEventNode,
  BillingMeterEventAdjustmentNode,
  BillingMeterEventSummaryNode,
  CapitalFinancingOfferNode,
  CapitalFinancingSummaryNode,
  CapitalFinancingTransactionNode,
  ClimateOrderNode,
  ClimateProductNode,
  ClimateSupplierNode,
  ConfirmationTokenNode,
  CustomerSessionNode,
  DeletedApplicationNode,
  DeletedBankAccountNode,
  DeletedCardNode,
  DeletedPriceNode,
  DeletedProductFeatureNode,
  EntitlementsActiveEntitlementNode,
  EntitlementsActiveEntitlementSummaryNode,
  EntitlementsFeatureNode,
  FinancialConnectionsAccountInferredBalanceNode,
  FinancialConnectionsAccountOwnershipNode,
  FinancialConnectionsInstitutionNode,
  FinancialConnectionsTransactionNode,
  ForwardingRequestNode,
  FxQuoteNode,
  InvoicePaymentNode,
  InvoiceRenderingTemplateNode,
  IssuingCreditUnderwritingRecordNode,
  IssuingDisputeSettlementDetailNode,
  IssuingFraudLiabilityDebitNode,
  IssuingPersonalizationDesignNode,
  IssuingPhysicalBundleNode,
  IssuingTokenNode,
  MarginNode,
  OrderNode,
  PaymentAttemptRecordNode,
  PaymentIntentAmountDetailsLineItemNode,
  PaymentMethodConfigurationNode,
  PaymentMethodDomainNode,
  PaymentRecordNode,
  PrivacyRedactionJobNode,
  PrivacyRedactionJobValidationErrorNode,
  ProductFeatureNode,
  QuoteLineNode,
  QuotePreviewInvoiceNode,
  QuotePreviewSubscriptionScheduleNode,
  TaxAssociationNode,
  TaxCalculationNode,
  TaxCalculationLineItemNode,
  TaxFormNode,
  TaxRegistrationNode,
  TaxSettingsNode,
  TaxTransactionNode,
  TaxTransactionLineItemNode,
  TerminalReaderCollectedDataNode,
  TerminalOnboardingLinkNode,
  BillingAnalyticsMeterUsageNode,
  BillingAnalyticsMeterUsageRowNode,
  PaymentMethodBalanceNode,
  DelegatedCheckoutRequestedSessionNode,
  IdentityBlocklistEntryNode,
  TransitBalanceNode,
  IssuingProgramNode,
  BalanceTransferNode,
  RadarAccountEvaluationNode,
  ProductCatalogTrialOfferNode,
} from './nodes';
import {
  DefaultEdge,
  AccountEdge,
  AccountLinkEdge,
  ApplePayDomainEdge,
  ApplicationFeeEdge,
  AppsSecretEdge,
  BalanceEdge,
  BalanceTransactionEdge,
  BankAccountEdge,
  BillingPortalConfigurationEdge,
  BillingPortalSessionEdge,
  CapabilityEdge,
  CardEdge,
  CashBalanceEdge,
  ChargeEdge,
  CheckoutSessionEdge,
  CountrySpecEdge,
  CouponEdge,
  CreditNoteEdge,
  CreditNoteLineItemEdge,
  CustomerEdge,
  CustomerBalanceTransactionEdge,
  CustomerCashBalanceTransactionEdge,
  DeletedAccountEdge,
  DeletedApplePayDomainEdge,
  DeletedCouponEdge,
  DeletedCustomerEdge,
  DeletedDiscountEdge,
  DeletedExternalAccountEdge,
  DeletedInvoiceEdge,
  DeletedInvoiceitemEdge,
  DeletedPaymentSourceEdge,
  DeletedPersonEdge,
  DeletedPlanEdge,
  DeletedProductEdge,
  DeletedRadarValueListEdge,
  DeletedRadarValueListItemEdge,
  DeletedSubscriptionItemEdge,
  DeletedTaxIdEdge,
  DeletedTerminalConfigurationEdge,
  DeletedTerminalLocationEdge,
  DeletedTerminalReaderEdge,
  DeletedTestHelpersTestClockEdge,
  DeletedWebhookEndpointEdge,
  DiscountEdge,
  DisputeEdge,
  EphemeralKeyEdge,
  EventEdge,
  ExchangeRateEdge,
  ExternalAccountEdge,
  FeeRefundEdge,
  FileEdge,
  FileLinkEdge,
  FinancialConnectionsAccountEdge,
  FinancialConnectionsAccountOwnerEdge,
  FinancialConnectionsSessionEdge,
  FundingInstructionsEdge,
  IdentityVerificationReportEdge,
  IdentityVerificationSessionEdge,
  InvoiceEdge,
  InvoiceitemEdge,
  IssuingAuthorizationEdge,
  IssuingCardEdge,
  IssuingCardholderEdge,
  IssuingDisputeEdge,
  IssuingSettlementEdge,
  IssuingTransactionEdge,
  ItemEdge,
  LineItemEdge,
  LoginLinkEdge,
  MandateEdge,
  PaymentIntentEdge,
  PaymentLinkEdge,
  PaymentMethodEdge,
  PaymentSourceEdge,
  PayoutEdge,
  PersonEdge,
  PlanEdge,
  PriceEdge,
  ProductEdge,
  PromotionCodeEdge,
  QuoteEdge,
  RadarEarlyFraudWarningEdge,
  RadarValueListEdge,
  RadarValueListItemEdge,
  RefundEdge,
  ReportingReportRunEdge,
  ReportingReportTypeEdge,
  ReviewEdge,
  ScheduledQueryRunEdge,
  SetupAttemptEdge,
  SetupIntentEdge,
  ShippingRateEdge,
  SourceEdge,
  SourceMandateNotificationEdge,
  SourceTransactionEdge,
  SubscriptionEdge,
  SubscriptionItemEdge,
  SubscriptionScheduleEdge,
  TaxCodeEdge,
  TaxIdEdge,
  TaxRateEdge,
  TerminalConfigurationEdge,
  TerminalConnectionTokenEdge,
  TerminalLocationEdge,
  TerminalReaderEdge,
  TestHelpersTestClockEdge,
  TokenEdge,
  TopupEdge,
  TransferEdge,
  TransferReversalEdge,
  TreasuryCreditReversalEdge,
  TreasuryDebitReversalEdge,
  TreasuryFinancialAccountEdge,
  TreasuryFinancialAccountFeaturesEdge,
  TreasuryInboundTransferEdge,
  TreasuryOutboundPaymentEdge,
  TreasuryOutboundTransferEdge,
  TreasuryReceivedCreditEdge,
  TreasuryReceivedDebitEdge,
  TreasuryTransactionEdge,
  TreasuryTransactionEntryEdge,
  WebhookEndpointEdge,
  AccountNoticeEdge,
  AccountSessionEdge,
  ApplicationEdge,
  BalanceSettingsEdge,
  BillingAlertEdge,
  BillingAlertTriggeredEdge,
  BillingCreditBalanceSummaryEdge,
  BillingCreditBalanceTransactionEdge,
  BillingCreditGrantEdge,
  BillingMeterEdge,
  BillingMeterEventEdge,
  BillingMeterEventAdjustmentEdge,
  BillingMeterEventSummaryEdge,
  CapitalFinancingOfferEdge,
  CapitalFinancingSummaryEdge,
  CapitalFinancingTransactionEdge,
  ClimateOrderEdge,
  ClimateProductEdge,
  ClimateSupplierEdge,
  ConfirmationTokenEdge,
  CustomerSessionEdge,
  DeletedApplicationEdge,
  DeletedBankAccountEdge,
  DeletedCardEdge,
  DeletedPriceEdge,
  DeletedProductFeatureEdge,
  EntitlementsActiveEntitlementEdge,
  EntitlementsActiveEntitlementSummaryEdge,
  EntitlementsFeatureEdge,
  FinancialConnectionsAccountInferredBalanceEdge,
  FinancialConnectionsAccountOwnershipEdge,
  FinancialConnectionsInstitutionEdge,
  FinancialConnectionsTransactionEdge,
  ForwardingRequestEdge,
  FxQuoteEdge,
  InvoicePaymentEdge,
  InvoiceRenderingTemplateEdge,
  IssuingCreditUnderwritingRecordEdge,
  IssuingDisputeSettlementDetailEdge,
  IssuingFraudLiabilityDebitEdge,
  IssuingPersonalizationDesignEdge,
  IssuingPhysicalBundleEdge,
  IssuingTokenEdge,
  MarginEdge,
  OrderEdge,
  PaymentAttemptRecordEdge,
  PaymentIntentAmountDetailsLineItemEdge,
  PaymentMethodConfigurationEdge,
  PaymentMethodDomainEdge,
  PaymentRecordEdge,
  PrivacyRedactionJobEdge,
  PrivacyRedactionJobValidationErrorEdge,
  ProductFeatureEdge,
  QuoteLineEdge,
  QuotePreviewInvoiceEdge,
  QuotePreviewSubscriptionScheduleEdge,
  TaxAssociationEdge,
  TaxCalculationEdge,
  TaxCalculationLineItemEdge,
  TaxFormEdge,
  TaxRegistrationEdge,
  TaxSettingsEdge,
  TaxTransactionEdge,
  TaxTransactionLineItemEdge,
  TerminalReaderCollectedDataEdge,
  TerminalOnboardingLinkEdge,
  BillingAnalyticsMeterUsageEdge,
  BillingAnalyticsMeterUsageRowEdge,
  PaymentMethodBalanceEdge,
  DelegatedCheckoutRequestedSessionEdge,
  IdentityBlocklistEntryEdge,
  TransitBalanceEdge,
  IssuingProgramEdge,
  BalanceTransferEdge,
  RadarAccountEvaluationEdge,
  ProductCatalogTrialOfferEdge,
} from './edges';

const nodeTypes: NodeTypes = {
  account: AccountNode,
  account_link: AccountLinkNode,
  apple_pay_domain: ApplePayDomainNode,
  application_fee: ApplicationFeeNode,
  apps_secret: AppsSecretNode,
  balance: BalanceNode,
  balance_transaction: BalanceTransactionNode,
  bank_account: BankAccountNode,
  billing_portal_configuration: BillingPortalConfigurationNode,
  billing_portal_session: BillingPortalSessionNode,
  capability: CapabilityNode,
  card: CardNode,
  cash_balance: CashBalanceNode,
  charge: ChargeNode,
  checkout_session: CheckoutSessionNode,
  country_spec: CountrySpecNode,
  coupon: CouponNode,
  credit_note: CreditNoteNode,
  credit_note_line_item: CreditNoteLineItemNode,
  customer: CustomerNode,
  customer_balance_transaction: CustomerBalanceTransactionNode,
  customer_cash_balance_transaction: CustomerCashBalanceTransactionNode,
  deleted_account: DeletedAccountNode,
  deleted_apple_pay_domain: DeletedApplePayDomainNode,
  deleted_coupon: DeletedCouponNode,
  deleted_customer: DeletedCustomerNode,
  deleted_discount: DeletedDiscountNode,
  deleted_external_account: DeletedExternalAccountNode,
  deleted_invoice: DeletedInvoiceNode,
  deleted_invoiceitem: DeletedInvoiceitemNode,
  deleted_payment_source: DeletedPaymentSourceNode,
  deleted_person: DeletedPersonNode,
  deleted_plan: DeletedPlanNode,
  deleted_product: DeletedProductNode,
  deleted_radar_value_list: DeletedRadarValueListNode,
  deleted_radar_value_list_item: DeletedRadarValueListItemNode,
  deleted_subscription_item: DeletedSubscriptionItemNode,
  deleted_tax_id: DeletedTaxIdNode,
  deleted_terminal_configuration: DeletedTerminalConfigurationNode,
  deleted_terminal_location: DeletedTerminalLocationNode,
  deleted_terminal_reader: DeletedTerminalReaderNode,
  deleted_test_helpers_test_clock: DeletedTestHelpersTestClockNode,
  deleted_webhook_endpoint: DeletedWebhookEndpointNode,
  discount: DiscountNode,
  dispute: DisputeNode,
  ephemeral_key: EphemeralKeyNode,
  event: EventNode,
  exchange_rate: ExchangeRateNode,
  external_account: ExternalAccountNode,
  fee_refund: FeeRefundNode,
  file: FileNode,
  file_link: FileLinkNode,
  financial_connections_account: FinancialConnectionsAccountNode,
  financial_connections_account_owner: FinancialConnectionsAccountOwnerNode,
  financial_connections_session: FinancialConnectionsSessionNode,
  funding_instructions: FundingInstructionsNode,
  identity_verification_report: IdentityVerificationReportNode,
  identity_verification_session: IdentityVerificationSessionNode,
  invoice: InvoiceNode,
  invoiceitem: InvoiceitemNode,
  issuing_authorization: IssuingAuthorizationNode,
  issuing_card: IssuingCardNode,
  issuing_cardholder: IssuingCardholderNode,
  issuing_dispute: IssuingDisputeNode,
  issuing_settlement: IssuingSettlementNode,
  issuing_transaction: IssuingTransactionNode,
  item: ItemNode,
  line_item: LineItemNode,
  login_link: LoginLinkNode,
  mandate: MandateNode,
  payment_intent: PaymentIntentNode,
  payment_link: PaymentLinkNode,
  payment_method: PaymentMethodNode,
  payment_source: PaymentSourceNode,
  payout: PayoutNode,
  person: PersonNode,
  plan: PlanNode,
  price: PriceNode,
  product: ProductNode,
  promotion_code: PromotionCodeNode,
  quote: QuoteNode,
  radar_early_fraud_warning: RadarEarlyFraudWarningNode,
  radar_value_list: RadarValueListNode,
  radar_value_list_item: RadarValueListItemNode,
  refund: RefundNode,
  reporting_report_run: ReportingReportRunNode,
  reporting_report_type: ReportingReportTypeNode,
  review: ReviewNode,
  scheduled_query_run: ScheduledQueryRunNode,
  setup_attempt: SetupAttemptNode,
  setup_intent: SetupIntentNode,
  shipping_rate: ShippingRateNode,
  source: SourceNode,
  source_mandate_notification: SourceMandateNotificationNode,
  source_transaction: SourceTransactionNode,
  subscription: SubscriptionNode,
  subscription_item: SubscriptionItemNode,
  subscription_schedule: SubscriptionScheduleNode,
  tax_code: TaxCodeNode,
  tax_id: TaxIdNode,
  tax_rate: TaxRateNode,
  terminal_configuration: TerminalConfigurationNode,
  terminal_connection_token: TerminalConnectionTokenNode,
  terminal_location: TerminalLocationNode,
  terminal_reader: TerminalReaderNode,
  test_helpers_test_clock: TestHelpersTestClockNode,
  token: TokenNode,
  topup: TopupNode,
  transfer: TransferNode,
  transfer_reversal: TransferReversalNode,
  treasury_credit_reversal: TreasuryCreditReversalNode,
  treasury_debit_reversal: TreasuryDebitReversalNode,
  treasury_financial_account: TreasuryFinancialAccountNode,
  treasury_financial_account_features: TreasuryFinancialAccountFeaturesNode,
  treasury_inbound_transfer: TreasuryInboundTransferNode,
  treasury_outbound_payment: TreasuryOutboundPaymentNode,
  treasury_outbound_transfer: TreasuryOutboundTransferNode,
  treasury_received_credit: TreasuryReceivedCreditNode,
  treasury_received_debit: TreasuryReceivedDebitNode,
  treasury_transaction: TreasuryTransactionNode,
  treasury_transaction_entry: TreasuryTransactionEntryNode,
  webhook_endpoint: WebhookEndpointNode,
  account_notice: AccountNoticeNode,
  account_session: AccountSessionNode,
  application: ApplicationNode,
  balance_settings: BalanceSettingsNode,
  billing_alert: BillingAlertNode,
  billing_alert_triggered: BillingAlertTriggeredNode,
  billing_credit_balance_summary: BillingCreditBalanceSummaryNode,
  billing_credit_balance_transaction: BillingCreditBalanceTransactionNode,
  billing_credit_grant: BillingCreditGrantNode,
  billing_meter: BillingMeterNode,
  billing_meter_event: BillingMeterEventNode,
  billing_meter_event_adjustment: BillingMeterEventAdjustmentNode,
  billing_meter_event_summary: BillingMeterEventSummaryNode,
  capital_financing_offer: CapitalFinancingOfferNode,
  capital_financing_summary: CapitalFinancingSummaryNode,
  capital_financing_transaction: CapitalFinancingTransactionNode,
  climate_order: ClimateOrderNode,
  climate_product: ClimateProductNode,
  climate_supplier: ClimateSupplierNode,
  confirmation_token: ConfirmationTokenNode,
  customer_session: CustomerSessionNode,
  deleted_application: DeletedApplicationNode,
  deleted_bank_account: DeletedBankAccountNode,
  deleted_card: DeletedCardNode,
  deleted_price: DeletedPriceNode,
  deleted_product_feature: DeletedProductFeatureNode,
  entitlements_active_entitlement: EntitlementsActiveEntitlementNode,
  entitlements_active_entitlement_summary: EntitlementsActiveEntitlementSummaryNode,
  entitlements_feature: EntitlementsFeatureNode,
  financial_connections_account_inferred_balance: FinancialConnectionsAccountInferredBalanceNode,
  financial_connections_account_ownership: FinancialConnectionsAccountOwnershipNode,
  financial_connections_institution: FinancialConnectionsInstitutionNode,
  financial_connections_transaction: FinancialConnectionsTransactionNode,
  forwarding_request: ForwardingRequestNode,
  fx_quote: FxQuoteNode,
  invoice_payment: InvoicePaymentNode,
  invoice_rendering_template: InvoiceRenderingTemplateNode,
  issuing_credit_underwriting_record: IssuingCreditUnderwritingRecordNode,
  issuing_dispute_settlement_detail: IssuingDisputeSettlementDetailNode,
  issuing_fraud_liability_debit: IssuingFraudLiabilityDebitNode,
  issuing_personalization_design: IssuingPersonalizationDesignNode,
  issuing_physical_bundle: IssuingPhysicalBundleNode,
  issuing_token: IssuingTokenNode,
  margin: MarginNode,
  order: OrderNode,
  payment_attempt_record: PaymentAttemptRecordNode,
  payment_intent_amount_details_line_item: PaymentIntentAmountDetailsLineItemNode,
  payment_method_configuration: PaymentMethodConfigurationNode,
  payment_method_domain: PaymentMethodDomainNode,
  payment_record: PaymentRecordNode,
  privacy_redaction_job: PrivacyRedactionJobNode,
  privacy_redaction_job_validation_error: PrivacyRedactionJobValidationErrorNode,
  product_feature: ProductFeatureNode,
  quote_line: QuoteLineNode,
  quote_preview_invoice: QuotePreviewInvoiceNode,
  quote_preview_subscription_schedule: QuotePreviewSubscriptionScheduleNode,
  tax_association: TaxAssociationNode,
  tax_calculation: TaxCalculationNode,
  tax_calculation_line_item: TaxCalculationLineItemNode,
  tax_form: TaxFormNode,
  tax_registration: TaxRegistrationNode,
  tax_settings: TaxSettingsNode,
  tax_transaction: TaxTransactionNode,
  tax_transaction_line_item: TaxTransactionLineItemNode,
  terminal_reader_collected_data: TerminalReaderCollectedDataNode,
  terminal_onboarding_link: TerminalOnboardingLinkNode,
  billing_analytics_meter_usage: BillingAnalyticsMeterUsageNode,
  billing_analytics_meter_usage_row: BillingAnalyticsMeterUsageRowNode,
  payment_method_balance: PaymentMethodBalanceNode,
  delegated_checkout_requested_session: DelegatedCheckoutRequestedSessionNode,
  identity_blocklist_entry: IdentityBlocklistEntryNode,
  transit_balance: TransitBalanceNode,
  issuing_program: IssuingProgramNode,
  balance_transfer: BalanceTransferNode,
  radar_account_evaluation: RadarAccountEvaluationNode,
  product_catalog_trial_offer: ProductCatalogTrialOfferNode,
};

const edgeTypes: EdgeTypes = {};

// --- AI & CONFIGURATION ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
const AI_MODEL = "gemini-3-flash-preview";

// --- TYPES ---
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  target: string;
  timestamp: Date;
  user: string;
  status: 'success' | 'warning' | 'error';
}

// --- HELPER FUNCTIONS ---
const getNodesAndEdges = (
  data: { [key: string]: StripeResource },
  resourceType: ResourceType | null,
  nodeWidth: number,
  nodeHeight: number,
  selectedNodeId?: string | null,
  highlightedNodeId?: string | null,
  expandedNodes?: string[],
): { nodes: any[]; edges: any[] } => {
  const nodes: any[] = [];
  const edges: any[] = [];

  if (!data) {
    return { nodes, edges };
  }

  let yOffset = 0;
  let xOffset = 0;
  const COLUMN_WIDTH = 350;
  const ROW_HEIGHT = 250;

  Object.values(data).forEach((resource, index) => {
    const nodeId = resource.id;
    const type = resource.object; 
    
    nodes.push({
      id: nodeId,
      type: type, 
      position: { x: xOffset, y: yOffset },
      data: { label: resource.id, ...resource },
      style: { 
        border: nodeId === selectedNodeId ? '2px solid #00e5ff' : '1px solid #333',
        boxShadow: nodeId === selectedNodeId ? '0 0 20px rgba(0, 229, 255, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }
    });

    if (resource.customer && typeof resource.customer === 'string') {
        edges.push({
            id: `${nodeId}-${resource.customer}`,
            source: resource.customer, 
            target: nodeId, 
            type: 'default',
            animated: true,
            style: { stroke: '#555' }
        });
    }
    
    if (resource.charge && typeof resource.charge === 'string') {
         edges.push({
            id: `${nodeId}-${resource.charge}`,
            source: nodeId,
            target: resource.charge,
            type: 'default',
            animated: true,
            style: { stroke: '#00e5ff' }
        });
    }

    xOffset += COLUMN_WIDTH;
    if ((index + 1) % 4 === 0) {
        xOffset = 0;
        yOffset += ROW_HEIGHT;
    }
  });

  return { nodes, edges };
};

// --- COMPONENTS ---

const QuantumChatWidget: React.FC<{
  onAction: (action: string, payload?: any) => void;
  auditLog: (action: string, target: string) => void;
}> = ({ onAction, auditLog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Quantum Financial AI Core initialized. Ready for instructions.', timestamp: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    auditLog('AI_QUERY', 'Quantum Core');

    try {
      let responseText = "I'm sorry, I cannot process that request right now.";
      
      if (GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const model = ai.getGenerativeModel({ model: AI_MODEL });
        
        const prompt = `
          You are the AI Core for "Quantum Financial", a high-end, elite business banking demo.
          The user is interacting with a Resource Graph of financial data.
          
          User Query: "${userMsg.text}"
          
          If the user asks to "simulate", "test", "add traffic", or "generate", respond with a confirmation that you are initiating the simulation protocol.
          If the user asks about security, respond with a high-level security audit summary.
          Keep responses professional, elite, and concise. Use terms like "ledger", "liquidity", "encryption", "sovereign".
          Do NOT mention "Citibank". Use "Quantum Financial" or "The Demo Bank".
        `;

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      } else {
        // Fallback simulation if no key
        await new Promise(r => setTimeout(r, 1500));
        if (userMsg.text.toLowerCase().includes('simulate') || userMsg.text.toLowerCase().includes('traffic')) {
          responseText = "Initiating high-frequency transaction simulation. Visualizing data flow across the ledger.";
          onAction('SIMULATE_TRAFFIC');
        } else if (userMsg.text.toLowerCase().includes('audit') || userMsg.text.toLowerCase().includes('security')) {
          responseText = "Security protocols active. Zero-trust architecture verified. No anomalies detected in the last 24 hours.";
        } else {
          responseText = "Command received. Processing through Quantum Financial neural engine. Please specify a directive for the ledger.";
        }
      }

      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'system', text: "Connection to Neural Core interrupted.", timestamp: new Date(), isError: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Box sx={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {isOpen && (
        <Paper 
          elevation={24}
          sx={{ 
            width: 350, 
            height: 500, 
            mb: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'rgba(10, 25, 41, 0.95)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'rgba(0, 229, 255, 0.1)', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy sx={{ color: '#00e5ff' }} />
              <Typography variant="subtitle1" sx={{ color: '#00e5ff', fontWeight: 'bold', fontFamily: 'monospace' }}>
                QUANTUM INTELLIGENCE
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map(msg => (
              <Box 
                key={msg.id} 
                sx={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  bgcolor: msg.sender === 'user' ? 'rgba(0, 229, 255, 0.2)' : msg.sender === 'system' ? 'rgba(255, 50, 50, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: msg.sender === 'user' ? '1px solid rgba(0, 229, 255, 0.4)' : msg.sender === 'system' ? '1px solid rgba(255, 50, 50, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 1.5,
                  position: 'relative'
                }}
              >
                <Typography variant="body2" sx={{ color: msg.sender === 'system' ? '#ff5252' : '#fff', fontFamily: msg.sender === 'ai' ? 'monospace' : 'inherit' }}>
                  {msg.text}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem', textAlign: 'right' }}>
                  {msg.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ alignSelf: 'flex-start', p: 1 }}>
                <LinearProgress sx={{ width: 40, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00e5ff' } }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Enter command..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  color: '#fff', 
                  bgcolor: 'rgba(0,0,0,0.3)',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(0, 229, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#00e5ff' }
                } 
              }}
            />
            <IconButton onClick={handleSend} sx={{ bgcolor: 'rgba(0, 229, 255, 0.2)', color: '#00e5ff', '&:hover': { bgcolor: 'rgba(0, 229, 255, 0.4)' } }}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      )}
      <Button
        variant="contained"
        onClick={() => setIsOpen(!isOpen)}
        startIcon={<SmartToy />}
        sx={{ 
          borderRadius: 20, 
          bgcolor: isOpen ? 'rgba(0, 229, 255, 0.8)' : 'rgba(10, 25, 41, 0.9)', 
          color: isOpen ? '#000' : '#00e5ff',
          border: '1px solid #00e5ff',
          boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
          px: 3,
          py: 1.5,
          fontWeight: 'bold',
          '&:hover': { bgcolor: '#00e5ff', color: '#000', boxShadow: '0 0 25px rgba(0, 229, 255, 0.6)' }
        }}
      >
        {isOpen ? 'CLOSE TERMINAL' : 'AI ASSISTANT'}
      </Button>
    </Box>
  );
};

const AuditLogPanel: React.FC<{ logs: AuditLog[], open: boolean, onClose: () => void }> = ({ logs, open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, bgcolor: '#050b14', borderLeft: '1px solid #333', color: '#fff' }
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Security sx={{ color: '#4caf50' }} />
        <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
          SECURITY AUDIT LOG
        </Typography>
      </Box>
      <List sx={{ flex: 1, overflowY: 'auto' }}>
        {logs.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center', color: '#666' }}>
            <Typography>No audit records found in current session.</Typography>
          </Box>
        )}
        {logs.map((log) => (
          <React.Fragment key={log.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                      {log.action}
                    </Typography>
                    <Chip 
                      label={log.status.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.6rem', 
                        bgcolor: log.status === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                        color: log.status === 'success' ? '#4caf50' : '#ff9800'
                      }} 
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" sx={{ color: '#aaa', display: 'block', mt: 0.5 }}>
                      Target: {log.target}
                    </Typography>
                    <Typography component="span" variant="caption" sx={{ color: '#666', fontFamily: 'monospace' }}>
                      {log.timestamp.toLocaleTimeString()} | User: {log.user}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider component="li" sx={{ borderColor: '#222' }} />
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

const ResourceGraphView = () => {
    const { data, loading, error } = useStripeData();
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [showAddResource, setShowAddResource] = useState(false);
    const [newResourceName, setNewResourceName] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // --- AUDIT FUNCTION ---
    const logAction = useCallback((action: string, target: string, status: 'success' | 'warning' | 'error' = 'success') => {
      const newLog: AuditLog = {
        id: Math.random().toString(36).substr(2, 9),
        action,
        target,
        timestamp: new Date(),
        user: 'DEMO_USER_ADMIN',
        status
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    // --- INITIALIZATION ---
    useEffect(() => {
        if(data) {
            const { nodes: n, edges: e } = getNodesAndEdges(data, null, 200, 100);
            setNodes(n);
            setEdges(e);
            logAction('DATA_LOAD', 'Stripe Resource Graph', 'success');
        }
    }, [data, logAction]);

    // --- HANDLERS ---
    const onNodesChange = useCallback(
      (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [],
    );
    const onEdgesChange = useCallback(
      (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [],
    );
    const onConnect = useCallback(
      (connection: Connection) => {
        setEdges((eds) => addEdge(connection, eds));
        logAction('CONNECT_NODES', `${connection.source} -> ${connection.target}`);
      },
      [logAction],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      logAction('INSPECT_NODE', node.id);
    }, [logAction]);

    const handleSimulateTraffic = () => {
      setIsSimulating(true);
      logAction('SIMULATION_START', 'Global Ledger Traffic');
      setSnackbarMessage('Initiating High-Frequency Transaction Simulation...');
      setSnackbarOpen(true);

      // Simulate "Traffic" by animating edges or adding temporary nodes
      const interval = setInterval(() => {
        setEdges((eds) => eds.map(e => ({
          ...e,
          animated: !e.animated,
          style: { ...e.style, stroke: Math.random() > 0.5 ? '#00e5ff' : '#ff00e5', strokeWidth: Math.random() * 3 + 1 }
        })));
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        setIsSimulating(false);
        logAction('SIMULATION_END', 'Global Ledger Traffic');
        setSnackbarMessage('Simulation Complete. Ledger Integrity Verified.');
        setSnackbarOpen(true);
        // Reset styles
        setEdges((eds) => eds.map(e => ({
          ...e,
          animated: false,
          style: { stroke: '#555' }
        })));
      }, 5000);
    };

    const handleAddResource = () => {
      if (!newResourceName) return;
      const newNode: Node = {
        id: `custom-${Date.now()}`,
        type: 'customer', // Defaulting to customer for demo
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        data: { label: newResourceName, id: newResourceName, object: 'customer' },
        style: { border: '1px solid #00e5ff', background: 'rgba(0, 229, 255, 0.1)' }
      };
      setNodes((nds) => [...nds, newNode]);
      logAction('CREATE_RESOURCE', newResourceName);
      setShowAddResource(false);
      setNewResourceName('');
      setSnackbarMessage(`Resource "${newResourceName}" provisioned successfully.`);
      setSnackbarOpen(true);
    };

    const handleAIAction = (action: string, payload?: any) => {
      if (action === 'SIMULATE_TRAFFIC') {
        handleSimulateTraffic();
      }
    };

    if(loading) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 800, bgcolor: '#000', color: '#00e5ff' }}>
        <CircularProgress color="inherit" size={60} thickness={2} />
        <Typography sx={{ mt: 2, fontFamily: 'monospace', letterSpacing: 2 }}>INITIALIZING QUANTUM LEDGER...</Typography>
      </Box>
    );
    
    if(error) return <div className="text-red-500 p-4">Error: {error}</div>;

    return (
        <div style={{ height: '850px', border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#050b14' }}>
            <ReactFlowProvider>
                <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
                  <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onNodeClick={onNodeClick}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
                      fitView
                      attributionPosition="bottom-left"
                      minZoom={0.1}
                  >
                      <Background color="#333" gap={20} variant={BackgroundVariant.Dots} />
                      <Controls style={{ button: { backgroundColor: '#111', color: '#fff', border: '1px solid #333' } }} />
                      <MiniMap style={{ backgroundColor: '#111', border: '1px solid #333' }} nodeColor={() => '#00e5ff'} />
                      
                      <Panel position="top-left">
                        <Paper sx={{ p: 2, bgcolor: 'rgba(10, 25, 41, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                          <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Speed fontSize="small" /> QUANTUM FINANCIAL
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#aaa' }}>
                            Resource Graph Visualization v4.2.0
                          </Typography>
                          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Simulate Traffic">
                              <IconButton size="small" onClick={handleSimulateTraffic} sx={{ color: isSimulating ? '#00e5ff' : '#fff', bgcolor: isSimulating ? 'rgba(0,229,255,0.2)' : 'transparent' }}>
                                <Psychology />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Security Audit">
                              <IconButton size="small" onClick={() => setIsAuditOpen(true)} sx={{ color: '#4caf50' }}>
                                <Security />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Provision Resource">
                              <IconButton size="small" onClick={() => setShowAddResource(true)} sx={{ color: '#ff9800' }}>
                                <AddCircleOutline />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Paper>
                      </Panel>

                      {selectedNode && (
                        <Panel position="top-right">
                          <Card sx={{ width: 300, bgcolor: 'rgba(10, 25, 41, 0.9)', color: '#fff', border: '1px solid #00e5ff', backdropFilter: 'blur(10px)' }}>
                            <CardHeader 
                              title={selectedNode.data.label}
                              subheader={<Typography variant="caption" sx={{ color: '#aaa' }}>ID: {selectedNode.id}</Typography>}
                              action={
                                <IconButton size="small" onClick={() => setSelectedNode(null)} sx={{ color: '#fff' }}>
                                  <Close />
                                </IconButton>
                              }
                              sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <CardContent>
                              <Typography variant="body2" sx={{ mb: 2, color: '#ccc' }}>
                                <strong style={{ color: '#00e5ff' }}>Type:</strong> {selectedNode.type}
                              </Typography>
                              <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.7rem', color: '#0f0' }}>
                                {JSON.stringify(selectedNode.data, null, 2).slice(0, 150)}...
                              </Box>
                              <Button 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                sx={{ mt: 2, borderColor: '#00e5ff', color: '#00e5ff' }}
                                onClick={() => logAction('EXPORT_DATA', selectedNode.id)}
                              >
                                EXPORT DATA
                              </Button>
                            </CardContent>
                          </Card>
                        </Panel>
                      )}
                  </ReactFlow>
                </div>
            </ReactFlowProvider>

            <QuantumChatWidget onAction={handleAIAction} auditLog={logAction} />
            <AuditLogPanel logs={auditLogs} open={isAuditOpen} onClose={() => setIsAuditOpen(false)} />

            {/* Add Resource Dialog */}
            <Dialog open={showAddResource} onClose={() => setShowAddResource(false)} PaperProps={{ sx: { bgcolor: '#0a1929', color: '#fff', border: '1px solid #333' } }}>
              <DialogTitle sx={{ borderBottom: '1px solid #333', color: '#00e5ff' }}>Provision New Resource</DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 2, color: '#aaa' }}>
                  Enter the identifier for the new resource. This action will be logged in the immutable audit trail.
                </Typography>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Resource Identifier"
                  fullWidth
                  variant="outlined"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#555' }, '&:hover fieldset': { borderColor: '#00e5ff' } },
                    '& .MuiInputLabel-root': { color: '#aaa' }
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ borderTop: '1px solid #333', p: 2 }}>
                <Button onClick={() => setShowAddResource(false)} sx={{ color: '#aaa' }}>Cancel</Button>
                <Button onClick={handleAddResource} variant="contained" sx={{ bgcolor: '#00e5ff', color: '#000', fontWeight: 'bold', '&:hover': { bgcolor: '#00b8cc' } }}>
                  Provision
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
              <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', bgcolor: '#00e5ff', color: '#000', fontWeight: 'bold' }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
        </div>
    );
}

export default ResourceGraphView;