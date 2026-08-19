

// --- CONSOLIDATED FROM: ./components/alpaca/AlpacaIpoMarketplaceView.tsx ---

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Mail, 
  Award, 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  Download, 
  ChevronRight, 
  ChevronDown,
  Info,
  AlertCircle,
  Folder,
  File
} from 'lucide-react';
import { alpacaMarketDataService, AlpacaIpoOffering } from '../../services/AlpacaMarketDataService';

interface MyIndication {
  id: string;
  ticker: string;
  name: string;
  notional: number;
  submittedAt: string;
  status: 'Pending Review' | 'Confirmed' | 'Allocated' | 'Cancelled';
}

interface AllocationRecord {
  id: string;
  ticker: string;
  name: string;
  requestedNotional: number;
  allocatedShares: number;
  allocatedPrice: number;
  totalValue: number;
  date: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const systemFileTree: FileNode[] = [
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
          { name: 'chapter_03_the_decision.md', type: 'file' }
        ]
      },
      {
        name: 'characters',
        type: 'directory',
        children: [
          { name: 'antagonist_leverage_analysis.md', type: 'file' },
          { name: 'protagonist_profile.md', type: 'file' }
        ]
      },
      {
        name: 'dossiers',
        type: 'directory',
        children: [
          { name: 'iranian_cyber_threat_matrix.md', type: 'file' },
          { name: 'mtls_ai_bank_architecture.md', type: 'file' },
          { name: 'sovereign_id_cryptography.md', type: 'file' }
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
          { name: 'scene_09_real_time_execution.md', type: 'file' }
        ]
      },
      {
        name: 'technical',
        type: 'directory',
        children: [
          { name: 'database_synchronization_protocol.md', type: 'file' },
          { name: 'hardware_secure_element_spec.md', type: 'file' },
          { name: 'zero_knowledge_proofs_spec.md', type: 'file' }
        ]
      },
      {
        name: 'worldbuilding',
        type: 'directory',
        children: [
          { name: 'department_of_war_archives_spec.md', type: 'file' },
          { name: 'reconciliation_3_0_framework.md', type: 'file' },
          { name: 'thirty_five_sectors_analysis.md', type: 'file' }
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
      { name: 'VpcManager.ts', type: 'file' }
    ]
  },
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
              { name: 'AppStorageVault.ts', type: 'file' }
            ]
          },
          {
            name: 'types',
            type: 'directory',
            children: [
              { name: 'AppManifest.ts', type: 'file' },
              { name: 'AppRuntime.ts', type: 'file' }
            ]
          },
          {
            name: 'utils',
            type: 'directory',
            children: [
              { name: 'AppSecurityAuditor.ts', type: 'file' },
              { name: 'ManifestValidator.ts', type: 'file' }
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
          { name: 'section9_citibank_demo_business.ts', type: 'file' }
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
              { name: 'NetworkDiagnostics.ts', type: 'file' }
            ]
          },
          {
            name: 'types',
            type: 'directory',
            children: [
              { name: 'DiagnosticReport.ts', type: 'file' },
              { name: 'SystemStatus.ts', type: 'file' }
            ]
          },
          {
            name: 'utils',
            type: 'directory',
            children: [
              { name: 'AlertDispatcher.ts', type: 'file' },
              { name: 'Formatters.ts', type: 'file' }
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
          { name: 'rateLimiter.ts', type: 'file' }
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
          { name: 'section4_quantum_secured_and_revocation.ts', type: 'file' }
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
          { name: 'webhooks.ts', type: 'file' }
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
          { name: 'vault.ts', type: 'file' }
        ]
      }
    ]
  },
  {
    name: 'apps',
    type: 'directory',
    children: [
      {
        name: 'audit_compliance_tracker',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'azure_ad_app_auditor',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_audit_trail_generator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_cash_flow_stress_tester',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_corporate_liquidity_forecaster',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_interest_rate_optimizer',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_portfolio_wealth_analyzer',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_routing_decryptor_validator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_routing_number_resolver',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'b2b_transaction_categorizer',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_analytics_dashboard',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_batch_scheduler',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_calculator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_compliance_auditor',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_disbursement_orchestrator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_eligibility_checker',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_interest_simulator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'balance_transfer_lead_generator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'broker_compliance_trade_auditor',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'broker_order_execution_simulator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'camt053_balance_reconciler',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' },
          { name: 'reconciler.py', type: 'file' }
        ]
      },
      {
        name: 'camt053_mock_generator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' },
          { name: 'generator.py', type: 'file' }
        ]
      },
      {
        name: 'camt053_shared',
        type: 'directory',
        children: [
          { name: 'models.py', type: 'file' }
        ]
      },
      {
        name: 'camt053_statement_parser',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' },
          { name: 'utils.py', type: 'file' }
        ]
      },
      {
        name: 'camt053_transaction_exporter',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' },
          { name: 'exporter.py', type: 'file' }
        ]
      },
      {
        name: 'card_activation_simulator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_function_access_controller',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_lifecycle_compliance_checker',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_listing_mock_server',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_merchant_category_classifier',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_outstanding_balance_tracker',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_pin_hasher_validator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_spend_limit_manager',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_test_suite_conformance_analyzer',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'card_tokenization_service',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'citi_account_anomaly_detector',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'citi_account_excel_parser',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'citi_account_interest_accrual_simulator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'citi_account_kyc_risk_profiler',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'citiconnect_integration_gateway',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'citizenship_verification_gateway',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'credit_card_simulator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'credit_limit_utilization_monitor',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'credit_risk_analyzer',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'cross_cloud_federation_manager',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'cvv_decryption_mock_service',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'election_integrity_dashboard',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'fedramp_compliance_monitor',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'financial_regulatory_guardrail',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'financial_statement_verifier',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'github_audit_sync_agent',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'military_fund_allocator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'multi_currency_balance_consolidator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'pqc_crypto_bridge_simulator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'schema_catalog_custom_registry',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'schema_catalog_search_engine',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'schema_conformance_audit_tool',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'schema_validator_orchestrator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'service_principal_provisioner',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'statement_reconciliation_portal',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'supplementary_card_orchestrator',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'treasury_reconciliation_engine',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      },
      {
        name: 'voter_registration_portal',
        type: 'directory',
        children: [
          { name: 'app.py', type: 'file' }
        ]
      }
    ]
  },
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
      { name: 'part25_system_orchestrator.ts', type: 'file' }
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
      { name: 'OpenBankingView.tsx', type: 'file' }
    ]
  }
];

const FileTreeItem: React.FC<{ node: FileNode; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`flex items-center gap-2 py-1.5 hover:bg-slate-800/50 rounded cursor-pointer transition text-xs ${
          node.type === 'directory' ? 'text-slate-300 font-semibold' : 'text-slate-400 font-mono'
        }`}
      >
        {hasChildren ? (
          isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />
        ) : (
          <span className="w-3.5" />
        )}
        {node.type === 'directory' ? (
          <Folder size={14} className="text-yellow-500/80" />
        ) : (
          <File size={14} className="text-cyan-500/80" />
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {node.children!.map((child, idx) => (
            <FileTreeItem key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const AlpacaIpoMarketplaceView: React.FC = () => {
  const [ipos, setIpos] = useState<AlpacaIpoOffering[]>([]);
  const [selectedIpo, setSelectedIpo] = useState<AlpacaIpoOffering | null>(null);
  const [indicationNotional, setIndicationNotional] = useState('10000');
  const [statusMsg, setStatusMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'offerings' | 'my-indications' | 'allocations' | 'disclosures' | 'mail' | 'system-paths'>('offerings');

  // Extended state for interactive features
  const [myIndications, setMyIndications] = useState<MyIndication[]>([
    {
      id: 'IND-9081',
      ticker: 'PLTR',
      name: 'Palantir Technologies Inc.',
      notional: 25000,
      submittedAt: '2025-02-10 09:30 AM',
      status: 'Confirmed'
    },
    {
      id: 'IND-4412',
      ticker: 'SNOW',
      name: 'Snowflake Inc.',
      notional: 15000,
      submittedAt: '2025-02-12 02:15 PM',
      status: 'Pending Review'
    }
  ]);

  const [allocations, setAllocations] = useState<AllocationRecord[]>([
    {
      id: 'AL-771',
      ticker: 'ARM',
      name: 'Arm Holdings plc',
      requestedNotional: 50000,
      allocatedShares: 420,
      allocatedPrice: 51.00,
      totalValue: 21420,
      date: '2024-11-15'
    },
    {
      id: 'AL-502',
      ticker: 'KVUE',
      name: 'Kenvue Inc.',
      requestedNotional: 10000,
      allocatedShares: 360,
      allocatedPrice: 22.00,
      totalValue: 7920,
      date: '2024-08-22'
    }
  ]);

  const [mailAlerts, setMailAlerts] = useState([
    {
      id: 1,
      subject: '60-Minute Warning: Indication Window Closing for $TICKER',
      body: 'The indication of interest window for the upcoming offering will close in exactly 60 minutes. Please review and finalize your submissions.',
      time: '10 mins ago',
      unread: true,
      category: 'Urgent'
    },
    {
      id: 2,
      subject: 'Prospectus Supplement Filed: SEC Form 424B4',
      body: 'An updated prospectus supplement has been filed with the SEC. Investors are advised to review the updated risk factors and pricing terms.',
      time: '2 hours ago',
      unread: false,
      category: 'Filing'
    },
    {
      id: 3,
      subject: 'Primary Allocation Confirmed: ARM',
      body: 'Your primary allocation for Arm Holdings plc has been finalized. Shares have been credited to your Alpaca brokerage account.',
      time: '1 day ago',
      unread: false,
      category: 'Allocation'
    }
  ]);

  useEffect(() => {
    alpacaMarketDataService.getIpoOfferings().then((res) => {
      setIpos(res);
      if (res.length > 0) setSelectedIpo(res[0]);
    });
  }, []);

  const handleSubmitIndication = () => {
    if (!selectedIpo) return;
    const notionalVal = parseFloat(indicationNotional);
    if (isNaN(notionalVal) || notionalVal <= 0) {
      setStatusMsg('Please enter a valid notional amount.');
      return;
    }

    const newIndication: MyIndication = {
      id: `IND-${Math.floor(1000 + Math.random() * 9000)}`,
      ticker: selectedIpo.ticker_symbol,
      name: selectedIpo.name,
      notional: notionalVal,
      submittedAt: new Date().toLocaleString(),
      status: 'Pending Review'
    };

    setMyIndications([newIndication, ...myIndications]);
    setStatusMsg(`Indication of Interest Submitted: ${selectedIpo.ticker_symbol} ($${indicationNotional} Notional)`);
    
    // Add a simulated 60-minute mail notification
    const newMail = {
      id: Date.now(),
      subject: `IOI Confirmation: ${selectedIpo.ticker_symbol}`,
      body: `We have successfully received your Indication of Interest for ${selectedIpo.name} (${selectedIpo.ticker_symbol}) in the amount of $${notionalVal.toLocaleString()}. Final allocations will be determined post-pricing.`,
      time: 'Just now',
      unread: true,
      category: 'Confirmation'
    };
    setMailAlerts([newMail, ...mailAlerts]);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900/80 p-6 rounded-xl border border-yellow-500/20 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <Rocket className="text-yellow-400 animate-pulse" size={24} />
            Alpaca Primary IPO & Offering Indications Marketplace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indication of Interest (IOI), Prospectus Disclosures, 60-Minute Mail & Primary Allocations
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-mono text-slate-300">Alpaca Primary Feed: Connected</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('offerings')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'offerings'
              ? 'border-yellow-500 text-yellow-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Rocket size={14} />
          Upcoming Offerings
        </button>
        <button
          onClick={() => setActiveTab('my-indications')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'my-indications'
              ? 'border-yellow-500 text-yellow-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign size={14} />
          My Indications ({myIndications.length})
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'allocations'
              ? 'border-yellow-500 text-yellow-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award size={14} />
          Primary Allocations
        </button>
        <button
          onClick={() => setActiveTab('disclosures')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'disclosures'
              ? 'border-yellow-500 text-yellow-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={14} />
          Prospectus Disclosures
        </button>
        <button
          onClick={() => setActiveTab('mail')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 relative ${
            activeTab === 'mail'
              ? 'border-yellow-500 text-yellow-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail size={14} />
          60-Minute Mail
          {mailAlerts.some(m => m.unread) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('system-paths')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'system-paths'
              ? 'border-yellow-500 text-yellow-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Folder size={14} />
          System File Tree
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column depending on active tab */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'offerings' && (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Rocket className="text-cyan-400" size={18} />
                  Active IPO & Secondary Offerings ({ipos.length})
                </h3>
                <span className="text-xs text-slate-400 font-mono">Real-time pricing window</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ipos.map((ipo) => (
                  <div
                    key={ipo.ipo_reference}
                    onClick={() => setSelectedIpo(ipo)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedIpo?.ipo_reference === ipo.ipo_reference
                        ? 'bg-slate-800/80 border-yellow-500/50 shadow-lg shadow-yellow-500/5'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-yellow-400 line-clamp-1">{ipo.name}</h4>
                          <span className="font-mono text-xs text-cyan-300 font-bold">${ipo.ticker_symbol}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase whitespace-nowrap">
                          {ipo.availability}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/50 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 block text-[10px]">PRICE RANGE</span>
                          <span className="text-slate-200 font-semibold">${ipo.min_price} - ${ipo.max_price}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">TRADE DATE</span>
                          <span className="text-slate-200 font-semibold">{ipo.trade_date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/40">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-yellow-500" />
                        IOI Open
                      </span>
                      <span className="font-mono text-slate-300">Ref: {ipo.ipo_reference.substring(0, 8)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'my-indications' && (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={18} />
                My Active Indications of Interest (IOI)
              </h3>

              {myIndications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No active indications submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {myIndications.map((ind) => (
                    <div key={ind.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">{ind.id}</span>
                          <span className="font-bold text-sm text-yellow-400">${ind.ticker}</span>
                          <span className="text-xs text-slate-400">| {ind.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Submitted: <span className="font-mono text-slate-300">{ind.submittedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">NOTIONAL REQUEST</span>
                          <span className="font-mono text-sm font-bold text-emerald-400">${ind.notional.toLocaleString()}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          ind.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          ind.status === 'Pending Review' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {ind.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'allocations' && (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                <Award className="text-yellow-400" size={18} />
                Primary Allocation History
              </h3>

              <div className="space-y-3">
                {allocations.map((alloc) => (
                  <div key={alloc.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-xs text-slate-500">{alloc.id} • {alloc.date}</span>
                        <h4 className="font-bold text-sm text-slate-200">{alloc.name} (${alloc.ticker})</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">ALLOCATED VALUE</span>
                        <span className="font-mono text-sm font-bold text-emerald-400">${alloc.totalValue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-900 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 block text-[10px]">REQUESTED</span>
                        <span className="text-slate-300">${alloc.requestedNotional.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">ALLOCATED SHARES</span>
                        <span className="text-slate-300">{alloc.allocatedShares}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">OFFERING PRICE</span>
                        <span className="text-slate-300">${alloc.allocatedPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'disclosures' && (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                <FileText className="text-cyan-400" size={18} />
                SEC Prospectus & Regulatory Disclosures
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase font-mono">
                        Form S-1/A
                      </span>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">Pre-Effective Amendment to Registration Statement</h4>
                    </div>
                    <button className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-300 transition">
                      <Download size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Contains updated pricing terms, underwriting syndicate details, and comprehensive risk factors regarding the issuer's capital structure.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-mono">
                        Form 424B4
                      </span>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">Prospectus Filed Pursuant to Rule 424(b)(4)</h4>
                    </div>
                    <button className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-300 transition">
                      <Download size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    The final prospectus containing the definitive offering price, final allocation methodology, and complete financial statements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mail' && (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                <Mail className="text-yellow-400" size={18} />
                60-Minute Mail & Offering Alerts
              </h3>

              <div className="space-y-3">
                {mailAlerts.map((mail) => (
                  <div key={mail.id} className={`p-4 rounded-xl border transition ${
                    mail.unread ? 'bg-slate-950 border-yellow-500/30' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        {mail.unread && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                          mail.category === 'Urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          mail.category === 'Filing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {mail.category}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{mail.time}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-200 mt-2">{mail.subject}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mail.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system-paths' && (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Folder className="text-yellow-500" size={18} />
                  System Compliance & Legislative File Tree
                </h3>
                <span className="text-xs text-slate-400 font-mono">Audit Trail Registry</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The following directory structure maps the compiled executive orders, legislative bills, API gateways, and compliance modules integrated within the sovereign ledger ecosystem.
              </p>
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto space-y-1">
                {systemFileTree.map((node, idx) => (
                  <FileTreeItem key={idx} node={node} depth={0} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Indication Ticket & Info */}
        <div className="space-y-6">
          
          {/* Indication Ticket */}
          {selectedIpo ? (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={18} />
                IPO Indication Ticket: ${selectedIpo.ticker_symbol}
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">ISSUER NAME</span>
                  <p className="text-slate-100 font-bold text-sm">{selectedIpo.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Ref: {selectedIpo.ipo_reference}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                  <div>
                    <span className="text-slate-500 block">MIN PRICE</span>
                    <span className="text-slate-200 font-bold">${selectedIpo.min_price}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">MAX PRICE</span>
                    <span className="text-slate-200 font-bold">${selectedIpo.max_price}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Notional Indication Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-mono">$</span>
                    <input
                      type="number"
                      value={indicationNotional}
                      onChange={(e) => setIndicationNotional(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Minimum indication: $1,000. Allocations are subject to availability.
                  </span>
                </div>

                <button
                  onClick={handleSubmitIndication}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 size={14} />
                  Submit Indication of Interest (IOI)
                </button>

                {statusMsg && (
                  <div className="p-3 bg-slate-950 rounded border border-emerald-500/30 text-xs text-emerald-300 font-mono break-all">
                    {statusMsg}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 text-center py-8 text-slate-500 text-xs">
              Select an upcoming offering to submit an indication.
            </div>
          )}

          {/* Educational / Compliance Panel */}
          <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Info size={14} className="text-yellow-500" />
              Important Disclosures
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Indications of Interest (IOI) are non-binding expressions of interest. Submitting an IOI does not guarantee an allocation of shares. 
            </p>
            <div className="p-2.5 bg-yellow-500/5 rounded border border-yellow-500/10 flex gap-2">
              <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-500/80 leading-normal">
                Alpaca Securities LLC is a member of FINRA and SIPC. Primary offerings are subject to regulatory approval and market conditions.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AlpacaIpoMarketplaceView;