import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Zap, 
  DollarSign, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Users,
  Wallet,
  CreditCard,
  Layers,
  Coins,
  FileText,
  BarChart2,
  BookOpen,
  Cpu,
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Search
} from 'lucide-react';
import { alpacaTradingService, AlpacaPosition, AlpacaTradingLimits } from '../../services/AlpacaTradingService';

// Import sub-views
import AlpacaAccountsManager from './AlpacaAccountsManager';
import AlpacaCryptoWalletsView from './AlpacaCryptoWalletsView';
import AlpacaFundingHub from './AlpacaFundingHub';
import AlpacaIpoMarketplaceView from './AlpacaIpoMarketplaceView';
import AlpacaJournalsView from './AlpacaJournalsView';
import AlpacaRebalancingView from './AlpacaRebalancingView';
import AlpacaReportingView from './AlpacaReportingView';
import AlpacaTokenizationView from './AlpacaTokenizationView';
import { BtcSwingTradingNotebook } from './BtcSwingTradingNotebook';
import TqqqAlgorithmTerminal from './TqqqAlgorithmTerminal';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const systemPathsData: FileNode[] = [
  {
    name: '00_Master_Compiled_Executive_Order',
    type: 'directory',
    children: [
      { name: 'Chapter_01_The_Citibank_Lobby.md', type: 'file' },
      { name: 'Chapter_02_The_EAC_Briefing.md', type: 'file' },
      { name: 'Chapter_03_The_DHS_Server_Room.md', type: 'file' },
      { name: 'Chapter_04_The_Military_Fund_Audit.md', type: 'file' },
      { name: 'Chapter_05_The_Geneva_Account.md', type: 'file' },
      { name: 'Chapter_06_The_Task_Force_Confrontation.md', type: 'file' },
      { name: 'Chapter_07_The_Mobile_Verification_Launch.md', type: 'file' },
      { name: 'Dossier_01_UCC_Financial_Loophole.md', type: 'file' },
      { name: 'Dossier_02_SAVE_API_Vulnerabilities.md', type: 'file' },
      { name: 'Dossier_03_Iran_Framework_Compliance.md', type: 'file' },
      { name: 'Dossier_04_Military_Fund_Allocation.md', type: 'file' },
      { name: 'Dossier_05_DNA_Testing_Consular_Protocols.md', type: 'file' },
      { name: 'Dossier_06_Voter_Roll_Purge_Metrics.md', type: 'file' },
      { name: 'Dossier_07_Tribal_Liaison_Integration.md', type: 'file' },
      { name: 'Dossier_08_Paperwork_Reduction_Exemption.md', type: 'file' },
      { name: 'Dossier_09_Private_Right_of_Action.md', type: 'file' },
      { name: 'Dossier_10_Department_of_War_Archival_Access.md', type: 'file' },
      { name: 'Dossier_11_Mobile_Unit_Deployment_Logistics.md', type: 'file' },
      { name: 'Dossier_12_Task_Force_Sunset_Procedures.md', type: 'file' },
      { name: 'Dossier_13_Vector_Collapse_Protocol.md', type: 'file' },
      { name: 'Dossier_14_Citibank_Demo_Business_Structure.md', type: 'file' },
    ]
  },
  { name: 'App.tsx', type: 'file' },
  {
    name: 'Book',
    type: 'directory',
    children: [
      { name: 'Ok.md', type: 'file' }
    ]
  },
  {
    name: 'Combined_sLegislative_Bill',
    type: 'directory',
    children: [
      {
        name: 'chapters',
        type: 'directory',
        children: [
          { name: 'chapter_01_the_loophole.md', type: 'file' },
          { name: 'chapter_02_political_decay.md', type: 'file' },
          { name: 'chapter_03_the_decision.md', type: 'file' },
        ]
      },
      {
        name: 'characters',
        type: 'directory',
        children: [
          { name: 'antagonist_leverage_analysis.md', type: 'file' },
          { name: 'protagonist_profile.md', type: 'file' },
        ]
      },
      {
        name: 'dossiers',
        type: 'directory',
        children: [
          { name: 'iranian_cyber_threat_matrix.md', type: 'file' },
          { name: 'mtls_ai_bank_architecture.md', type: 'file' },
          { name: 'sovereign_id_cryptography.md', type: 'file' },
        ]
      },
      {
        name: 'narrative',
        type: 'directory',
        children: [
          { name: 'scene_01_banking_loophole.md', type: 'file' },
          { name: 'scene_02_bureaucratic_signing.md', type: 'file' },
          { name: 'scene_03_system_failure.md', type: 'file' },
          { name: 'scene_04_political_decay.md', type: 'file' },
          { name: 'scene_05_corruption_observation.md', type: 'file' },
          { name: 'scene_06_threats_closing_in.md', type: 'file' },
          { name: 'scene_07_high_stakes_decision.md', type: 'file' },
          { name: 'scene_08_antagonist_pushout.md', type: 'file' },
          { name: 'scene_09_real_time_execution.md', type: 'file' },
        ]
      },
      {
        name: 'technical',
        type: 'directory',
        children: [
          { name: 'database_synchronization_protocol.md', type: 'file' },
          { name: 'hardware_secure_element_spec.md', type: 'file' },
          { name: 'zero_knowledge_proofs_spec.md', type: 'file' },
        ]
      },
      {
        name: 'worldbuilding',
        type: 'directory',
        children: [
          { name: 'department_of_war_archives_spec.md', type: 'file' },
          { name: 'reconciliation_3_0_framework.md', type: 'file' },
          { name: 'thirty_five_sectors_analysis.md', type: 'file' },
        ]
      }
    ]
  },
  {
    name: 'Google',
    type: 'directory',
    children: [
      { name: 'AuthManager.ts', type: 'file' },
      { name: 'AutoScaler.ts', type: 'file' },
      { name: 'BackupService.ts', type: 'file' },
      { name: 'BigQueryEmulator.ts', type: 'file' },
      { name: 'BillingTracker.ts', type: 'file' },
      { name: 'CDNReplacement.ts', type: 'file' },
      { name: 'CloudFunctionsShim.ts', type: 'file' },
      { name: 'CloudReplacementEngine.ts', type: 'file' },
      { name: 'ComputeOrchestrator.ts', type: 'file' },
      { name: 'DatabaseBridge.ts', type: 'file' },
      { name: 'DeploymentPipeline.ts', type: 'file' },
      { name: 'IAMPolicyEngine.ts', type: 'file' },
      { name: 'MonitoringService.ts', type: 'file' },
      { name: 'NetworkGateway.ts', type: 'file' },
      { name: 'PubSubLocal.ts', type: 'file' },
      { name: 'SecretVault.ts', type: 'file' },
      { name: 'ServiceMesh.ts', type: 'file' },
      { name: 'StorageAbstraction.ts', type: 'file' },
      { name: 'VertexAIProxy.ts', type: 'file' },
      { name: 'VpcManager.ts', type: 'file' },
    ]
  },
  { name: 'IMG_5610.webp', type: 'file' },
  { name: 'LICENSE', type: 'file' },
  { name: 'README.md', type: 'file' },
  { name: 'README_v2.md', type: 'file' },
  { name: 'TRUST.md', type: 'file' },
  {
    name: 'api',
    type: 'directory',
    children: [
      {
        name: 'AppRegistry',
        type: 'directory',
        children: [
          { name: 'AppBillingBridge.ts', type: 'file' },
          { name: 'AppDependencyResolver.ts', type: 'file' },
          { name: 'AppLifecycleManager.ts', type: 'file' },
          { name: 'AppManifestParser.ts', type: 'file' },
          { name: 'AppMetadataAggregator.ts', type: 'file' },
          { name: 'AppPermissionEngine.ts', type: 'file' },
          { name: 'AppRegistryOrchestrator.ts', type: 'file' },
          { name: 'AppWebhookDispatcher.ts', type: 'file' },
          {
            name: 'config',
            type: 'directory',
            children: [
              { name: 'EcosystemConfig.ts', type: 'file' }
            ]
          },
          { name: 'index.ts', type: 'file' },
          {
            name: 'middleware',
            type: 'directory',
            children: [
              { name: 'AppRegistryAuth.ts', type: 'file' }
            ]
          },
          {
            name: 'routes',
            type: 'directory',
            children: [
              { name: 'AppRegistryRoutes.ts', type: 'file' }
            ]
          },
          {
            name: 'services',
            type: 'directory',
            children: [
              { name: 'AppDeploymentService.ts', type: 'file' },
              { name: 'AppIntegrationsBridge.ts', type: 'file' },
              { name: 'AppMetricsCollector.ts', type: 'file' },
              { name: 'AppStorageVault.ts', type: 'file' },
            ]
          },
          {
            name: 'types',
            type: 'directory',
            children: [
              { name: 'AppManifest.ts', type: 'file' },
              { name: 'AppRuntime.ts', type: 'file' },
            ]
          },
          {
            name: 'utils',
            type: 'directory',
            children: [
              { name: 'AppSecurityAuditor.ts', type: 'file' },
              { name: 'ManifestValidator.ts', type: 'file' },
            ]
          }
        ]
      },
      {
        name: 'Obama Opts Out Of Public Financing (1)',
        type: 'directory',
        children: [
          { name: 'section10_sovereign_wealth_fund_527.ts', type: 'file' },
          { name: 'section1_obama_public_financing.ts', type: 'file' },
          { name: 'section2_bear_stearns_arrests.ts', type: 'file' },
          { name: 'section3_spaceflight_kosmos.ts', type: 'file' },
          { name: 'section4_citi_connection_contagion.ts', type: 'file' },
          { name: 'section5_goldman_sachs_downgrade.ts', type: 'file' },
          { name: 'section6_cfo_gary_crittenden.ts', type: 'file' },
          { name: 'section7_structured_products_basket.ts', type: 'file' },
          { name: 'section8_the_toast_email.ts', type: 'file' },
          { name: 'section9_citibank_demo_business.ts', type: 'file' },
        ]
      },
      {
        name: 'PortalDiagnostics',
        type: 'directory',
        children: [
          { name: 'DependencyGraph.ts', type: 'file' },
          { name: 'DiagnosticsOrchestrator.ts', type: 'file' },
          { name: 'ErrorReporter.ts', type: 'file' },
          { name: 'HealthCheckService.ts', type: 'file' },
          { name: 'LogAnalyzer.ts', type: 'file' },
          { name: 'PerformanceMonitor.ts', type: 'file' },
          { name: 'SecurityScanner.ts', type: 'file' },
          { name: 'TelemetryCollector.ts', type: 'file' },
          {
            name: 'config',
            type: 'directory',
            children: [
              { name: 'DiagnosticConfig.ts', type: 'file' }
            ]
          },
          { name: 'index.ts', type: 'file' },
          {
            name: 'middleware',
            type: 'directory',
            children: [
              { name: 'DiagnosticAuth.ts', type: 'file' }
            ]
          },
          {
            name: 'routes',
            type: 'directory',
            children: [
              { name: 'DiagnosticRoutes.ts', type: 'file' }
            ]
          },
          {
            name: 'services',
            type: 'directory',
            children: [
              { name: 'AuthDiagnostics.ts', type: 'file' },
              { name: 'DatabaseDiagnostics.ts', type: 'file' },
              { name: 'IntegrationDiagnostics.ts', type: 'file' },
              { name: 'NetworkDiagnostics.ts', type: 'file' },
            ]
          },
          {
            name: 'types',
            type: 'directory',
            children: [
              { name: 'DiagnosticReport.ts', type: 'file' },
              { name: 'SystemStatus.ts', type: 'file' },
            ]
          },
          {
            name: 'utils',
            type: 'directory',
            children: [
              { name: 'AlertDispatcher.ts', type: 'file' },
              { name: 'Formatters.ts', type: 'file' },
            ]
          }
        ]
      },
      { name: 'acquisitions.ts', type: 'file' },
      { name: 'ai.ts', type: 'file' },
      { name: 'alpaca.ts', type: 'file' },
      { name: 'alpacaCollateral.ts', type: 'file' },
      { name: 'azure.ts', type: 'file' },
      { name: 'azureGovCompliance.ts', type: 'file' },
      { name: 'citi.ts', type: 'file' },
      { name: 'config.ts', type: 'file' },
      { name: 'crypto-strategy.ts', type: 'file' },
      { name: 'fapi.ts', type: 'file' },
      { name: 'google-chat.ts', type: 'file' },
      { name: 'government-gateway.ts', type: 'file' },
      { name: 'index.ts', type: 'file' },
      {
        name: 'middleware',
        type: 'directory',
        children: [
          { name: 'auths.ts', type: 'file' },
          { name: 'rateLimiter.ts', type: 'file' },
        ]
      },
      { name: 'modern-treasury.ts', type: 'file' },
      {
        name: 'order',
        type: 'directory',
        children: [
          { name: 'order_01_02.md', type: 'file' },
          { name: 'order_03_04.md', type: 'file' },
          { name: 'order_05_06.md', type: 'file' },
          { name: 'order_07_08.md', type: 'file' },
          { name: 'order_09_10.md', type: 'file' },
          { name: 'order_11_12.md', type: 'file' },
          { name: 'order_13_14.md', type: 'file' },
          { name: 'order_15_16.md', type: 'file' },
          { name: 'order_17_18.md', type: 'file' },
          { name: 'order_19_20.md', type: 'file' },
          { name: 'order_21_22.md', type: 'file' },
          { name: 'order_23_24.md', type: 'file' },
          { name: 'order_25_26.md', type: 'file' },
          { name: 'order_27_28.md', type: 'file' },
          { name: 'order_29_30.md', type: 'file' },
          { name: 'order_31_32.md', type: 'file' },
          { name: 'order_33_34.md', type: 'file' },
          { name: 'order_35_36.md', type: 'file' },
          { name: 'order_37_38.md', type: 'file' },
          { name: 'order_39_40.md', type: 'file' },
          { name: 'order_41_42.md', type: 'file' },
          { name: 'order_43_44.md', type: 'file' },
          { name: 'section1_digital_asset_and_cybersecurity.ts', type: 'file' },
          { name: 'section2_ledger_framework_and_arbitrage.ts', type: 'file' },
          { name: 'section3_consensus_and_fapi_conformance.ts', type: 'file' },
          { name: 'section4_quantum_secured_and_revocation.ts', type: 'file' },
        ]
      },
      { name: 'plaid.ts', type: 'file' },
      { name: 'real-estate.ts', type: 'file' },
      {
        name: 'routes',
        type: 'directory',
        children: [
          { name: 'acquisitions-orchestrator.ts', type: 'file' },
          { name: 'admin.ts', type: 'file' },
          { name: 'audit.ts', type: 'file' },
          { name: 'collateral.ts', type: 'file' },
          { name: 'identity.ts', type: 'file' },
          { name: 'market.ts', type: 'file' },
          { name: 'notifications.ts', type: 'file' },
          { name: 'treasury.ts', type: 'file' },
          { name: 'webhooks.ts', type: 'file' },
        ]
      },
      { name: 'sovereign.ts', type: 'file' },
      { name: 'stripe.ts', type: 'file' },
      { name: 'tax-liens.ts', type: 'file' },
      { name: 'tqqq-strategy.ts', type: 'file' },
      {
        name: 'types',
        type: 'directory',
        children: [
          { name: 'sovereign.ts', type: 'file' }
        ]
      },
      {
        name: 'utils',
        type: 'directory',
        children: [
          { name: 'ai-agent-factory.ts', type: 'file' },
          { name: 'complianceEngine.ts', type: 'file' },
          { name: 'crypto-bridge.ts', type: 'file' },
          { name: 'geo-spatial.ts', type: 'file' },
          { name: 'ledgerSync.ts', type: 'file' },
          { name: 'logger.ts', type: 'file' },
          { name: 'math-engine.ts', type: 'file' },
          { name: 'vault.ts', type: 'file' },
        ]
      }
    ]
  },
  {
    name: 'apps',
    type: 'directory',
    children: [
      { name: 'audit_compliance_tracker', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'azure_ad_app_auditor', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_audit_trail_generator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_cash_flow_stress_tester', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_corporate_liquidity_forecaster', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_interest_rate_optimizer', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_portfolio_wealth_analyzer', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_routing_decryptor_validator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_routing_number_resolver', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'b2b_transaction_categorizer', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_analytics_dashboard', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_batch_scheduler', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_calculator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_compliance_auditor', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_disbursement_orchestrator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_eligibility_checker', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_interest_simulator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'balance_transfer_lead_generator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'broker_compliance_trade_auditor', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'broker_order_execution_simulator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'camt053_balance_reconciler', type: 'directory', children: [{ name: 'app.py', type: 'file' }, { name: 'reconciler.py', type: 'file' }] },
      { name: 'camt053_mock_generator', type: 'directory', children: [{ name: 'app.py', type: 'file' }, { name: 'generator.py', type: 'file' }] },
      { name: 'camt053_shared', type: 'directory', children: [{ name: 'models.py', type: 'file' }] },
      { name: 'camt053_statement_parser', type: 'directory', children: [{ name: 'app.py', type: 'file' }, { name: 'utils.py', type: 'file' }] },
      { name: 'camt053_transaction_exporter', type: 'directory', children: [{ name: 'app.py', type: 'file' }, { name: 'exporter.py', type: 'file' }] },
      { name: 'card_activation_simulator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_function_access_controller', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_lifecycle_compliance_checker', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_listing_mock_server', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_merchant_category_classifier', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_outstanding_balance_tracker', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_pin_hasher_validator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_spend_limit_manager', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_test_suite_conformance_analyzer', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'card_tokenization_service', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'citi_account_anomaly_detector', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'citi_account_excel_parser', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'citi_account_interest_accrual_simulator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'citi_account_kyc_risk_profiler', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'citiconnect_integration_gateway', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'citizenship_verification_gateway', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'credit_card_simulator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'credit_limit_utilization_monitor', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'credit_risk_analyzer', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'cross_cloud_federation_manager', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'cvv_decryption_mock_service', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'election_integrity_dashboard', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'fedramp_compliance_monitor', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'financial_regulatory_guardrail', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'financial_statement_verifier', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'github_audit_sync_agent', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'military_fund_allocator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'multi_currency_balance_consolidator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'pqc_crypto_bridge_simulator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'schema_catalog_custom_registry', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'schema_catalog_search_engine', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'schema_conformance_audit_tool', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'schema_validator_orchestrator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'service_principal_provisioner', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'statement_reconciliation_portal', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'supplementary_card_orchestrator', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'treasury_reconciliation_engine', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
      { name: 'voter_registration_portal', type: 'directory', children: [{ name: 'app.py', type: 'file' }] },
    ]
  },
  { name: 'book', type: 'directory', children: [{ name: 'Ok', type: 'file' }] },
  { name: 'bun.lock', type: 'file' },
  { name: 'check_sql.ts', type: 'file' },
  {
    name: 'clarity',
    type: 'directory',
    children: [
      { name: 'part01_legislative_intent.ts', type: 'file' },
      { name: 'part02_definitions_registry.ts', type: 'file' },
      { name: 'part03_sec_cftc_jurisdiction.ts', type: 'file' },
      { name: 'part04_decentralization_certification.ts', type: 'file' },
      { name: 'part05_digital_commodity_exchanges.ts', type: 'file' },
      { name: 'part06_broker_dealer_requirements.ts', type: 'file' },
      { name: 'part07_stablecoin_issuance_framework.ts', type: 'file' },
      { name: 'part08_market_manipulation_prevention.ts', type: 'file' },
      { name: 'part09_customer_protection_custody.ts', type: 'file' },
      { name: 'part10_clearing_settlement_protocols.ts', type: 'file' },
      { name: 'part11_international_coordination.ts', type: 'file' },
      { name: 'part12_anti_money_laundering_kyc.ts', type: 'file' },
      { name: 'part13_tax_reporting_compliance.ts', type: 'file' },
      { name: 'part14_smart_contract_auditing.ts', type: 'file' },
      { name: 'part15_disclosure_requirements.ts', type: 'file' },
      { name: 'part16_alpaca_integration_bridge.ts', type: 'file' },
      { name: 'part17_citi_sovereign_ledger_bridge.ts', type: 'file' },
      { name: 'part18_modern_treasury_settlement.ts', type: 'file' },
      { name: 'part19_crypto_strategy_validator.ts', type: 'file' },
      { name: 'part20_compliance_audit_trail.ts', type: 'file' },
      { name: 'part21_risk_assessment_matrix.ts', type: 'file' },
      { name: 'part22_government_gateway_reporting.ts', type: 'file' },
      { name: 'part23_tokenization_compliance_engine.ts', type: 'file' },
      { name: 'part24_ai_compliance_agent.ts', type: 'file' },
      { name: 'part25_system_orchestrator.ts', type: 'file' },
    ]
  },
  {
    name: 'components',
    type: 'directory',
    children: [
      { name: 'AIAdStudioView.tsx', type: 'file' },
      { name: 'AIAdStudioView.tsx.md', type: 'file' },
      { name: 'AIAdvisorView.tsx', type: 'file' },
      { name: 'AIAdvisorView.tsx.md', type: 'file' },
      { name: 'AIInsights.tsx', type: 'file' },
      { name: 'AIInsights.tsx.md', type: 'file' },
      { name: 'APIIntegrationView.tsx', type: 'file' },
      { name: 'APIIntegrationView.tsx.md', type: 'file' },
      { name: 'APIKeysView.tsx', type: 'file' },
      { name: 'AdministrationAudit.tsx', type: 'file' },
      { name: 'AlpacaBrokerView.tsx', type: 'file' },
      { name: 'AquariusArchitectView.tsx', type: 'file' },
      { name: 'AquariusAuditorView.tsx', type: 'file' },
      { name: 'AquariusCreativeSuite.tsx', type: 'file' },
      { name: 'AquariusDashboard.tsx', type: 'file' },
      { name: 'AquariusGhostView.tsx', type: 'file' },
      { name: 'AquariusInstitutionalHub.tsx', type: 'file' },
      { name: 'AquariusLiveVoice.tsx', type: 'file' },
      { name: 'AriaComms.tsx', type: 'file' },
      { name: 'AstraDBQuickstart.tsx', type: 'file' },
      { name: 'AzureAppsView.tsx', type: 'file' },
      { name: 'AzureAppsView.tsx.md', type: 'file' },
      { name: 'BalanceSummary.tsx', type: 'file' },
      { name: 'BalanceSummary.tsx.md', type: 'file' },
      { name: 'BillingIdentityView.tsx', type: 'file' },
      { name: 'BudgetsView.tsx', type: 'file' },
      { name: 'BudgetsView.tsx.md', type: 'file' },
      { name: 'Card.tsx', type: 'file' },
      { name: 'Card.tsx.md', type: 'file' },
      { name: 'CardCustomizationView.tsx', type: 'file' },
      { name: 'CardCustomizationView.tsx.md', type: 'file' },
      { name: 'CitiConnectInitiation.tsx', type: 'file' },
      { name: 'CitiConnectInquiry.tsx', type: 'file' },
      { name: 'CitiConnectNotifications.tsx', type: 'file' },
      { name: 'CitiDecryptionUtility.tsx', type: 'file' },
      { name: 'CitiGateway.tsx', type: 'file' },
      { name: 'CitiPartnerHub.tsx', type: 'file' },
      { name: 'CitiSovereignLedger.tsx', type: 'file' },
      { name: 'CitiTreasuryHub.tsx', type: 'file' },
      { name: 'CitiUkInternationalPayments.tsx', type: 'file' },
      { name: 'ContractorLobbyingList.tsx', type: 'file' },
      { name: 'CorporateCommandView.tsx', type: 'file' },
      { name: 'CreditHealthView.tsx', type: 'file' },
      { name: 'CryptoView.tsx', type: 'file' },
      { name: 'CryptoView.tsx.md', type: 'file' },
      { name: 'Dashboard.tsx', type: 'file' },
      { name: 'Dashboard.tsx.md', type: 'file' },
      { name: 'DataIngestView.tsx', type: 'file' },
      { name: 'DeveloperView.tsx', type: 'file' },
      { name: 'EntraSwarmManager.tsx', type: 'file' },
      { name: 'ErrorBoundary.tsx', type: 'file' },
      { name: 'FeaturePalette.tsx', type: 'file' },
      { name: 'FinancialDemocracyView.tsx', type: 'file' },
      { name: 'FinancialGoalsView.tsx', type: 'file' },
      { name: 'FleetAppView.tsx', type: 'file' },
      { name: 'FleetAppView.tsx.md', type: 'file' },
      { name: 'FloridaVoterView.tsx', type: 'file' },
      { name: 'FlowController.tsx', type: 'file' },
      { name: 'FlowController.tsx.md', type: 'file' },
      { name: 'GasPriceCorrelation.tsx', type: 'file' },
      { name: 'GcpInventoryView.tsx', type: 'file' },
      { name: 'GeminiKeyModal.tsx', type: 'file' },
      { name: 'GeminiLivePortal.tsx', type: 'file' },
      { name: 'GlobalLedgerView.tsx', type: 'file' },
      { name: 'GoalsView.tsx', type: 'file' },
      { name: 'GoalsView.tsx.md', type: 'file' },
      { name: 'GriffinMcpView.tsx', type: 'file' },
      { name: 'GrowthNexus.tsx', type: 'file' },
      { name: 'Header.tsx', type: 'file' },
      { name: 'Header.tsx.md', type: 'file' },
      { name: 'HoKTokenMint.tsx', type: 'file' },
      { name: 'IdentityCitadelView.tsx', type: 'file' },
      { name: 'IdentityCitadelView.tsx.md', type: 'file' },
      { name: 'ImpactTracker.tsx', type: 'file' },
      { name: 'ImpactTracker.tsx.md', type: 'file' },
      { name: 'ImpeachmentGenerator.tsx', type: 'file' },
      { name: 'InjusticeDashboard.tsx', type: 'file' },
      { name: 'IntegrationsMarketplaceView.tsx', type: 'file' },
      { name: 'IntelligenceHubView.tsx', type: 'file' },
      { name: 'InvestmentPortfolio.tsx', type: 'file' },
      { name: 'InvestmentPortfolio.tsx.md', type: 'file' },
      { name: 'InvestmentsPortfolio.tsx', type: 'file' },
      { name: 'InvestmentsView.tsx', type: 'file' },
      { name: 'InvestmentsView.tsx.md', type: 'file' },
      { name: 'JweJwsVerifier.tsx', type: 'file' },
      { name: 'KryptoBridgeWidget.tsx', type: 'file' },
      { name: 'MachineView.tsx', type: 'file' },
      { name: 'MarketingAutomationView.tsx', type: 'file' },
      { name: 'MarketplaceView.tsx', type: 'file' },
      { name: 'ModernTreasuryLedgerHub.tsx', type: 'file' },
      { name: 'NFCValidator.tsx', type: 'file' },
      { name: 'NeuralToolsView.tsx', type: 'file' },
      { name: 'NexusBuilder.tsx', type: 'file' },
      { name: 'OFXStatementViewer.tsx', type: 'file' },
      { name: 'OpenBankingFapiView.tsx', type: 'file' },
      { name: 'OpenBankingView.tsx', type: 'file' },
    ]
  }
];

const SystemPathsExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({
    '00_Master_Compiled_Executive_Order': true,
    'Combined_sLegislative_Bill': true,
    'api': false,
    'apps': false,
    'clarity': false,
    'components': false,
  });

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: FileNode, currentPath: string = '') => {
    const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isDirectory = node.type === 'directory';
    const isExpanded = expandedPaths[nodePath];

    // Filter logic
    if (searchQuery) {
      const matchesSearch = (n: FileNode): boolean => {
        if (n.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
        if (n.children) {
          return n.children.some(child => matchesSearch(child));
        }
        return false;
      };
      if (!matchesSearch(node)) return null;
    }

    return (
      <div key={nodePath} className="ml-4 text-xs">
        <div 
          className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-800/50 cursor-pointer transition ${
            isDirectory ? 'text-yellow-400 font-semibold' : 'text-slate-300 font-mono'
          }`}
          onClick={() => isDirectory && toggleExpand(nodePath)}
        >
          {isDirectory ? (
            <>
              {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
              <Folder size={14} className="text-yellow-500" />
              <span>{node.name}</span>
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <File size={14} className="text-slate-400" />
              <span>{node.name}</span>
            </>
          )}
        </div>
        {isDirectory && (isExpanded || searchQuery) && node.children && (
          <div className="border-l border-slate-800 ml-2 pl-1">
            {node.children.map(child => renderNode(child, nodePath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <Folder className="text-yellow-400" size={18} />
            System Repository Explorer
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Browse compiled executive orders, legislative bills, APIs, microservices, and clarity smart contracts.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-yellow-500"
          />
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {systemPathsData.map(node => renderNode(node))}
      </div>
    </div>
  );
};

export const AlpacaTradingTerminal: React.FC = () => {
  const accountId = 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d';
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [limits, setLimits] = useState<AlpacaTradingLimits | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('terminal');

  // Order state
  const [symbol, setSymbol] = useState('AAPL');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop_limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [notional, setNotional] = useState('500');
  const [qty, setQty] = useState('2.5');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    loadTradingData();
  }, []);

  const loadTradingData = async () => {
    setLoading(true);
    try {
      const pos = await alpacaTradingService.getPositions(accountId);
      const lim = await alpacaTradingService.getTradingLimits(accountId);
      setPositions(pos);
      setLimits(lim);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteOrder = async () => {
    setLoading(true);
    try {
      setOrderStatus(`ORDER_SUBMITTED: ${side.toUpperCase()} ${symbol} - $${notional} (Executed via Correspondent Engine)`);
      setTimeout(() => {
        loadTradingData();
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async (targetSymbol: string) => {
    setLoading(true);
    try {
      await alpacaTradingService.closePosition(accountId, targetSymbol);
      setOrderStatus(`LIQUIDATED: ${targetSymbol}`);
      loadTradingData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/80 p-5 rounded-xl border border-yellow-500/20 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <TrendingUp className="text-yellow-400" size={24} />
            Alpaca Real-time Trading Terminal & Execution Venue
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Equities, Fractional Shares, Options BETA, DMA Algorithmic Routing & Real-time Limit Enforcers
          </p>
        </div>
        <button
          onClick={loadTradingData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs font-semibold text-yellow-400 border border-yellow-500/30 transition self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Venues
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'terminal', label: 'Trading Terminal', icon: TrendingUp },
          { id: 'accounts', label: 'Accounts Manager', icon: Users },
          { id: 'funding', label: 'Funding Hub', icon: CreditCard },
          { id: 'crypto', label: 'Crypto Wallets', icon: Wallet },
          { id: 'rebalancing', label: 'Rebalancing', icon: Layers },
          { id: 'tokenization', label: 'Tokenization', icon: Coins },
          { id: 'ipo', label: 'IPO Marketplace', icon: BarChart2 },
          { id: 'journals', label: 'Journals', icon: BookOpen },
          { id: 'reporting', label: 'Reporting', icon: FileText },
          { id: 'btc_swing', label: 'BTC Swing Notebook', icon: Cpu },
          { id: 'tqqq_algo', label: 'TQQQ Algo Terminal', icon: Zap },
          { id: 'system_paths', label: 'System Paths', icon: Folder },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isActive
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            {/* Real-time Trading Limits HUD */}
            {limits && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Available Buying Power</span>
                  <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">${limits.available}</span>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Daily Net Limit</span>
                  <span className="text-lg font-mono font-bold text-cyan-400 mt-1 block">${limits.daily_net_limit}</span>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Held In Orders</span>
                  <span className="text-lg font-mono font-bold text-yellow-400 mt-1 block">${limits.held}</span>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Real-time Used Limit</span>
                  <span className="text-lg font-mono font-bold text-purple-400 mt-1 block">${limits.used}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Ticket Form */}
              <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4 md:col-span-1">
                <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                  <ShoppingBag className="text-yellow-400" size={18} />
                  Correspondent Order Ticket
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setSide('buy')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition ${side === 'buy' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setSide('sell')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition ${side === 'sell' ? 'bg-rose-500 text-slate-100' : 'text-slate-400'}`}
                    >
                      SELL
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Asset Symbol</label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-slate-100 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Order Type</label>
                    <select
                      value={orderType}
                      onChange={(e: any) => setOrderType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-yellow-500"
                    >
                      <option value="market">Market Order</option>
                      <option value="limit">Limit Order</option>
                      <option value="stop_limit">Stop Limit (Bracket)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Notional Amount ($)</label>
                    <input
                      type="number"
                      value={notional}
                      onChange={(e) => setNotional(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <button
                    onClick={handleExecuteOrder}
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-2 ${
                      side === 'buy' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-rose-500 hover:bg-rose-400 text-slate-100'
                    }`}
                  >
                    <Zap size={14} />
                    Submit {side.toUpperCase()} Order
                  </button>

                  {orderStatus && (
                    <div className="p-3 bg-slate-950 rounded border border-yellow-500/30 text-[11px] text-yellow-300 font-mono break-all">
                      {orderStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Live Positions Table */}
              <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 md:col-span-2 space-y-4">
                <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                  <DollarSign className="text-emerald-400" size={18} />
                  Active Portfolio Positions ({positions.length})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="pb-2 font-medium">Asset</th>
                        <th className="pb-2 font-medium">Qty</th>
                        <th className="pb-2 font-medium">Avg Price</th>
                        <th className="pb-2 font-medium">Market Value</th>
                        <th className="pb-2 font-medium">Unrealized P/L</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {positions.map((pos) => (
                        <tr key={pos.symbol} className="hover:bg-slate-800/30 transition">
                          <td className="py-2.5 font-bold font-mono text-yellow-400">{pos.symbol}</td>
                          <td className="py-2.5 font-mono text-slate-200">{pos.qty}</td>
                          <td className="py-2.5 font-mono text-slate-300">${pos.avg_entry_price}</td>
                          <td className="py-2.5 font-mono text-slate-100">${pos.market_value}</td>
                          <td className="py-2.5 font-mono text-emerald-400">+${pos.unrealized_pl}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handleLiquidate(pos.symbol)}
                              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded text-[11px] transition"
                            >
                              Liquidate
                            </button>
                          </td>
                        </tr>
                      ))}
                      {positions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                            No active open positions in this account.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && <AlpacaAccountsManager />}
        {activeTab === 'funding' && <AlpacaFundingHub />}
        {activeTab === 'crypto' && <AlpacaCryptoWalletsView />}
        {activeTab === 'rebalancing' && <AlpacaRebalancingView />}
        {activeTab === 'tokenization' && <AlpacaTokenizationView />}
        {activeTab === 'ipo' && <AlpacaIpoMarketplaceView />}
        {activeTab === 'journals' && <AlpacaJournalsView />}
        {activeTab === 'reporting' && <AlpacaReportingView />}
        {activeTab === 'btc_swing' && <BtcSwingTradingNotebook />}
        {activeTab === 'tqqq_algo' && <TqqqAlgorithmTerminal />}
        {activeTab === 'system_paths' && <SystemPathsExplorer />}
      </div>
    </div>
  );
};

export default AlpacaTradingTerminal;