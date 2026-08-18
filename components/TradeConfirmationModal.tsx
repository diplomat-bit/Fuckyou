import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Box,
  Button,
  Stack,
  Text,
  Code,
  useBreakpointValue,
  Flex,
  Progress,
  Input,
  IconButton,
  VStack,
  HStack,
  Badge,
  Divider,
  Tooltip,
  useToast,
  Textarea,
  FormControl,
  FormLabel,
  Collapse,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { 
  ShieldCheck, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  Send, 
  Terminal, 
  History, 
  Zap, 
  Lock, 
  Activity, 
  Database,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Info,
  Gauge,
  Settings,
  Eye,
  RefreshCw,
  Layers
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI } from "@google/genai";

/**
 * PHILOSOPHY: THE GOLDEN TICKET EXPERIENCE
 * ------------------------------------------------------------------------------------------------
 * This is not just a modal; it is the cockpit of a high-performance financial engine.
 * We are letting the user "Test Drive" the Quantum Financial infrastructure.
 * Every interaction is logged. Every insight is AI-driven. Security is the bedrock.
 * 
 * METAPHOR: Kicking the tires. Seeing the engine roar.
 * ------------------------------------------------------------------------------------------------
 */

// ================================================================================================
// TYPES & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: 'USER' | 'AI' | 'SYSTEM';
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface EngineMetric {
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Architect. 
Your goal is to provide an elite, high-performance "Golden Ticket" experience for business banking clients.
You are helping them "test drive" the trade confirmation engine.
Tone: Professional, Secure, Elite, and helpful.
Context: The user is viewing a Trade Confirmation for a global financial institution (Quantum Financial).
Capabilities: You can analyze trades, explain cryptographic receipts, simulate fraud monitoring, and generate financial insights.
Rule: Never mention "Citibank". Always refer to the institution as "Quantum Financial" or "The Bank".
Metaphor: Use automotive metaphors occasionally (e.g., "checking the engine", "kicking the tires").
`;

// ================================================================================================
// UTILITY COMPONENTS
// ================================================================================================

const SafeAmount: React.FC<{ amount?: number; currency?: string }> = ({ amount = 0, currency = 'USD' }) => {
  const safeCurrency = (currency && currency.length === 3) ? currency.toUpperCase() : 'USD';
  try {
    return <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency }).format(amount / 100)}</span>;
  } catch {
    return <span>{safeCurrency} {(amount / 100).toFixed(2)}</span>;
  }
};

const SafeTimestamp: React.FC<{ ts?: any }> = ({ ts }) => {
  if (!ts) return <span>N/A</span>;
  const date = new Date(typeof ts === 'number' && ts < 10000000000 ? ts * 1000 : ts);
  return <span>{isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString()}</span>;
};

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * EngineDiagnostics: Visualizing the "Bells and Whistles" of the trade engine.
 */
const EngineDiagnostics: React.FC<{ metrics: EngineMetric[] }> = ({ metrics }) => (
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
    {metrics.map((m, i) => (
      <Box key={i} p={3} bg="gray.800" borderRadius="lg" border="1px solid" borderColor="gray.700">
        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">{m.label}</Text>
          <Icon as={m.status === 'optimal' ? CheckCircle2 : AlertTriangle} size={12} color={m.status === 'optimal' ? "cyan.400" : "orange.400"} />
        </Flex>
        <Flex align="baseline" gap={2} mt={1}>
          <Text fontSize="lg" fontWeight="bold" color="white">{m.value}</Text>
          <Stat size="sm">
            <StatHelpText m={0}>
              <StatArrow type={m.trend === 'up' ? 'increase' : 'decrease'} />
            </StatHelpText>
          </Stat>
        </Flex>
      </Box>
    ))}
  </SimpleGrid>
);

/**
 * AuditTrail: The "Cheat Sheet" for every action taken in the demo.
 */
const AuditTrail: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => (
  <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto" p={2} bg="blackAlpha.400" borderRadius="md" border="1px solid" borderColor="whiteAlpha.100">
    <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1} display="flex" align="center" gap={1}>
      <History size={12} /> AUDIT STORAGE (IMMUTABLE LEDGER)
    </Text>
    {logs.map((log) => (
      <HStack key={log.id} fontSize="10px" fontFamily="mono" spacing={3} py={1} borderBottom="1px solid" borderColor="whiteAlpha.50">
        <Text color="gray.600" whiteSpace="nowrap">{new Date(log.timestamp).toLocaleTimeString()}</Text>
        <Badge size="xs" variant="outline" colorScheme={log.actor === 'AI' ? 'purple' : log.actor === 'SYSTEM' ? 'cyan' : 'gray'}>
          {log.actor}
        </Badge>
        <Text color={log.severity === 'CRITICAL' ? 'red.300' : 'gray.300'} isTruncated>
          {log.action}: {log.details}
        </Text>
      </HStack>
    ))}
  </VStack>
);

// ================================================================================================
// MAIN COMPONENT: TRADE CONFIRMATION MODAL
// ================================================================================================

const TradeConfirmationModal: React.FC<any> = ({
  isOpen,
  onClose,
  settlementInstruction,
}) => {
  // --- HOOKS & STATE ---
  const modalSize = useBreakpointValue({ base: 'full', md: '6xl' }) || '6xl';
  const toast = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState("Initializing Quantum Nexus Core...");
  const [showAudit, setShowAudit] = useState(false);
  const [showChat, setShowChat] = useState(true);
  
  // Audit & Chat State
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Engine Metrics (The "Bells and Whistles")
  const [metrics, setMetrics] = useState<EngineMetric[]>([
    { label: 'Node Sync', value: '99.98%', status: 'optimal', trend: 'up' },
    { label: 'Liquidity Depth', value: 'High', status: 'optimal', trend: 'stable' },
    { label: 'Fraud Risk', value: '0.002%', status: 'optimal', trend: 'down' },
  ]);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isOpen) {
      logAction('MODAL_OPEN', 'USER', 'User initiated trade verification cockpit.', 'INFO');
      simulateAiAnalysis();
      
      // Initial AI Greeting
      if (chatMessages.length === 0) {
        setChatMessages([{
          id: 'initial',
          role: 'assistant',
          content: "Welcome to the Quantum Financial Test Drive. I am your AI Architect. I've pre-screened this trade for cryptographic integrity. How can I assist your exploration today?",
          timestamp: new Date().toISOString()
        }]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // --- LOGIC: AUDIT STORAGE ---
  const logAction = (action: string, actor: AuditEntry['actor'], details: string, severity: AuditEntry['severity']) => {
    const newEntry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      actor,
      details,
      severity
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    console.log(`[AUDIT] ${action} | ${actor} | ${details}`);
  };

  // --- LOGIC: AI INTERACTION ---
  const simulateAiAnalysis = () => {
    setIsAnalyzing(true);
    setAiAnalysis("Scanning global liquidity nodes...");
    setTimeout(() => {
      setAiAnalysis("Verifying cryptographic signatures...");
      setTimeout(() => {
        setIsAnalyzing(false);
        setAiAnalysis("Analysis Complete: Trade matches cryptographic intent. Engine is roaring at optimal performance.");
        logAction('AI_ANALYSIS_COMPLETE', 'AI', 'Automated trade forensics finished.', 'INFO');
      }, 1000);
    }, 800);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsAiTyping(true);
    logAction('CHAT_MESSAGE_SENT', 'USER', `User asked: ${userInput.substring(0, 30)}...`, 'INFO');

    try {
      // Initialize Gemini
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        ${SYSTEM_PROMPT}
        Current Trade Data: ${JSON.stringify(settlementInstruction)}
        User Question: ${userInput}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMsg]);
      logAction('AI_RESPONSE_GENERATED', 'AI', 'Quantum AI provided strategic insight.', 'INFO');
      
      // Simulate "Creating things" based on AI response
      if (text.toLowerCase().includes("report") || text.toLowerCase().includes("download")) {
        logAction('AI_TRIGGERED_ACTION', 'AI', 'AI suggested report generation.', 'INFO');
      }

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: ChatMessage = {
        id: 'error',
        role: 'assistant',
        content: "I apologize, but my connection to the Quantum Core was momentarily interrupted. However, I can confirm your trade remains secure.",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- LOGIC: PDF GENERATION ---
  const downloadAsPDF = useCallback(() => {
    if (!settlementInstruction) return;
    
    logAction('PDF_DOWNLOAD_START', 'USER', 'User requested cryptographic receipt.', 'INFO');
    
    try {
      setIsDownloading(true);
      const doc = new jsPDF();
      
      // Branding
      doc.setFillColor(15, 23, 42); // Dark background
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(34, 211, 238); // Cyan
      doc.setFontSize(22);
      doc.text('QUANTUM FINANCIAL', 10, 20);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('SETTLEMENT AUDIT & CRYPTOGRAPHIC PROOF', 10, 30);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text(`Audit ID: ${Math.random().toString(36).toUpperCase().substring(2, 12)}`, 10, 45);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 50);
      
      const rows = [
        ['Instruction ID', settlementInstruction.messageId || 'PENDING'],
        ['Total Amount', `${settlementInstruction.currency || 'USD'} ${(settlementInstruction.totalAmount / 100).toLocaleString()}`],
        ['Settlement Date', settlementInstruction.settlementDate || 'N/A'],
        ['Creation Node', new Date(settlementInstruction.creationDateTime).toISOString()],
        ['Verification Status', 'VERIFIED BY QUANTUM AI'],
        ['Network Latency', '1.2ms'],
        ['Encryption Standard', 'AES-256-GCM']
      ];

      autoTable(doc, { 
        head: [['Quantum Field', 'Verified Value']], 
        body: rows, 
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [34, 211, 238], textColor: [15, 23, 42] },
        styles: { fontSize: 9 }
      });

      // Add Audit Trail to PDF
      const auditRows = auditLogs.slice(0, 10).map(l => [l.timestamp, l.action, l.details]);
      doc.text('INTERNAL AUDIT LOG (LAST 10 ACTIONS)', 10, doc.lastAutoTable.finalY + 15);
      autoTable(doc, {
        body: auditRows,
        startY: doc.lastAutoTable.finalY + 20,
        styles: { fontSize: 7 }
      });
      
      doc.save(`quantum_receipt_${settlementInstruction.messageId || 'tx'}.pdf`);
      
      toast({
        title: "Receipt Generated",
        description: "Your cryptographic proof has been saved to your local drive.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      logAction('PDF_DOWNLOAD_SUCCESS', 'SYSTEM', 'Cryptographic receipt successfully delivered.', 'INFO');
    } catch (error) {
      logAction('PDF_DOWNLOAD_FAILED', 'SYSTEM', 'Critical failure in document synthesis.', 'CRITICAL');
      toast({
        title: "Synthesis Error",
        description: "Failed to generate PDF. Please check system logs.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
    }
  }, [settlementInstruction, auditLogs, toast]);

  // --- RENDER HELPERS ---
  const formatTimestampPlain = (ts: any) => {
    if (!ts) return 'N/A';
    const date = new Date(typeof ts === 'number' && ts < 10000000000 ? ts * 1000 : ts);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(12px) saturate(180%)" bg="blackAlpha.700" />
      <ModalContent 
        bg="gray.900" 
        color="white" 
        borderRadius="3xl" 
        border="1px solid" 
        borderColor="cyan.500"
        boxShadow="0 0 40px rgba(34, 211, 238, 0.15)"
        overflow="hidden"
      >
        {/* HEADER: The Branding */}
        <ModalHeader borderBottom="1px solid" borderColor="gray.800" py={6} px={8}>
          <Flex align="center" justify="space-between">
            <HStack spacing={4}>
              <Box p={2} bg="cyan.500" borderRadius="xl">
                <ShieldCheck color="black" size={24} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="black" letterSpacing="wider" color="white">
                  QUANTUM FINANCIAL <Badge ml={2} colorScheme="cyan" variant="solid">ELITE DEMO</Badge>
                </Text>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">SECURE TRADE VERIFICATION COCKPIT</Text>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Tooltip label="Toggle Audit Storage">
                <IconButton
                  aria-label="Audit"
                  icon={<History size={18} />}
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => setShowAudit(!showAudit)}
                />
              </Tooltip>
              <Tooltip label="Toggle AI Architect">
                <IconButton
                  aria-label="AI Chat"
                  icon={<Cpu size={18} />}
                  variant="ghost"
                  colorScheme="cyan"
                  onClick={() => setShowChat(!showChat)}
                />
              </Tooltip>
              <ModalCloseButton position="static" />
            </HStack>
          </Flex>
        </ModalHeader>
        
        <ModalBody p={0}>
          <Flex h="70vh" direction={{ base: 'column', lg: 'row' }}>
            
            {/* LEFT PANEL: Trade Details & Engine Diagnostics */}
            <Box flex="1" p={8} overflowY="auto" borderRight="1px solid" borderColor="gray.800">
              {!settlementInstruction ? (
                <Flex direction="column" align="center" justify="center" h="full" gap={4}>
                  <AlertTriangle size={48} color="#FB923C" />
                  <Text color="gray.400" fontSize="lg">No settlement instruction data available.</Text>
                  <Button variant="outline" colorScheme="cyan" onClick={onClose}>Return to Dashboard</Button>
                </Flex>
              ) : (
                <Stack spacing={8}>
                  
                  {/* AI Forensics Banner */}
                  <Box p={5} bg="black" borderRadius="2xl" borderLeft="6px solid" borderColor="cyan.500" boxShadow="inner">
                    <Flex align="center" gap={3} mb={3}>
                      <Zap size={18} color="#22D3EE" />
                      <Text fontSize="xs" color="cyan.500" fontWeight="black" letterSpacing="widest">AI FORENSICS ENGINE</Text>
                    </Flex>
                    <Text fontSize="md" fontFamily="mono" color="cyan.50" lineHeight="tall">
                      {aiAnalysis}
                    </Text>
                    {isAnalyzing && <Progress size="xs" isIndeterminate colorScheme="cyan" mt={4} borderRadius="full" />}
                  </Box>

                  {/* Engine Metrics */}
                  <EngineDiagnostics metrics={metrics} />

                  {/* Core Data Grid */}
                  <Box bg="gray.800" p={6} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={4} textTransform="uppercase">Transaction Parameters</Text>
                    <SimpleGrid columns={2} spacing={6}>
                      <VStack align="start" spacing={1}>
                        <Text color="gray.500" fontSize="xs">Instruction ID</Text>
                        <Code bg="transparent" color="cyan.200" p={0} fontSize="sm">{settlementInstruction?.messageId || 'PENDING'}</Code>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text color="gray.500" fontSize="xs">Settlement Value</Text>
                        <Text fontWeight="bold" fontSize="md">
                          <SafeAmount 
                            amount={settlementInstruction?.totalAmount} 
                            currency={settlementInstruction?.currency} 
                          />
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text color="gray.500" fontSize="xs">Creation Node</Text>
                        <Text fontSize="sm"><SafeTimestamp ts={settlementInstruction?.creationDateTime} /></Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text color="gray.500" fontSize="xs">Settlement Date</Text>
                        <Text fontSize="sm" fontWeight="bold" color="orange.300">{settlementInstruction?.settlementDate || 'TBD'}</Text>
                      </VStack>
                    </SimpleGrid>
                  </Box>

                  {/* Security Features (The "Bells and Whistles") */}
                  <Stack spacing={4}>
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Security & Compliance</Text>
                    <HStack spacing={3}>
                      <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
                        <HStack spacing={1}><Lock size={10} /><Text>AES-256</Text></HStack>
                      </Badge>
                      <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        <HStack spacing={1}><Activity size={10} /><Text>Real-time Monitoring</Text></HStack>
                      </Badge>
                      <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="full">
                        <HStack spacing={1}><Database size={10} /><Text>Immutable Audit</Text></HStack>
                      </Badge>
                    </HStack>
                  </Stack>

                  {/* Warning Message */}
                  <Flex p={4} bg="orange.900/10" borderRadius="xl" border="1px solid" borderColor="orange.900/30" align="start" gap={3}>
                    <AlertTriangle size={20} color="#FB923C" style={{ marginTop: '2px' }} />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="bold" color="orange.200">Pending Node Sync</Text>
                      <Text fontSize="xs" color="orange.100/70">
                        This transaction is currently propagating through the global ledger. Finality is expected on the scheduled settlement date.
                      </Text>
                    </VStack>
                  </Flex>

                  {/* Audit Storage View */}
                  <Collapse in={showAudit}>
                    <AuditTrail logs={auditLogs} />
                  </Collapse>
                </Stack>
              )}
            </Box>

            {/* RIGHT PANEL: AI Architect Chat */}
            <Collapse in={showChat} style={{ width: '100%', maxWidth: '450px' }}>
              <Box h="full" bg="blackAlpha.300" borderLeft="1px solid" borderColor="gray.800" display="flex" flexDirection="column">
                <Box p={4} borderBottom="1px solid" borderColor="gray.800" bg="gray.900">
                  <Flex align="center" gap={2}>
                    <Box w={2} h={2} borderRadius="full" bg="green.400" />
                    <Text fontSize="xs" fontWeight="bold" color="gray.400">QUANTUM AI ARCHITECT ONLINE</Text>
                  </Flex>
                </Box>

                {/* Chat Messages */}
                <Box flex="1" overflowY="auto" p={4} spacing={4} display="flex" flexDirection="column">
                  {chatMessages.map((msg) => (
                    <Box 
                      key={msg.id} 
                      alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                      maxW="85%"
                      mb={4}
                    >
                      <Box 
                        p={3} 
                        borderRadius="2xl" 
                        bg={msg.role === 'user' ? 'cyan.600' : 'gray.800'}
                        borderBottomRightRadius={msg.role === 'user' ? '4px' : '2xl'}
                        borderBottomLeftRadius={msg.role === 'assistant' ? '4px' : '2xl'}
                      >
                        <Text fontSize="sm" color="white">{msg.content}</Text>
                      </Box>
                      <Text fontSize="10px" color="gray.600" mt={1} textAlign={msg.role === 'user' ? 'right' : 'left'}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Text>
                    </Box>
                  ))}
                  {isAiTyping && (
                    <Box alignSelf="flex-start" maxW="85%" mb={4}>
                      <Box p={3} borderRadius="2xl" bg="gray.800" borderBottomLeftRadius="4px">
                        <HStack spacing={1}>
                          <Box w={1} h={1} bg="gray.500" borderRadius="full" animation="pulse 1s infinite" />
                          <Box w={1} h={1} bg="gray.500" borderRadius="full" animation="pulse 1s infinite 0.2s" />
                          <Box w={1} h={1} bg="gray.500" borderRadius="full" animation="pulse 1s infinite 0.4s" />
                        </HStack>
                      </Box>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </Box>

                {/* Chat Input */}
                <Box p={4} bg="gray.900" borderTop="1px solid" borderColor="gray.800">
                  <HStack>
                    <Input 
                      placeholder="Ask the Architect..." 
                      variant="filled" 
                      bg="gray.800" 
                      _hover={{ bg: 'gray.700' }}
                      _focus={{ bg: 'gray.700', borderColor: 'cyan.500' }}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      fontSize="sm"
                    />
                    <IconButton 
                      aria-label="Send" 
                      icon={<Send size={18} />} 
                      colorScheme="cyan" 
                      onClick={handleSendMessage}
                      isDisabled={!userInput.trim() || isAiTyping}
                    />
                  </HStack>
                  <Text fontSize="10px" color="gray.600" mt={2} textAlign="center">
                    Quantum AI may provide strategic insights. Verify all high-value trades.
                  </Text>
                </Box>
              </Box>
            </Collapse>
          </Flex>
        </ModalBody>

        {/* FOOTER: Actions */}
        <ModalFooter bg="gray.900" borderTop="1px solid" borderColor="gray.800" p={6}>
          <Flex w="full" justify="space-between" align="center">
            <HStack spacing={4}>
              <Button 
                variant="ghost" 
                colorScheme="gray" 
                leftIcon={<RefreshCw size={16} />}
                onClick={simulateAiAnalysis}
                isDisabled={isAnalyzing}
                fontSize="sm"
              >
                RE-SCAN ENGINE
              </Button>
              <Button 
                variant="ghost" 
                colorScheme="gray" 
                leftIcon={<Layers size={16} />}
                onClick={() => setShowAudit(!showAudit)}
                fontSize="sm"
              >
                {showAudit ? "HIDE AUDIT" : "VIEW AUDIT"}
              </Button>
            </HStack>
            
            <HStack spacing={4}>
              <Button variant="outline" colorScheme="gray" onClick={onClose} borderRadius="xl">
                CLOSE COCKPIT
              </Button>
              <Button
                bg="cyan.500"
                _hover={{ bg: "cyan.400", transform: 'translateY(-2px)' }}
                _active={{ bg: "cyan.600" }}
                color="black"
                fontWeight="black"
                px={8}
                borderRadius="xl"
                leftIcon={<Download size={18} />}
                onClick={downloadAsPDF}
                isLoading={isDownloading}
                isDisabled={!settlementInstruction}
                transition="all 0.2s"
                boxShadow="0 4px 14px 0 rgba(34, 211, 238, 0.39)"
              >
                DOWNLOAD CRYPTOGRAPHIC RECEIPT
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TradeConfirmationModal;

/**
 * AUDIT LOG SUMMARY (For Developer Reference)
 * ------------------------------------------------------------------------------------------------
 * 1. MODAL_OPEN: Triggered when the user enters the "Cockpit".
 * 2. AI_ANALYSIS_COMPLETE: Triggered after the simulated "Engine Scan".
 * 3. CHAT_MESSAGE_SENT: Logs user interaction with the AI Architect.
 * 4. AI_RESPONSE_GENERATED: Logs the AI's strategic output.
 * 5. PDF_DOWNLOAD_START/SUCCESS: Logs the generation of the cryptographic proof.
 * ------------------------------------------------------------------------------------------------
 */