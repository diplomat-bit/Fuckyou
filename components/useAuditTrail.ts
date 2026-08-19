

// --- CONSOLIDATED FROM: ./hooks/useAuditTrail.ts ---

import { useCallback, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

export interface AuditLogEntry {
  id?: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  hash: string;
  integrity: 'VERIFIED' | 'TAMPERED' | 'UNVERIFIED';
  previousHash?: string;
}

/**
 * Custom hook for writing to and managing the Forensic Obsidian Ledger.
 */
export const useAuditTrail = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const getLogsInternal = async (): Promise<AuditLogEntry[]> => {
    let mergedLogs: AuditLogEntry[] = [];

    // 1. Try to fetch from Firestore
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const path = `users/${currentUser.uid}/audit_logs`;
        const q = query(collection(db, path), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          mergedLogs.push({ id: doc.id, ...doc.data() } as AuditLogEntry);
        });
      } catch (err) {
        console.warn('[Forensic Obsidian Ledger] Failed to fetch from Firestore:', err);
      }
    }

    // 2. Fetch from LocalStorage
    const localLogs: AuditLogEntry[] = JSON.parse(
      localStorage.getItem('FORENSIC_LEDGER') || '[]'
    );

    // Merge logs by ID to avoid duplicates
    const logMap = new Map<string, AuditLogEntry>();
    mergedLogs.forEach(log => {
      if (log.id) logMap.set(log.id, log);
    });
    localLogs.forEach(log => {
      if (log.id && !logMap.has(log.id)) {
        logMap.set(log.id, log);
      }
    });

    return Array.from(logMap.values());
  };

  const getLogs = useCallback(async (): Promise<AuditLogEntry[]> => {
    const allLogs = await getLogsInternal();
    
    // Verify integrity of the chain
    const verifiedLogs = await verifyChainIntegrity(allLogs);
    
    // Sort descending for UI display (newest first)
    const sortedLogs = verifiedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setLogs(sortedLogs);
    return sortedLogs;
  }, []);

  const logEvent = useCallback(
    async (
      actor: string,
      action: string,
      details: string,
      level: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO'
    ): Promise<AuditLogEntry> => {
      const timestamp = new Date().toISOString();
      
      // Get the last log to find the previous hash
      let lastHash = '';
      const existingLogs = await getLogsInternal();
      if (existingLogs.length > 0) {
        const sorted = [...existingLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        lastHash = sorted[sorted.length - 1].hash;
      }

      const rawPayload = `${timestamp}:${actor}:${action}:${details}:${level}:${lastHash}`;
      const hash = await generateForensicHash(rawPayload);

      const forensicBlock: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        actor,
        action,
        details,
        level,
        hash,
        integrity: 'VERIFIED',
        previousHash: lastHash || undefined
      };

      console.log('[Forensic Obsidian Ledger] Logging Entry:', forensicBlock);

      // 1. Save to Firestore if user is authenticated
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const path = `users/${currentUser.uid}/audit_logs`;
          await addDoc(collection(db, path), forensicBlock);
        } catch (err) {
          console.warn('[Forensic Obsidian Ledger] Failed to save to Firestore, falling back to local storage:', err);
        }
      }

      // 2. Save to LocalStorage
      const localLogs: AuditLogEntry[] = JSON.parse(
        localStorage.getItem('FORENSIC_LEDGER') || '[]'
      );
      localLogs.push(forensicBlock);
      localStorage.setItem('FORENSIC_LEDGER', JSON.stringify(localLogs));

      // 3. Try to post to API as well
      try {
        await fetch('/api/audit/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(forensicBlock)
        });
      } catch (e) {
        // Ignore API failure as we have local and firestore fallbacks
      }

      setLogs(prev => [forensicBlock, ...prev]);
      return forensicBlock;
    },
    []
  );

  const clearLogs = useCallback(async () => {
    localStorage.removeItem('FORENSIC_LEDGER');
    setLogs([]);
    await logEvent('SYSTEM', 'LEDGER_CLEARED', 'Local forensic ledger cache cleared by user.', 'WARNING');
  }, [logEvent]);

  return {
    logs,
    logEvent,
    getLogs,
    clearLogs
  };
};

async function generateForensicHash(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash implementation if Web Crypto API is unavailable
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'fallback-' + Math.abs(hash).toString(16);
}

async function verifyChainIntegrity(logs: AuditLogEntry[]): Promise<AuditLogEntry[]> {
  if (logs.length === 0) return [];

  // Sort ascending to verify from genesis block upwards
  const sorted = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  const verified: AuditLogEntry[] = [];
  let previousHash = '';

  for (const log of sorted) {
    const rawPayload = `${log.timestamp}:${log.actor}:${log.action}:${log.details}:${log.level}:${log.previousHash || ''}`;
    const computedHash = await generateForensicHash(rawPayload);
    
    let integrity: 'VERIFIED' | 'TAMPERED' | 'UNVERIFIED' = 'VERIFIED';

    if (computedHash !== log.hash) {
      integrity = 'TAMPERED';
    } else if (log.previousHash && log.previousHash !== previousHash) {
      integrity = 'TAMPERED';
    }

    verified.push({
      ...log,
      integrity
    });

    previousHash = log.hash;
  }

  return verified;
}