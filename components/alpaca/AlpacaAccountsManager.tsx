import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, FileText, CheckCircle, AlertCircle, RefreshCw, Key, Building } from 'lucide-react';
import { alpacaAccountsService, AlpacaCipData, AlpacaOptionsApprovalRequest } from '../../services/AlpacaAccountsService';

const SYSTEM_PATHS = [
  "00_Master_Compiled_Executive_Order/Chapter_01_The_Citibank_Lobby.md",
  "00_Master_Compiled_Executive_Order/Chapter_02_The_EAC_Briefing.md",
  "00_Master_Compiled_Executive_Order/Chapter_03_The_DHS_Server_Room.md",
  "00_Master_Compiled_Executive_Order/Chapter_04_The_Military_Fund_Audit.md",
  "00_Master_Compiled_Executive_Order/Chapter_05_The_Geneva_Account.md",
  "00_Master_Compiled_Executive_Order/Chapter_06_The_Task_Force_Confrontation.md",
  "00_Master_Compiled_Executive_Order/Chapter_07_The_Mobile_Verification_Launch.md",
  "00_Master_Compiled_Executive_Order/Dossier_01_UCC_Financial_Loophole.md",
  "00_Master_Compiled_Executive_Order/Dossier_02_SAVE_API_Vulnerabilities.md",
  "00_Master_Compiled_Executive_Order/Dossier_03_Iran_Framework_Compliance.md",
  "00_Master_Compiled_Executive_Order/Dossier_04_Military_Fund_Allocation.md",
  "00_Master_Compiled_Executive_Order/Dossier_05_DNA_Testing_Consular_Protocols.md",
  "00_Master_Compiled_Executive_Order/Dossier_06_Voter_Roll_Purge_Metrics.md",
  "00_Master_Compiled_Executive_Order/Dossier_07_Tribal_Liaison_Integration.md",
  "00_Master_Compiled_Executive_Order/Dossier_08_Paperwork_Reduction_Exemption.md",
  "00_Master_Compiled_Executive_Order/Dossier_09_Private_Right_of_Action.md",
  "00_Master_Compiled_Executive_Order/Dossier_10_Department_of_War_Archival_Access.md",
  "00_Master_Compiled_Executive_Order/Dossier_11_Mobile_Unit_Deployment_Logistics.md",
  "00_Master_Compiled_Executive_Order/Dossier_12_Task_Force_Sunset_Procedures.md",
  "00_Master_Compiled_Executive_Order/Dossier_13_Vector_Collapse_Protocol.md",
  "00_Master_Compiled_Executive_Order/Dossier_14_Citibank_Demo_Business_Structure.md",
  "App.tsx",
  "Book/Ok.md",
  "Combined_sLegislative_Bill/chapters/chapter_01_the_loophole.md",
  "Combined_sLegislative_Bill/chapters/chapter_02_political_decay.md",
  "Combined_sLegislative_Bill/chapters/chapter_03_the_decision.md",
  "Combined_sLegislative_Bill/characters/antagonist_leverage_analysis.md",
  "Combined_sLegislative_Bill/characters/protagonist_profile.md",
  "Combined_sLegislative_Bill/dossiers/iranian_cyber_threat_matrix.md",
  "Combined_sLegislative_Bill/dossiers/mtls_ai_bank_architecture.md",
  "Combined_sLegislative_Bill/dossiers/sovereign_id_cryptography.md",
  "Combined_sLegislative_Bill/narrative/scene_01_banking_loophole.md",
  "Combined_sLegislative_Bill/narrative/scene_02_bureaucratic_signing.md",
  "Combined_sLegislative_Bill/narrative/scene_03_system_failure.md",
  "Combined_sLegislative_Bill/narrative/scene_04_political_decay.md",
  "Combined_sLegislative_Bill/narrative/scene_05_corruption_observation.md",
  "Combined_sLegislative_Bill/narrative/scene_06_threats_closing_in.md",
  "Combined_sLegislative_Bill/narrative/scene_07_high_stakes_decision.md",
  "Combined_sLegislative_Bill/narrative/scene_08_antagonist_pushout.md",
  "Combined_sLegislative_Bill/narrative/scene_09_real_time_execution.md",
  "Combined_sLegislative_Bill/technical/database_synchronization_protocol.md",
  "Combined_sLegislative_Bill/technical/hardware_secure_element_spec.md",
  "Combined_sLegislative_Bill/technical/zero_knowledge_proofs_spec.md",
  "Combined_sLegislative_Bill/worldbuilding/department_of_war_archives_spec.md",
  "Combined_sLegislative_Bill/worldbuilding/reconciliation_3_0_framework.md",
  "Combined_sLegislative_Bill/worldbuilding/thirty_five_sectors_analysis.md",
  "Google/AuthManager.ts",
  "Google/AutoScaler.ts",
  "Google/BackupService.ts",
  "Google/BigQueryEmulator.ts",
  "Google/BillingTracker.ts",
  "Google/CDNReplacement.ts",
  "Google/CloudFunctionsShim.ts",
  "Google/CloudReplacementEngine.ts",
  "Google/ComputeOrchestrator.ts",
  "Google/DatabaseBridge.ts",
  "Google/DeploymentPipeline.ts",
  "Google/IAMPolicyEngine.ts",
  "Google/MonitoringService.ts",
  "Google/NetworkGateway.ts",
  "Google/PubSubLocal.ts",
  "Google/SecretVault.ts",
  "Google/ServiceMesh.ts",
  "Google/StorageAbstraction.ts",
  "Google/VertexAIProxy.ts",
  "Google/VpcManager.ts",
  "IMG_5610.webp",
  "LICENSE",
  "README.md",
  "README_v2.md",
  "TRUST.md",
  "api/AppRegistry/AppBillingBridge.ts",
  "api/AppRegistry/AppDependencyResolver.ts",
  "api/AppRegistry/AppLifecycleManager.ts",
  "api/AppRegistry/AppManifestParser.ts",
  "api/AppRegistry/AppMetadataAggregator.ts",
  "api/AppRegistry/AppPermissionEngine.ts",
  "api/AppRegistry/AppRegistryOrchestrator.ts",
  "api/AppRegistry/AppWebhookDispatcher.ts",
  "api/AppRegistry/config/EcosystemConfig.ts",
  "api/AppRegistry/index.ts",
  "api/AppRegistry/middleware/AppRegistryAuth.ts",
  "api/AppRegistry/routes/AppRegistryRoutes.ts",
  "api/AppRegistry/services/AppDeploymentService.ts",
  "api/AppRegistry/services/AppIntegrationsBridge.ts",
  "api/AppRegistry/services/AppMetricsCollector.ts",
  "api/AppRegistry/services/AppStorageVault.ts",
  "api/AppRegistry/types/AppManifest.ts",
  "api/AppRegistry/types/AppRuntime.ts",
  "api/AppRegistry/utils/AppSecurityAuditor.ts",
  "api/AppRegistry/utils/ManifestValidator.ts",
  "api/Obama Opts Out Of Public Financing (1)/section10_sovereign_wealth_fund_527.ts",
  "api/Obama Opts Out Of Public Financing (1)/section1_obama_public_financing.ts",
  "api/Obama Opts Out Of Public Financing (1)/section2_bear_stearns_arrests.ts",
  "api/Obama Opts Out Of Public Financing (1)/section3_spaceflight_kosmos.ts",
  "api/Obama Opts Out Of Public Financing (1)/section4_citi_connection_contagion.ts",
  "api/Obama Opts Out Of Public Financing (1)/section5_goldman_sachs_downgrade.ts",
  "api/Obama Opts Out Of Public Financing (1)/section6_cfo_gary_crittenden.ts",
  "api/Obama Opts Out Of Public Financing (1)/section7_structured_products_basket.ts",
  "api/Obama Opts Out Of Public Financing (1)/section8_the_toast_email.ts",
  "api/Obama Opts Out Of Public Financing (1)/section9_citibank_demo_business.ts",
  "api/PortalDiagnostics/DependencyGraph.ts",
  "api/PortalDiagnostics/DiagnosticsOrchestrator.ts",
  "api/PortalDiagnostics/ErrorReporter.ts",
  "api/PortalDiagnostics/HealthCheckService.ts",
  "api/PortalDiagnostics/LogAnalyzer.ts",
  "api/PortalDiagnostics/PerformanceMonitor.ts",
  "api/PortalDiagnostics/SecurityScanner.ts",
  "api/PortalDiagnostics/TelemetryCollector.ts",
  "api/PortalDiagnostics/config/DiagnosticConfig.ts",
  "api/PortalDiagnostics/index.ts",
  "api/PortalDiagnostics/middleware/DiagnosticAuth.ts",
  "api/PortalDiagnostics/routes/DiagnosticRoutes.ts",
  "api/PortalDiagnostics/services/AuthDiagnostics.ts",
  "api/PortalDiagnostics/services/DatabaseDiagnostics.ts",
  "api/PortalDiagnostics/services/IntegrationDiagnostics.ts",
  "api/PortalDiagnostics/services/NetworkDiagnostics.ts",
  "api/PortalDiagnostics/types/DiagnosticReport.ts",
  "api/PortalDiagnostics/types/SystemStatus.ts",
  "api/PortalDiagnostics/utils/AlertDispatcher.ts",
  "api/PortalDiagnostics/utils/Formatters.ts",
  "api/acquisitions.ts",
  "api/ai.ts",
  "api/alpaca.ts",
  "api/alpacaCollateral.ts",
  "api/azure.ts",
  "api/azureGovCompliance.ts",
  "api/citi.ts",
  "api/config.ts",
  "api/crypto-strategy.ts",
  "api/fapi.ts",
  "api/google-chat.ts",
  "api/government-gateway.ts",
  "api/index.ts",
  "api/middleware/auths.ts",
  "api/middleware/rateLimiter.ts",
  "api/modern-treasury.ts",
  "api/order/order_01_02.md",
  "api/order/order_03_04.md",
  "api/order/order_05_06.md",
  "api/order/order_07_08.md",
  "api/order/order_09_10.md",
  "api/order/order_11_12.md",
  "api/order/order_13_14.md",
  "api/order/order_15_16.md",
  "api/order/order_17_18.md",
  "api/order/order_19_20.md",
  "api/order/order_21_22.md",
  "api/order/order_23_24.md",
  "api/order/order_25_26.md",
  "api/order/order_27_28.md",
  "api/order/order_29_30.md",
  "api/order/order_31_32.md",
  "api/order/order_33_34.md",
  "api/order/order_35_36.md",
  "api/order/order_37_38.md",
  "api/order/order_39_40.md",
  "api/order/order_41_42.md",
  "api/order/order_43_44.md",
  "api/section1_digital_asset_and_cybersecurity.ts",
  "api/section2_ledger_framework_and_arbitrage.ts",
  "api/section3_consensus_and_fapi_conformance.ts",
  "api/section4_quantum_secured_and_revocation.ts",
  "api/plaid.ts",
  "api/real-estate.ts",
  "api/routes/acquisitions-orchestrator.ts",
  "api/routes/admin.ts",
  "api/routes/audit.ts",
  "api/routes/collateral.ts",
  "api/routes/identity.ts",
  "api/routes/market.ts",
  "api/routes/notifications.ts",
  "api/routes/treasury.ts",
  "api/routes/webhooks.ts",
  "api/sovereign.ts",
  "api/stripe.ts",
  "api/tax-liens.ts",
  "api/tqqq-strategy.ts",
  "api/types/sovereign.ts",
  "api/utils/ai-agent-factory.ts",
  "api/utils/complianceEngine.ts",
  "api/utils/crypto-bridge.ts",
  "api/utils/geo-spatial.ts",
  "api/utils/ledgerSync.ts",
  "api/utils/logger.ts",
  "api/utils/math-engine.ts",
  "api/utils/vault.ts",
  "apps/audit_compliance_tracker/app.py",
  "apps/azure_ad_app_auditor/app.py",
  "apps/b2b_audit_trail_generator/app.py",
  "apps/b2b_cash_flow_stress_tester/app.py",
  "apps/b2b_corporate_liquidity_forecaster/app.py",
  "apps/b2b_interest_rate_optimizer/app.py",
  "apps/b2b_portfolio_wealth_analyzer/app.py",
  "apps/b2b_routing_decryptor_validator/app.py",
  "apps/b2b_routing_number_resolver/app.py",
  "apps/b2b_transaction_categorizer/app.py",
  "apps/balance_transfer_analytics_dashboard/app.py",
  "apps/balance_transfer_batch_scheduler/app.py",
  "apps/balance_transfer_calculator/app.py",
  "apps/balance_transfer_compliance_auditor/app.py",
  "apps/balance_transfer_disbursement_orchestrator/app.py",
  "apps/balance_transfer_eligibility_checker/app.py",
  "apps/balance_transfer_interest_simulator/app.py",
  "apps/balance_transfer_lead_generator/app.py",
  "apps/broker_compliance_trade_auditor/app.py",
  "apps/broker_order_execution_simulator/app.py",
  "apps/camt053_balance_reconciler/app.py",
  "apps/camt053_balance_reconciler/reconciler.py",
  "apps/camt053_mock_generator/app.py",
  "apps/camt053_mock_generator/generator.py",
  "apps/camt053_shared/models.py",
  "apps/camt053_statement_parser/app.py",
  "apps/camt053_statement_parser/utils.py",
  "apps/camt053_transaction_exporter/app.py",
  "apps/camt053_transaction_exporter/exporter.py",
  "apps/card_activation_simulator/app.py",
  "apps/card_function_access_controller/app.py",
  "apps/card_lifecycle_compliance_checker/app.py",
  "apps/card_listing_mock_server/app.py",
  "apps/card_merchant_category_classifier/app.py",
  "apps/card_outstanding_balance_tracker/app.py",
  "apps/card_pin_hasher_validator/app.py",
  "apps/card_spend_limit_manager/app.py",
  "apps/card_test_suite_conformance_analyzer/app.py",
  "apps/card_tokenization_service/app.py",
  "apps/citi_account_anomaly_detector/app.py",
  "apps/citi_account_excel_parser/app.py",
  "apps/citi_account_interest_accrual_simulator/app.py",
  "apps/citi_account_kyc_risk_profiler/app.py",
  "apps/citiconnect_integration_gateway/app.py",
  "apps/citizenship_verification_gateway/app.py",
  "apps/credit_card_simulator/app.py",
  "apps/credit_limit_utilization_monitor/app.py",
  "apps/credit_risk_analyzer/app.py",
  "apps/cross_cloud_federation_manager/app.py",
  "apps/cvv_decryption_mock_service/app.py",
  "apps/election_integrity_dashboard/app.py",
  "apps/fedramp_compliance_monitor/app.py",
  "apps/financial_regulatory_guardrail/app.py",
  "apps/financial_statement_verifier/app.py",
  "apps/github_audit_sync_agent/app.py",
  "apps/military_fund_allocator/app.py",
  "apps/multi_currency_balance_consolidator/app.py",
  "apps/pqc_crypto_bridge_simulator/app.py",
  "apps/schema_catalog_custom_registry/app.py",
  "apps/schema_catalog_search_engine/app.py",
  "apps/schema_conformance_audit_tool/app.py",
  "apps/schema_validator_orchestrator/app.py",
  "apps/service_principal_provisioner/app.py",
  "apps/statement_reconciliation_portal/app.py",
  "apps/supplementary_card_orchestrator/app.py",
  "apps/treasury_reconciliation_engine/app.py",
  "apps/voter_registration_portal/app.py",
  "book/Ok",
  "bun.lock",
  "check_sql.ts",
  "clarity/part01_legislative_intent.ts",
  "clarity/part02_definitions_registry.ts",
  "clarity/part03_sec_cftc_jurisdiction.ts",
  "clarity/part04_decentralization_certification.ts",
  "clarity/part05_digital_commodity_exchanges.ts",
  "clarity/part06_broker_dealer_requirements.ts",
  "clarity/part07_stablecoin_issuance_framework.ts",
  "clarity/part08_market_manipulation_prevention.ts",
  "clarity/part09_customer_protection_custody.ts",
  "clarity/part10_clearing_settlement_protocols.ts",
  "clarity/part11_international_coordination.ts",
  "clarity/part12_anti_money_laundering_kyc.ts",
  "clarity/part13_tax_reporting_compliance.ts",
  "clarity/part14_smart_contract_auditing.ts",
  "clarity/part15_disclosure_requirements.ts",
  "clarity/part16_alpaca_integration_bridge.ts",
  "clarity/part17_citi_sovereign_ledger_bridge.ts",
  "clarity/part18_modern_treasury_settlement.ts",
  "clarity/part19_crypto_strategy_validator.ts",
  "clarity/part20_compliance_audit_trail.ts",
  "clarity/part21_risk_assessment_matrix.ts",
  "clarity/part22_government_gateway_reporting.ts",
  "clarity/part23_tokenization_compliance_engine.ts",
  "clarity/part24_ai_compliance_agent.ts",
  "clarity/part25_system_orchestrator.ts",
  "components/AIAdStudioView.tsx",
  "components/AIAdStudioView.tsx.md",
  "components/AIAdvisorView.tsx",
  "components/AIAdvisorView.tsx.md",
  "components/AIInsights.tsx",
  "components/AIInsights.tsx.md",
  "components/APIIntegrationView.tsx",
  "components/APIIntegrationView.tsx.md",
  "components/APIKeysView.tsx",
  "components/AdministrationAudit.tsx",
  "components/AlpacaBrokerView.tsx",
  "components/AquariusArchitectView.tsx",
  "components/AquariusAuditorView.tsx",
  "components/AquariusCreativeSuite.tsx",
  "components/AquariusDashboard.tsx",
  "components/AquariusGhostView.tsx",
  "components/AquariusInstitutionalHub.tsx",
  "components/AquariusLiveVoice.tsx",
  "components/AriaComms.tsx",
  "components/AstraDBQuickstart.tsx",
  "components/AzureAppsView.tsx",
  "components/AzureAppsView.tsx.md",
  "components/BalanceSummary.tsx",
  "components/BalanceSummary.tsx.md",
  "components/BillingIdentityView.tsx",
  "components/BudgetsView.tsx",
  "components/BudgetsView.tsx.md",
  "components/Card.tsx",
  "components/Card.tsx.md",
  "components/CardCustomizationView.tsx",
  "components/CardCustomizationView.tsx.md",
  "components/CitiConnectInitiation.tsx",
  "components/CitiConnectInquiry.tsx",
  "components/CitiConnectNotifications.tsx",
  "components/CitiDecryptionUtility.tsx",
  "components/CitiGateway.tsx",
  "components/CitiPartnerHub.tsx",
  "components/CitiSovereignLedger.tsx",
  "components/CitiTreasuryHub.tsx",
  "components/CitiUkInternationalPayments.tsx",
  "components/ContractorLobbyingList.tsx",
  "components/CorporateCommandView.tsx",
  "components/CreditHealthView.tsx",
  "components/CryptoView.tsx",
  "components/CryptoView.tsx.md",
  "components/Dashboard.tsx",
  "components/Dashboard.tsx.md",
  "components/DataIngestView.tsx",
  "components/DeveloperView.tsx",
  "components/EntraSwarmManager.tsx",
  "components/ErrorBoundary.tsx",
  "components/FeaturePalette.tsx",
  "components/FinancialDemocracyView.tsx",
  "components/FinancialGoalsView.tsx",
  "components/FleetAppView.tsx",
  "components/FleetAppView.tsx.md",
  "components/FloridaVoterView.tsx",
  "components/FlowController.tsx",
  "components/FlowController.tsx.md",
  "components/GasPriceCorrelation.tsx",
  "components/GcpInventoryView.tsx",
  "components/GeminiKeyModal.tsx",
  "components/GeminiLivePortal.tsx",
  "components/GlobalLedgerView.tsx",
  "components/GoalsView.tsx",
  "components/GoalsView.tsx.md",
  "components/GriffinMcpView.tsx",
  "components/GrowthNexus.tsx",
  "components/Header.tsx",
  "components/Header.tsx.md",
  "components/HoKTokenMint.tsx",
  "components/IdentityCitadelView.tsx",
  "components/IdentityCitadelView.tsx.md",
  "components/ImpactTracker.tsx",
  "components/ImpactTracker.tsx.md",
  "components/ImpeachmentGenerator.tsx",
  "components/InjusticeDashboard.tsx",
  "components/IntegrationsMarketplaceView.tsx",
  "components/IntelligenceHubView.tsx",
  "components/InvestmentPortfolio.tsx",
  "components/InvestmentPortfolio.tsx.md",
  "components/InvestmentsPortfolio.tsx",
  "components/InvestmentsView.tsx",
  "components/InvestmentsView.tsx.md",
  "components/JweJwsVerifier.tsx",
  "components/KryptoBridgeWidget.tsx",
  "components/MachineView.tsx",
  "components/MarketingAutomationView.tsx",
  "components/MarketplaceView.tsx",
  "components/ModernTreasuryLedgerHub.tsx",
  "components/NFCValidator.tsx",
  "components/NeuralToolsView.tsx",
  "components/NexusBuilder.tsx",
  "components/OFXStatementViewer.tsx",
  "components/OpenBankingFapiView.tsx",
  "components/OpenBankingView.tsx"
];

export const AlpacaAccountsManager: React.FC = () => {
  const accountId = 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d';
  const [cipData, setCipData] = useState<AlpacaCipData | null>(null);
  const [optionsApproval, setOptionsApproval] = useState<AlpacaOptionsApprovalRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestedLevel, setRequestedLevel] = useState<number>(3);
  const [onfidoToken, setOnfidoToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExplorer, setShowExplorer] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    setLoading(true);
    setError(null);
    try {
      const cip = await alpacaAccountsService.getCip(accountId);
      const opt = await alpacaAccountsService.getOptionsApproval(accountId);
      setCipData(cip);
      setOptionsApproval(opt);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load Alpaca account data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alpacaAccountsService.requestOptionsApproval(accountId, requestedLevel);
      setOptionsApproval(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to request options approval');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOnfido = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alpacaAccountsService.getOnfidoSdkToken(accountId);
      setOnfidoToken(res.token);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate Onfido SDK token');
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = SYSTEM_PATHS.filter(path => 
    path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-xl border border-yellow-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <UserCheck className="text-yellow-400" size={24} />
            Alpaca Correspondent Account & KYC Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Correspondent Brokerage Lifecycle, CIP Validation, Options Level Approval & Onfido SDK Integration
          </p>
        </div>
        <button
          onClick={loadAccountData}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-xs font-semibold text-yellow-400 border border-yellow-500/30 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-sm text-red-400">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="font-semibold">Error Occurred</h4>
            <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CIP & Identity Validation Card */}
        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <ShieldCheck className="text-emerald-400" size={18} />
              CIP & Sanctions Result
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {cipData?.kyc.approval_status.toUpperCase() || 'APPROVED'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-mono text-cyan-400">{accountId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Primary Holder:</span>
              <span className="text-slate-200">{cipData?.kyc.applicant_name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Verified Providers:</span>
              <span className="text-emerald-400">{cipData?.provider_name.join(', ') || 'Onfido, ComplyAdvantage'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Risk Assessment:</span>
              <span className="text-yellow-400 font-bold">{cipData?.kyc.risk_level || 'LOW'} (Score: {cipData?.kyc.risk_score ?? 12})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Matched Address:</span>
              <span className="text-slate-300">{cipData?.identity?.matched_address || 'Verified'}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGenerateOnfido}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 font-semibold py-2 px-3 rounded-lg text-xs border border-yellow-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Key size={14} />
              Issue Onfido SDK Web Token
            </button>
            {onfidoToken && (
              <div className="mt-2 p-2 bg-slate-950 rounded text-[10px] font-mono text-cyan-300 break-all border border-cyan-500/20">
                Token: {onfidoToken}
              </div>
            )}
          </div>
        </div>

        {/* Options Approval Beta Card */}
        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Building className="text-yellow-400" size={18} />
              Options Trading Level Approval (BETA)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              LEVEL {optionsApproval?.approved_level || 2}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Submit correspondent options trading authorization request (Level 1: Covered Calls, Level 2: Long Calls/Puts, Level 3: Spreads & Multi-leg).
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Options Level</label>
              <select
                value={requestedLevel}
                onChange={(e) => setRequestedLevel(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
              >
                <option value={1}>Level 1 - Covered Calls & Cash-Secured Puts</option>
                <option value={2}>Level 2 - Long Equity/Option Contracts</option>
                <option value={3}>Level 3 - Spreads, Straddles & Multi-leg Options</option>
              </select>
            </div>

            <button
              onClick={handleRequestOptions}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle size={14} />
              Submit Options Approval Request
            </button>

            {optionsApproval && (
              <div className="p-3 bg-slate-950/60 rounded-lg border border-emerald-500/20 text-xs space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{optionsApproval.status}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Approved Level:</span>
                  <span className="text-yellow-400 font-mono">{optionsApproval.approved_level}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Paths & Document Index */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
            <FileText className="text-cyan-400" size={18} />
            System Paths & Document Index
          </h3>
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
          >
            {showExplorer ? 'Hide Index' : 'Show Index'} ({SYSTEM_PATHS.length} files)
          </button>
        </div>

        {showExplorer && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search system paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {filteredPaths.map((path, idx) => {
                const parts = path.split('/');
                const fileName = parts[parts.length - 1];
                const dir = parts.slice(0, -1).join('/');
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/50 text-xs transition">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="text-slate-500 shrink-0" size={14} />
                      <div className="truncate">
                        <span className="text-slate-200 font-medium">{fileName}</span>
                        {dir && <span className="text-slate-500 text-[10px] block truncate">{dir}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 shrink-0 select-all ml-2">
                      {path}
                    </span>
                  </div>
                );
              })}
              {filteredPaths.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500">
                  No paths match your search query.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlpacaAccountsManager;