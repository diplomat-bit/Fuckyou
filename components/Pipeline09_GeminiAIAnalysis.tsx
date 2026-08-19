

// --- CONSOLIDATED FROM: ./pipelines/Pipeline09_GeminiAIAnalysis.tsx ---

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BrainCircuit, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalysisResult {
  marketSentiment: string;
  keyTrends: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: string;
}

const Pipeline09_GeminiAIAnalysis: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulated API call to Gemini AI backend service
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setResult({
        marketSentiment: "Bullish",
        keyTrends: ["AI Infrastructure Growth", "Renewable Energy Integration", "Supply Chain Digitization"],
        riskLevel: "Medium",
        recommendation: "Increase exposure to high-growth tech sectors while hedging with energy commodities."
      });
    } catch (err) {
      setError("Failed to connect to Gemini AI analysis engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            Pipeline 09: Gemini AI Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Leverage Gemini AI to process real-time market data and generate actionable strategic insights.
            </p>
            
            <Button 
              onClick={runAnalysis} 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <TrendingUp className="mr-2" />}
              {loading ? "Analyzing Market Data..." : "Run AI Analysis"}
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {result && (
              <div className="mt-6 p-4 border rounded-lg bg-slate-50 space-y-3">
                <h3 className="font-semibold text-lg">Analysis Results</h3>
                <p><strong>Sentiment:</strong> {result.marketSentiment}</p>
                <div>
                  <strong>Key Trends:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {result.keyTrends.map((trend, i) => <li key={i}>{trend}</li>)}
                  </ul>
                </div>
                <p><strong>Risk Level:</strong> <span className={`font-bold ${result.riskLevel === 'High' ? 'text-red-600' : 'text-green-600'}`}>{result.riskLevel}</span></p>
                <p className="italic text-gray-700 border-t pt-2">"{result.recommendation}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pipeline09_GeminiAIAnalysis;