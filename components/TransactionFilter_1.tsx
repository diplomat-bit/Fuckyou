"use client";

import React, { useState } from "react";

/* =======================
   Types
======================= */

export type TransactionFilters = {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

interface TransactionFilterProps {
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
  resetFilters: () => void;
  logAction: (
    type: string,
    message: string,
    severity: "low" | "medium" | "high"
  ) => void;
}

/* =======================
   Constants
======================= */

const QUANTUM_CATEGORIES = [
  "Food",
  "Travel",
  "Subscriptions",
  "Payroll",
  "Infrastructure",
  "Taxes",
  "Misc",
];

/* =======================
   Component
======================= */

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  filters,
  onApplyFilters,
  resetFilters,
  logAction,
}) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMfaVerified, setIsMfaVerified] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  /* =======================
     AI Handler
  ======================= */

  const handleAiCommand = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setUserInput("");
    setIsAiLoading(true);

    logAction("AI_QUERY", `User asked: "${userInput}"`, "low");

    try {
      const prompt = `
You are the Quantum Financial AI Core.

Current Filter State:
${JSON.stringify(filters, null, 2)}

Available Categories:
${QUANTUM_CATEGORIES.join(", ")}

User Instruction:
"${userInput}"

Respond ONLY in valid JSON:
{
  "response": string,
  "update": object | null,
  "action": "EXPORT" | "MFA_TRIGGER" | "RESET" | null
}

Tone: Elite, Secure, Professional.
Use "Quantum Financial".
`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mfaVerified: isMfaVerified,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI backend error: ${res.status}`);
      }

      const data = await res.json();
      const rawText: string = data.text;

      let aiData: {
        response: string;
        update: TransactionFilters | null;
        action: string | null;
      };

      try {
        aiData = JSON.parse(rawText);
      } catch {
        aiData = {
          response: rawText,
          update: null,
          action: null,
        };
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiData.response,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      if (aiData.update) {
        const newFilters = { ...filters, ...aiData.update };
        onApplyFilters(newFilters);

        logAction(
          "AI_FILTER_UPDATE",
          `AI updated filters: ${JSON.stringify(aiData.update)}`,
          "medium"
        );
      }

      if (aiData.action === "MFA_TRIGGER") {
        setShowMfaModal(true);
      }

      if (aiData.action === "RESET") {
        resetFilters();
      }
    } catch (err) {
      console.error("AI Core Error:", err);

      setChatHistory((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Neural link interrupted. Quantum AI Core is temporarily unavailable.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);

      logAction("AI_FAILURE", "AI backend request failed", "high");
    } finally {
      setIsAiLoading(false);
    }
  };

  /* =======================
     Render
  ======================= */

  return (
    <div className="transaction-filter">
      <h2>Quantum Transaction Filter</h2>

      {/* Chat Window */}
      <div className="chat-window">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
            <div className="timestamp">{msg.timestamp}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          placeholder="Ask Quantum AI to filter transactions…"
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAiCommand()}
          disabled={isAiLoading}
        />
        <button onClick={handleAiCommand} disabled={isAiLoading}>
          {isAiLoading ? "Processing…" : "Send"}
        </button>
      </div>

      {/* MFA Modal */}
      {showMfaModal && (
        <div className="mfa-modal">
          <p>MFA verification required to proceed.</p>
          <button
            onClick={() => {
              setIsMfaVerified(true);
              setShowMfaModal(false);
              logAction("MFA_VERIFIED", "User completed MFA", "medium");
            }}
          >
            Verify MFA
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionFilter;
