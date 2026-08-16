import { useState, useEffect } from 'react';
import { ArrowRightLeft, Layers, CornerDownRight, CheckCircle2, RefreshCw, Folder, FileText, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { alpacaJournalsService } from '../../services/AlpacaJournalsService';
import { AlpacaJournal } from '../../services/AlpacaBrokerService';

const systemPaths = [
  {
    name: "00_Master_Compiled_Executive_Order",
    children: [
      "Chapter_01_The_Citibank_Lobby.md",
      "Chapter_02_The_EAC_Briefing.md",
      "Chapter_03_The_DHS_Server_Room.md",
      "Chapter_04_The_Military_Fund_Audit.md",
      "Chapter_05_The_Geneva_Account.md",
      "Chapter_06_The_Task_Force_Confrontation.md",
      "Chapter_07_The_Mobile_Verification_Launch.md",
      "Dossier_01_UCC_Financial_Loophole.md",
      "Dossier_02_SAVE_API_Vulnerabilities.md",
      "Dossier_03_Iran_Framework_Compliance.md",
      "Dossier_04_Military_Fund_Allocation.md",
      "Dossier_05_DNA_Testing_Consular_Protocols.md",
      "Dossier_06_Voter_Roll_Purge_Metrics.md",
      "Dossier_07_Tribal_Liaison_Integration.md",
      "Dossier_08_Paperwork_Reduction_Exemption.md",
      "Dossier_09_Private_Right_of_Action.md",
      "Dossier_10_Department_of_War_Archival_Access.md",
      "Dossier_11_Mobile_Unit_Deployment_Logistics.md",
      "Dossier_12_Task_Force_Sunset_Procedures.md",
      "Dossier_13_Vector_Collapse_Protocol.md",
      "Dossier_14_Citibank_Demo_Business_Structure.md"
    ]
  },
  {
    name: "Combined_sLegislative_Bill",
    children: [
      "chapters/chapter_01_the_loophole.md",
      "chapters/chapter_02_political_decay.md",
      "chapters/chapter_03_the_decision.md",
      "characters/antagonist_leverage_analysis.md",
      "characters/protagonist_profile.md",
      "dossiers/iranian_cyber_threat_matrix.md",
      "dossiers/mtls_ai_bank_architecture.md",
      "dossiers/sovereign_id_cryptography.md",
      "narrative/scene_01_banking_loophole.md",
      "narrative/scene_02_bureaucratic_signing.md",
      "narrative/scene_03_system_failure.md",
      "narrative/scene_04_political_decay.md",
      "narrative/scene_05_corruption_observation.md",
      "narrative/scene_06_threats_closing_in.md",
      "narrative/scene_07_high_stakes_decision.md",
      "narrative/scene_08_antagonist_pushout.md",
      "narrative/scene_09_real_time_execution.md",
      "technical/database_synchronization_protocol.md",
      "technical/hardware_secure_element_spec.md",
      "technical/zero_knowledge_proofs_spec.md",
      "worldbuilding/department_of_war_archives_spec.md",
      "worldbuilding/reconciliation_3_0_framework.md",
      "worldbuilding/thirty_five_sectors_analysis.md"
    ]
  },
  {
    name: "Google",
    children: [
      "AuthManager.ts",
      "AutoScaler.ts",
      "BackupService.ts",
      "BigQueryEmulator.ts",
      "BillingTracker.ts",
      "CDNReplacement.ts",
      "CloudFunctionsShim.ts",
      "CloudReplacementEngine.ts",
      "ComputeOrchestrator.ts",
      "DatabaseBridge.ts",
      "DeploymentPipeline.ts",
      "IAMPolicyEngine.ts",
      "MonitoringService.ts",
      "NetworkGateway.ts",
      "PubSubLocal.ts",
      "SecretVault.ts",
      "ServiceMesh.ts",
      "StorageAbstraction.ts",
      "VertexAIProxy.ts",
      "VpcManager.ts"
    ]
  },
  {
    name: "api",
    children: [
      "AppRegistry/AppBillingBridge.ts",
      "AppRegistry/AppDependencyResolver.ts",
      "AppRegistry/AppLifecycleManager.ts",
      "AppRegistry/AppManifestParser.ts",
      "AppRegistry/AppMetadataAggregator.ts",
      "AppRegistry/AppPermissionEngine.ts",
      "AppRegistry/AppRegistryOrchestrator.ts",
      "AppRegistry/AppWebhookDispatcher.ts",
      "AppRegistry/config/EcosystemConfig.ts",
      "AppRegistry/index.ts",
      "AppRegistry/middleware/AppRegistryAuth.ts",
      "AppRegistry/routes/AppRegistryRoutes.ts",
      "AppRegistry/services/AppDeploymentService.ts",
      "AppRegistry/services/AppIntegrationsBridge.ts",
      "AppRegistry/services/AppMetricsCollector.ts",
      "AppRegistry/services/AppStorageVault.ts",
      "AppRegistry/types/AppManifest.ts",
      "AppRegistry/types/AppRuntime.ts",
      "AppRegistry/utils/AppSecurityAuditor.ts",
      "AppRegistry/utils/ManifestValidator.ts",
      "Obama Opts Out Of Public Financing (1)/section10_sovereign_wealth_fund_527.ts",
      "Obama Opts Out Of Public Financing (1)/section1_obama_public_financing.ts",
      "Obama Opts Out Of Public Financing (1)/section2_bear_stearns_arrests.ts",
      "Obama Opts Out Of Public Financing (1)/section3_spaceflight_kosmos.ts",
      "Obama Opts Out Of Public Financing (1)/section4_citi_connection_contagion.ts",
      "Obama Opts Out Of Public Financing (1)/section5_goldman_sachs_downgrade.ts",
      "Obama Opts Out Of Public Financing (1)/section6_cfo_gary_crittenden.ts",
      "Obama Opts Out Of Public Financing (1)/section7_structured_products_basket.ts",
      "Obama Opts Out Of Public Financing (1)/section8_the_toast_email.ts",
      "Obama Opts Out Of Public Financing (1)/section9_citibank_demo_business.ts",
      "PortalDiagnostics/DependencyGraph.ts",
      "PortalDiagnostics/DiagnosticsOrchestrator.ts",
      "PortalDiagnostics/ErrorReporter.ts",
      "PortalDiagnostics/HealthCheckService.ts",
      "PortalDiagnostics/LogAnalyzer.ts",
      "PortalDiagnostics/PerformanceMonitor.ts",
      "PortalDiagnostics/SecurityScanner.ts",
      "PortalDiagnostics/TelemetryCollector.ts",
      "PortalDiagnostics/config/DiagnosticConfig.ts",
      "PortalDiagnostics/index.ts",
      "PortalDiagnostics/middleware/DiagnosticAuth.ts",
      "PortalDiagnostics/routes/DiagnosticRoutes.ts",
      "PortalDiagnostics/services/AuthDiagnostics.ts",
      "PortalDiagnostics/services/DatabaseDiagnostics.ts",
      "PortalDiagnostics/services/IntegrationDiagnostics.ts",
      "PortalDiagnostics/services/NetworkDiagnostics.ts",
      "PortalDiagnostics/types/DiagnosticReport.ts",
      "PortalDiagnostics/types/SystemStatus.ts",
      "PortalDiagnostics/utils/AlertDispatcher.ts",
      "PortalDiagnostics/utils/Formatters.ts",
      "acquisitions.ts",
      "ai.ts",
      "alpaca.ts",
      "alpacaCollateral.ts",
      "azure.ts",
      "azureGovCompliance.ts",
      "citi.ts",
      "config.ts",
      "crypto-strategy.ts",
      "fapi.ts",
      "google-chat.ts",
      "government-gateway.ts",
      "index.ts",
      "middleware/auths.ts",
      "middleware/rateLimiter.ts",
      "modern-treasury.ts",
      "order/order_01_02.md",
      "order/order_03_04.md",
      "order/order_05_06.md",
      "order/order_07_08.md",
      "order/order_09_10.md",
      "order/order_11_12.md",
      "order/order_13_14.md",
      "order/order_15_16.md",
      "order/order_17_18.md",
      "order/order_19_20.md",
      "order/order_21_22.md",
      "order/order_23_24.md",
      "order/order_25_26.md",
      "order/order_27_28.md",
      "order/order_29_30.md",
      "order/order_31_32.md",
      "order/order_33_34.md",
      "order/order_35_36.md",
      "order/order_37_38.md",
      "order/order_39_40.md",
      "order/order_41_42.md",
      "order/order_43_44.md",
      "order/section1_digital_asset_and_cybersecurity.ts",
      "order/section2_ledger_framework_and_arbitrage.ts",
      "order/section3_consensus_and_fapi_conformance.ts",
      "order/section4_quantum_secured_and_revocation.ts",
      "plaid.ts",
      "real-estate.ts",
      "routes/acquisitions-orchestrator.ts",
      "routes/admin.ts",
      "routes/audit.ts",
      "routes/collateral.ts",
      "routes/identity.ts",
      "routes/market.ts",
      "routes/notifications.ts",
      "routes/treasury.ts",
      "routes/webhooks.ts",
      "sovereign.ts",
      "stripe.ts",
      "tax-liens.ts",
      "tqqq-strategy.ts",
      "types/sovereign.ts",
      "utils/ai-agent-factory.ts",
      "utils/complianceEngine.ts",
      "utils/crypto-bridge.ts",
      "utils/geo-spatial.ts",
      "utils/ledgerSync.ts",
      "utils/logger.ts",
      "utils/math-engine.ts",
      "utils/vault.ts"
    ]
  },
  {
    name: "apps",
    children: [
      "audit_compliance_tracker/app.py",
      "azure_ad_app_auditor/app.py",
      "b2b_audit_trail_generator/app.py",
      "b2b_cash_flow_stress_tester/app.py",
      "b2b_corporate_liquidity_forecaster/app.py",
      "b2b_interest_rate_optimizer/app.py",
      "b2b_portfolio_wealth_analyzer/app.py",
      "b2b_routing_decryptor_validator/app.py",
      "b2b_routing_number_resolver/app.py",
      "b2b_transaction_categorizer/app.py",
      "balance_transfer_analytics_dashboard/app.py",
      "balance_transfer_batch_scheduler/app.py",
      "balance_transfer_calculator/app.py",
      "balance_transfer_compliance_auditor/app.py",
      "balance_transfer_disbursement_orchestrator/app.py",
      "balance_transfer_eligibility_checker/app.py",
      "balance_transfer_interest_simulator/app.py",
      "balance_transfer_lead_generator/app.py",
      "broker_compliance_trade_auditor/app.py",
      "broker_order_execution_simulator/app.py",
      "camt053_balance_reconciler/app.py",
      "camt053_balance_reconciler/reconciler.py",
      "camt053_mock_generator/app.py",
      "camt053_mock_generator/generator.py",
      "camt053_shared/models.py",
      "camt053_statement_parser/app.py",
      "camt053_statement_parser/utils.py",
      "camt053_transaction_exporter/app.py",
      "camt053_transaction_exporter/exporter.py",
      "card_activation_simulator/app.py",
      "card_function_access_controller/app.py",
      "card_lifecycle_compliance_checker/app.py",
      "card_listing_mock_server/app.py",
      "card_merchant_category_classifier/app.py",
      "card_outstanding_balance_tracker/app.py",
      "card_pin_hasher_validator/app.py",
      "card_spend_limit_manager/app.py",
      "card_test_suite_conformance_analyzer/app.py",
      "card_tokenization_service/app.py",
      "citi_account_anomaly_detector/app.py",
      "citi_account_excel_parser/app.py",
      "citi_account_interest_accrual_simulator/app.py",
      "citi_account_kyc_risk_profiler/app.py",
      "citiconnect_integration_gateway/app.py",
      "citizenship_verification_gateway/app.py",
      "credit_card_simulator/app.py",
      "credit_limit_utilization_monitor/app.py",
      "credit_risk_analyzer/app.py",
      "cross_cloud_federation_manager/app.py",
      "cvv_decryption_mock_service/app.py",
      "election_integrity_dashboard/app.py",
      "fedramp_compliance_monitor/app.py",
      "financial_regulatory_guardrail/app.py",
      "financial_statement_verifier/app.py",
      "github_audit_sync_agent/app.py",
      "military_fund_allocator/app.py",
      "multi_currency_balance_consolidator/app.py",
      "pqc_crypto_bridge_simulator/app.py",
      "schema_catalog_custom_registry/app.py",
      "schema_catalog_search_engine/app.py",
      "schema_conformance_audit_tool/app.py",
      "schema_validator_orchestrator/app.py",
      "service_principal_provisioner/app.py",
      "statement_reconciliation_portal/app.py",
      "supplementary_card_orchestrator/app.py",
      "treasury_reconciliation_engine/app.py",
      "voter_registration_portal/app.py"
    ]
  },
  {
    name: "clarity",
    children: [
      "part01_legislative_intent.ts",
      "part02_definitions_registry.ts",
      "part03_sec_cftc_jurisdiction.ts",
      "part04_decentralization_certification.ts",
      "part05_digital_commodity_exchanges.ts",
      "part06_broker_dealer_requirements.ts",
      "part07_stablecoin_issuance_framework.ts",
      "part08_market_manipulation_prevention.ts",
      "part09_customer_protection_custody.ts",
      "part10_clearing_settlement_protocols.ts",
      "part11_international_coordination.ts",
      "part12_anti_money_laundering_kyc.ts",
      "part13_tax_reporting_compliance.ts",
      "part14_smart_contract_auditing.ts",
      "part15_disclosure_requirements.ts",
      "part16_alpaca_integration_bridge.ts",
      "part17_citi_sovereign_ledger_bridge.ts",
      "part18_modern_treasury_settlement.ts",
      "part19_crypto_strategy_validator.ts",
      "part20_compliance_audit_trail.ts",
      "part21_risk_assessment_matrix.ts",
      "part22_government_gateway_reporting.ts",
      "part23_tokenization_compliance_engine.ts",
      "part24_ai_compliance_agent.ts",
      "part25_system_orchestrator.ts"
    ]
  },
  {
    name: "components",
    children: [
      "AIAdStudioView.tsx",
      "AIAdStudioView.tsx.md",
      "AIAdvisorView.tsx",
      "AIAdvisorView.tsx.md",
      "AIInsights.tsx",
      "AIInsights.tsx.md",
      "APIIntegrationView.tsx",
      "APIIntegrationView.tsx.md",
      "APIKeysView.tsx",
      "AdministrationAudit.tsx",
      "AlpacaBrokerView.tsx",
      "AquariusArchitectView.tsx",
      "AquariusAuditorView.tsx",
      "AquariusCreativeSuite.tsx",
      "AquariusDashboard.tsx",
      "AquariusGhostView.tsx",
      "AquariusInstitutionalHub.tsx",
      "AquariusLiveVoice.tsx",
      "AriaComms.tsx",
      "AstraDBQuickstart.tsx",
      "AzureAppsView.tsx",
      "AzureAppsView.tsx.md",
      "BalanceSummary.tsx",
      "BalanceSummary.tsx.md",
      "BillingIdentityView.tsx",
      "BudgetsView.tsx",
      "BudgetsView.tsx.md",
      "Card.tsx",
      "Card.tsx.md",
      "CardCustomizationView.tsx",
      "CardCustomizationView.tsx.md",
      "CitiConnectInitiation.tsx",
      "CitiConnectInquiry.tsx",
      "CitiConnectNotifications.tsx",
      "CitiDecryptionUtility.tsx",
      "CitiGateway.tsx",
      "CitiPartnerHub.tsx",
      "CitiSovereignLedger.tsx",
      "CitiTreasuryHub.tsx",
      "CitiUkInternationalPayments.tsx",
      "ContractorLobbyingList.tsx",
      "CorporateCommandView.tsx",
      "CreditHealthView.tsx",
      "CryptoView.tsx",
      "CryptoView.tsx.md",
      "Dashboard.tsx",
      "Dashboard.tsx.md",
      "DataIngestView.tsx",
      "DeveloperView.tsx",
      "EntraSwarmManager.tsx",
      "ErrorBoundary.tsx",
      "FeaturePalette.tsx",
      "FinancialDemocracyView.tsx",
      "FinancialGoalsView.tsx",
      "FleetAppView.tsx",
      "FleetAppView.tsx.md",
      "FloridaVoterView.tsx",
      "FlowController.tsx",
      "FlowController.tsx.md",
      "GasPriceCorrelation.tsx",
      "GcpInventoryView.tsx",
      "GeminiKeyModal.tsx",
      "GeminiLivePortal.tsx",
      "GlobalLedgerView.tsx",
      "GoalsView.tsx",
      "GoalsView.tsx.md",
      "GriffinMcpView.tsx",
      "GrowthNexus.tsx",
      "Header.tsx",
      "Header.tsx.md",
      "HoKTokenMint.tsx",
      "IdentityCitadelView.tsx",
      "IdentityCitadelView.tsx.md",
      "ImpactTracker.tsx",
      "ImpactTracker.tsx.md",
      "ImpeachmentGenerator.tsx",
      "InjusticeDashboard.tsx",
      "IntegrationsMarketplaceView.tsx",
      "IntelligenceHubView.tsx",
      "InvestmentPortfolio.tsx",
      "InvestmentPortfolio.tsx.md",
      "InvestmentsPortfolio.tsx",
      "InvestmentsView.tsx",
      "InvestmentsView.tsx.md",
      "JweJwsVerifier.tsx",
      "KryptoBridgeWidget.tsx",
      "MachineView.tsx",
      "MarketingAutomationView.tsx",
      "MarketplaceView.tsx",
      "ModernTreasuryLedgerHub.tsx",
      "NFCValidator.tsx",
      "NeuralToolsView.tsx",
      "NexusBuilder.tsx",
      "OFXStatementViewer.tsx",
      "OpenBankingFapiView.tsx",
      "OpenBankingView.tsx"
    ]
  },
  {
    name: "Root Files",
    children: [
      "App.tsx",
      "Book/Ok.md",
      "IMG_5610.webp",
      "LICENSE",
      "README.md",
      "README_v2.md",
      "TRUST.md",
      "book/Ok",
      "bun.lock",
      "check_sql.ts"
    ]
  }
];

export const AlpacaJournalsView: React.FC = () => {
  const [journals, setJournals] = useState<AlpacaJournal[]>([]);
  const [loading, setLoading] = useState(false);

  // Single journal state
  const [fromAccount, setFromAccount] = useState('FIRM_CORRESPONDENT_OMNIBUS');
  const [toAccount, setToAccount] = useState('b9b19618-22dd-4e80-8432-fc9e1ba0b27d');
  const [amount, setAmount] = useState('25000.00');
  const [entryType, setEntryType] = useState<'JNLC' | 'JNLS'>('JNLC');
  const [description, setDescription] = useState('Sovereign Journal Re-allocation');
  const [statusMsg, setStatusMsg] = useState('');

  // Path Explorer state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '00_Master_Compiled_Executive_Order': true
  });

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    setLoading(true);
    try {
      const list = await alpacaJournalsService.getJournals();
      setJournals([...list]);
    } catch (err: any) {
      console.error('Failed to load journals:', err);
      setStatusMsg(`Error loading journals: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSingle = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const j = await alpacaJournalsService.createSingleJournal(fromAccount, toAccount, amount, entryType, description);
      setStatusMsg(`Journal Executed: ${j.entry_type} $${j.amount} -> Account ${j.to_account.slice(0, 8)}... (ID: ${j.id})`);
      loadJournals();
    } catch (err: any) {
      console.error('Failed to execute single journal:', err);
      setStatusMsg(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBatch = async () => {
    setLoading(true);
    setStatusMsg('');
    try {
      const entries = [
        { to_account: 'b9b19618-22dd-4e80-8432-fc9e1ba0b27d', amount: '10000.00', description: 'Batch 1-to-Many Sub-Vault Alpha' },
        { to_account: '8f8c8cee-2591-4f83-be12-82c659b5e748', amount: '15000.00', description: 'Batch 1-to-Many Sub-Vault Beta' }
      ];
      const res = await alpacaJournalsService.createBatchJournal(fromAccount, entries);
      setStatusMsg(`Batch Journal Executed: ${res.length} accounts credited simultaneously`);
      loadJournals();
    } catch (err: any) {
      console.error('Failed to execute batch journal:', err);
      setStatusMsg(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const filteredPaths = systemPaths.map(folder => {
    const filteredChildren = folder.children.filter(child =>
      child.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...folder,
      children: filteredChildren
    };
  }).filter(folder => folder.children.length > 0);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between bg-slate-900/80 p-5 rounded-xl border border-cyan-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <ArrowRightLeft className="text-cyan-400" size={24} />
            Alpaca Sovereign Journal Engine (JNLC & JNLS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Single, Batch 1-to-Many, and Reverse Batch Many-to-1 Atomic Ledger Movement
          </p>
        </div>
        <button
          onClick={loadJournals}
          disabled={loading}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300 transition flex items-center gap-2 text-xs"
          title="Refresh Journals"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Journal Creation Panel */}
        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
            <Layers className="text-yellow-400" size={18} />
            Journal Dispatch Form
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Journal Entry Type</label>
              <select
                value={entryType}
                onChange={(e: any) => setEntryType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="JNLC">JNLC - Move Cash (Instant Liquidity)</option>
                <option value="JNLS">JNLS - Move Shares (Asset Transfer)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Source Account / Vault</label>
              <input
                type="text"
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Destination Account / Vault</label>
              <input
                type="text"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Amount / Quantity</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Description / Audit Ref</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleExecuteSingle}
                disabled={loading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Single Journal
              </button>
              <button
                onClick={handleExecuteBatch}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold py-2.5 rounded-lg text-xs border border-yellow-500/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <CornerDownRight size={14} />
                Batch (1-to-Many)
              </button>
            </div>

            {statusMsg && (
              <div className="p-3 bg-slate-950 rounded border border-cyan-500/30 text-xs text-cyan-300 font-mono break-all">
                {statusMsg}
              </div>
            )}
          </div>
        </div>

        {/* Live Journals Log Table */}
        <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-semibold text-slate-200 border-b border-slate-800 pb-3 text-sm flex items-center gap-2">
            <ArrowRightLeft className="text-emerald-400" size={18} />
            Ledger Audit Stream ({journals.length})
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {journals.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No journals found. Execute a journal or click refresh.
              </div>
            ) : (
              journals.map((j) => (
                <div key={j.id} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-yellow-400">{j.entry_type} | ${j.amount}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      {j.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <span className="text-slate-300 truncate max-w-[120px]">{j.from_account}</span>
                    <span>&rarr;</span>
                    <span className="text-cyan-400 truncate max-w-[120px]">{j.to_account}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">{j.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sovereign System Path Explorer */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <Folder className="text-cyan-400" size={18} />
            Sovereign System Path Explorer
          </h3>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search system paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1 text-xs">
          {filteredPaths.map((folder) => {
            const isExpanded = !!expandedFolders[folder.name];
            return (
              <div key={folder.name} className="bg-slate-950/40 rounded-lg border border-slate-800/60 p-3 space-y-2">
                <button
                  onClick={() => toggleFolder(folder.name)}
                  className="flex items-center justify-between w-full text-left font-semibold text-slate-300 hover:text-cyan-400 transition"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Folder size={14} className="text-yellow-500 shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </span>
                  <span className="text-slate-500 shrink-0">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pl-3 border-l border-slate-800/80 space-y-1.5 pt-1">
                    {folder.children.map((child) => (
                      <div key={child} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition font-mono text-[11px] py-0.5 truncate" title={child}>
                        <FileText size={12} className="text-slate-600 shrink-0" />
                        <span className="truncate">{child}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AlpacaJournalsView;
