import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { Activity, TrendingUp, Cpu, Play, ShieldAlert, DollarSign, CheckCircle2, Zap, Terminal, Code, Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const workspaceData: FileNode[] = [
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
      { name: 'Dossier_14_Citibank_Demo_Business_Structure.md', type: 'file' }
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
      { name: 'voter_registration_portal', type: 'directory', children: [{ name: 'app.py', type: 'file' }] }
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
  const isDir = node.type === 'directory';

  return (
    <div className="select-none">
      <div
        onClick={() => isDir && setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg text-sm cursor-pointer transition ${
          isDir ? 'hover:bg-slate-100 text-slate-700 font-medium' : 'hover:bg-slate-50 text-slate-600'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <>
            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            <Folder className="w-4 h-4 text-amber-500 shrink-0 fill-amber-100" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4 text-slate-400 shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {isDir && isOpen && node.children && (
        <div className="mt-0.5">
          {node.children.map((child, idx) => (
            <FileTreeItem key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const BtcSwingTradingNotebook: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [strategyData, setStrategyData] = useState<any>(null);
  const [executeOrder, setExecuteOrder] = useState(false);
  const [notional, setNotional] = useState('250');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notebook' | 'execution' | 'workspace'>('notebook');

  const runStrategy = async (shouldExecute = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/crypto/btc-swing-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executeOrder: shouldExecute, notionalAmount: parseFloat(notional) || 250 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute BTC strategy');
      setStrategyData(data);
      if (shouldExecute) {
        setActiveTab('execution');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runStrategy(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
            <Zap className="w-4 h-4" /> Alpaca Crypto Jupyter Notebook & Execution Engine
          </div>
          <h2 className="text-2xl font-bold tracking-tight">BTC/USD Swing Trading with EMA & Pandas-TA (Gemini AI)</h2>
          <p className="text-slate-400 text-sm mt-1">
            Running <code>crypto_btc_usd_swing_trade.ipynb</code> with Alpaca Crypto Data API & Trading API, powered by Gemini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => runStrategy(false)}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm transition flex items-center gap-2 border border-slate-700"
          >
            <Activity className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            {loading ? 'Running Notebook...' : 'Run Notebook Cells'}
          </button>
          <button
            onClick={() => runStrategy(true)}
            disabled={loading}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-amber-900/30"
          >
            <Play className="w-4 h-4 fill-current" /> Execute BTC/USD Order ($250)
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('notebook')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'notebook' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Code className="w-4 h-4" /> Jupyter Notebook Cells & Indicators
        </button>
        <button
          onClick={() => setActiveTab('execution')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'execution' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Terminal className="w-4 h-4" /> Live Execution & Orders
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${activeTab === 'workspace' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <Folder className="w-4 h-4" /> Workspace Files & Paths
        </button>
      </div>

      {activeTab === 'notebook' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BTC/USD Live Price</div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                ${strategyData?.latestPrice?.toLocaleString() || '96,450.00'}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> CryptoHistoricalDataClient Active
              </div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">EMA Short (12) vs Long (26)</div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {strategyData?.indicators?.emaShort} / {strategyData?.indicators?.emaLong}
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">Crossover Cursors Active</div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ATR (14) & ADX (14)</div>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {strategyData?.indicators?.atr14} / {strategyData?.indicators?.adx14}
              </div>
              <div className="text-xs text-slate-500 mt-1">Pandas-TA Volatility & Trend</div>
            </Card>

            <Card className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gemini Quant Signal</div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                {strategyData?.aiIntelligence?.signal || 'BUY'} ({strategyData?.aiIntelligence?.confidence || 89}%)
              </div>
              <div className="text-xs text-slate-500 mt-1">Gemini 2.5 Flash Inference</div>
            </Card>
          </div>

          {/* AI Reasoning & Notebook Code viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" /> Gemini AI Strategy Reasoning
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {strategyData?.aiIntelligence?.reasoning || 'Analyzing EMA crossover rules and ADX momentum criteria from the Jupyter notebook...'}
              </p>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-1">
                <div className="text-amber-400"># crypto_btc_usd_swing_trade.ipynb - Active Cell Output</div>
                <div>{`symbol = "BTC/USD"`}</div>
                <div>{`req = CryptoBarsRequest(symbol_or_symbols=[symbol], timeframe=TimeFrame.Day, start=start_date, end=end_date)`}</div>
                <div>{`df["ema_short"] = df["close"].ewm(span=12, adjust=False).mean()`}</div>
                <div>{`df.ta.atr(length=14, append=True)`}</div>
                <div>{`df.ta.adx(length=14, append=True)`}</div>
              </div>
            </Card>

            <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Order Parameters
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notional USD Amount ($)</label>
                  <input
                    type="number"
                    value={notional}
                    onChange={(e) => setNotional(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Asset</span>
                  <span className="font-semibold text-slate-800">BTC/USD</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Order Type</span>
                  <span className="font-semibold text-slate-800">Market / GTC</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Buying Power</span>
                  <span className="font-semibold text-slate-800">${strategyData?.accountInfo?.buyingPower || '250,000.00'}</span>
                </div>
              </div>

              <button
                onClick={() => runStrategy(true)}
                disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition shadow-lg shadow-amber-900/20 text-center flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Submit BTC/USD Order
              </button>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'execution' && (
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-600" /> Alpaca Trading API & Order Execution Log
          </h3>

          {strategyData?.executedOrder ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> BTC/USD Order Successfully Submitted to Alpaca
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-white p-4 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-slate-500 block">Order ID</span>
                  <span className="font-bold text-slate-800">{strategyData.executedOrder.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Symbol</span>
                  <span className="font-bold text-slate-800">{strategyData.executedOrder.symbol}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Side / Qty</span>
                  <span className="font-bold text-slate-800">{strategyData.executedOrder.side?.toUpperCase()} ({strategyData.executedOrder.qty})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="font-bold text-emerald-600">{strategyData.executedOrder.status?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-600 text-sm mb-4">No live market order executed yet in this session.</p>
              <button
                onClick={() => runStrategy(true)}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-sm transition shadow-md"
              >
                Execute BTC/USD Order Now
              </button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'workspace' && (
        <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-600" /> Project Workspace Explorer
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Browse the compiled executive orders, legislative bills, APIs, and microservices in the workspace.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 max-h-[600px] overflow-y-auto">
            {workspaceData.map((node, idx) => (
              <FileTreeItem key={idx} node={node} depth={0} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BtcSwingTradingNotebook;