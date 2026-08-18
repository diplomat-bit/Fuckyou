import React, { useState, useEffect } from 'react';

interface ComplianceResult {
  transactionId: string;
  isCompliant: boolean;
  violations: string[];
  timestamp: string;
}

interface PipelineProps {
  data: any[];
  onComplete: (results: ComplianceResult[]) => void;
}

const Pipeline03_ComplianceCheck: React.FC<PipelineProps> = ({ data, onComplete }) => {
  const [processing, setProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<ComplianceResult[]>([]);

  const runComplianceCheck = async () => {
    setProcessing(true);
    
    const processedResults: ComplianceResult[] = data.map((tx) => {
      const violations: string[] = [];
      
      // Example Regulatory Logic
      if (tx.amount > 10000) {
        violations.push("AML_THRESHOLD_EXCEEDED");
      }
      if (!tx.kycVerified) {
        violations.push("KYC_MISSING");
      }
      if (tx.jurisdiction === 'restricted') {
        violations.push("SANCTIONED_JURISDICTION");
      }

      return {
        transactionId: tx.id,
        isCompliant: violations.length === 0,
        violations,
        timestamp: new Date().toISOString(),
      };
    });

    setResults(processedResults);
    setProcessing(false);
    onComplete(processedResults);
  };

  useEffect(() => {
    if (data && data.length > 0) {
      runComplianceCheck();
    }
  }, [data]);

  return (
    <div className="pipeline-container">
      <h2>Pipeline 03: Compliance Check</h2>
      {processing ? (
        <p>Verifying regulatory compliance...</p>
      ) : (
        <div>
          <p>Processed {results.length} transactions.</p>
          <ul>
            {results.map((res) => (
              <li key={res.transactionId} style={{ color: res.isCompliant ? 'green' : 'red' }}>
                Tx {res.transactionId}: {res.isCompliant ? 'Compliant' : `Violations: ${res.violations.join(', ')}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Pipeline03_ComplianceCheck;