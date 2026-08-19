import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccessMetadata, PlaidLinkOnExitMetadata } from 'react-plaid-link';
import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Spinner,
    Text,
    VStack,
    HStack,
    Progress,
    Alert,
    AlertIcon,
    Box,
    Icon,
    useToast,
    Flex,
    Heading,
    Badge,
    Tooltip,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    IconButton,
    useBreakpointValue,
} from '@chakra-ui/react';
import {
    FiLink,
    FiZap,
    FiShield,
    FiCpu,
    FiTrendingUp,
    FiUserCheck,
    FiAlertTriangle,
    FiCheckCircle,
    FiXCircle,
    FiInfo,
    FiSettings,
    FiChevronRight,
    FiChevronLeft,
    FiRefreshCw,
} from 'react-icons/fi';

// --- Core Financial Constants and Types ---

/**
 * Defines the operational status of the Plaid Link integration.
 */
export enum PlaidLinkStatus {
    IDLE = 'IDLE',
    INITIATING = 'INITIATING',
    LINKING = 'LINKING',
    SUCCESS = 'SUCCESS',
    EXITED = 'EXITED',
    ERROR = 'ERROR',
    PROCESSING_DATA = 'PROCESSING_DATA',
}

/**
 * Defines the structure for configuration parameters passed to the Plaid Link component.
 */
interface PlaidConfig {
    linkToken: string;
    userToken: string; // Placeholder for internal user session token
    institutionId?: string;
    clientName: string;
    productType: 'transactions' | 'auth' | 'identity' | 'investments';
    apiVersion: string;
}

// --- Production-Ready Simulated Backend Service ---

/**
 * NOTE: This component previously contained mock code simulating financial data corruption
 * orchestrated by an 'Antagonist AI Core.' This has been replaced with a reliable,
 * standards-compliant simulation of a secure token exchange and data ingestion process.
 *
 * Simulates the secure, asynchronous exchange of the public token for a permanent access token
 * and subsequent reliable data ingestion.
 *
 * In a production environment, this function would perform an authenticated API call
 * to the backend server (e.g., POST /api/plaid/exchange_token) which handles the sensitive
 * token exchange with Plaid and stores the access token securely.
 *
 * @param publicToken The token received from Plaid Link upon successful user connection.
 * @param userId The unique identifier for the user.
 * @returns A promise resolving to the status of the backend processing.
 */
const simulateSecureTokenExchangeAndIngestion = async (publicToken: string, userId: string): Promise<{ success: boolean, message: string, accessToken?: string }> => {
    console.log(`[Plaid Integration] Received public token for user ${userId}. Initiating secure exchange...`);

    // Simulate network latency (750ms - 1000ms)
    await new Promise(resolve => setTimeout(resolve, 750 + Math.random() * 250));

    if (publicToken.length < 10) {
        return { success: false, message: "Plaid public token format invalid or environment misconfigured." };
    }

    // Simulate successful backend processing (secure token exchange, storing access token, initial data fetch)
    const ingestionDuration = 1500 + Math.random() * 1000;
    console.log(`[Plaid Integration] Backend processing data stream. Estimated ingestion time: ${ingestionDuration / 1000}s.`);

    await new Promise(resolve => setTimeout(resolve, ingestionDuration));

    // Generate a simulated secure access token
    const newAccessToken = `access-prod-${userId.slice(0, 4)}-${Math.random().toString(36).substring(2, 15)}`;

    return {
        success: true,
        message: `Financial account successfully linked and synchronized. Access Token generated.`,
        accessToken: newAccessToken,
    };
};

// --- Plaid Link Button Component ---

interface PlaidLinkButtonProps {
    userId: string;
    config: PlaidConfig;
    onLinkSuccess: (metadata: PlaidLinkOnSuccessMetadata, config: PlaidConfig) => void;
    onLinkExit: (metadata: PlaidLinkOnExitMetadata, config: PlaidConfig) => void;
    buttonTextOverride?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    iconOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * The PlaidLinkButton component, managing the lifecycle of connecting external
 * financial accounts securely via Plaid Link.
 */
const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
    userId,
    config,
    onLinkSuccess,
    onLinkExit,
    buttonTextOverride,
    variant = 'primary',
    iconOnly = false,
    size = 'md',
}) => {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [status, setStatus] = useState<PlaidLinkStatus>(PlaidLinkStatus.IDLE);
    const [linkToken, setLinkToken] = useState<string>(config.linkToken);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [modalTitle, setModalTitle] = useState("Initializing Plaid Link");
    const [modalDescription, setModalDescription] = useState("Preparing secure connection parameters...");

    const isProcessing = status === PlaidLinkStatus.LINKING || status === PlaidLinkStatus.PROCESSING_DATA;
    const isError = status === PlaidLinkStatus.ERROR;
    const isSuccess = status === PlaidLinkStatus.SUCCESS;

    // Determine button size props based on input
    const buttonSizeMap = useMemo(() => ({
        sm: { fontSize: 'sm', px: 3, py: 6 },
        md: { fontSize: 'md', px: 4, py: 7 },
        lg: { fontSize: 'lg', px: 6, py: 8 },
    }), []);

    const currentSizeProps = buttonSizeMap[size];

    // --- Plaid Link Configuration Memoization ---
    const plaidLinkOptions: PlaidLinkOptions = useMemo(() => ({
        token: linkToken,
        onSuccess: (public_token, metadata) => handlePlaidSuccess(public_token, metadata),
        onExit: (err, metadata) => handlePlaidExit(err, metadata),
        clientName: config.clientName,
        product: [config.productType],
        apiVersion: config.apiVersion,
        user: { client_user_id: userId },
    }), [linkToken, userId, config.clientName, config.productType, config.apiVersion]);

    const { open, ready } = usePlaidLink(plaidLinkOptions);

    // --- Production Handlers ---

    const handlePlaidSuccess = useCallback(async (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
        setStatus(PlaidLinkStatus.PROCESSING_DATA);
        setModalTitle("Data Ingestion & Synchronization");
        setModalDescription("Exchanging public token for a secure access token and importing initial data.");
        setProgress(10);

        try {
            // 1. Backend Exchange and Secure Processing
            const result = await simulateSecureTokenExchangeAndIngestion(public_token, userId);

            if (result.success) {
                setProgress(100);
                setStatus(PlaidLinkStatus.SUCCESS);
                setModalTitle("Account Connected Successfully");
                setModalDescription(result.message);
                toast({
                    title: "Account Linked",
                    description: `Account successfully linked for ${metadata.institution.name}. Synchronization complete.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                onLinkSuccess(metadata, config);
            } else {
                throw new Error(result.message || "Unknown backend processing error.");
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unhandled error occurred during data ingestion.";
            setError(errorMessage);
            setStatus(PlaidLinkStatus.ERROR);
            setModalTitle("Ingestion Failure");
            setModalDescription(`A critical error occurred during synchronization: ${errorMessage}`);
            toast({
                title: "Link Interrupted",
                description: "Failed to securely exchange token or ingest initial data. Please try again.",
                status: "error",
                duration: 10000,
                isClosable: true,
            });
            onLinkExit({ error: { message: errorMessage, type: 'backend_error' } }, config);
        }
    }, [userId, onLinkSuccess, config, toast]);

    const handlePlaidExit = useCallback((error: PlaidLinkOnExitMetadata['error'], metadata: PlaidLinkOnExitMetadata) => {
        if (error && error.type !== 'user_closed_modal') {
            setError(error.message || "Plaid Link closed unexpectedly.");
            setStatus(PlaidLinkStatus.ERROR);
            setModalTitle("Link Interruption");
            setModalDescription(`Link process exited with error: ${error.type}.`);
            toast({
                title: "Link Interrupted",
                description: `Plaid Link closed: ${error.type}.`,
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        } else if (metadata.exit_status === 'complete') {
            // User successfully completed the flow but perhaps didn't select an account, or flow finished naturally.
            setStatus(PlaidLinkStatus.EXITED);
            setModalTitle("Link Session Concluded");
            setModalDescription("The Plaid Link session has concluded. If no account was selected, please try again.");
        } else {
            // User closed the modal manually before completion
            setStatus(PlaidLinkStatus.IDLE); // Return to initial state if user closes before any attempt
            setModalTitle("Link Session Cancelled");
            setModalDescription("You cancelled the connection process.");
        }
        onLinkExit(metadata, config);
    }, [onLinkExit, config, toast]);

    // --- Logic for Opening Link ---

    const initiateLink = useCallback(() => {
        if (!ready || isProcessing) return;

        setError(null);
        setProgress(0);
        setStatus(PlaidLinkStatus.INITIATING);
        setModalTitle("Establishing Secure Channel");
        setModalDescription("Requesting fresh link token from API Gateway...");

        // In a real system, this would call an endpoint to generate a fresh link_token
        // Simulate token refresh/validation delay
        setTimeout(() => {
            if (config.linkToken) {
                setStatus(PlaidLinkStatus.LINKING);
                setModalTitle("Launching Plaid Link Interface");
                setModalDescription("Launching the secure Plaid interface for credential input.");
                open(); // Opens the Plaid Link modal
            } else {
                const refreshError = "Link token missing or expired. System requires token refresh.";
                setError(refreshError);
                setStatus(PlaidLinkStatus.ERROR);
                toast({ title: "Configuration Error", description: refreshError, status: "error" });
            }
        }, 500);

    }, [ready, isProcessing, open, config.linkToken, toast]);

    // --- UI Rendering Logic ---

    const getButtonContent = () => {
        if (iconOnly) {
            return <Icon as={FiLink} w={5} h={5} />;
        }
        if (buttonTextOverride) {
            return buttonTextOverride;
        }
        switch (status) {
            case PlaidLinkStatus.IDLE:
            case PlaidLinkStatus.EXITED:
                return (
                    <HStack>
                        <Icon as={FiLink} />
                        <Text>Connect Financial Source</Text>
                    </HStack>
                );
            case PlaidLinkStatus.INITIATING:
                return <HStack><Spinner size="sm" mr={2} /> {iconOnly ? <Icon as={FiZap} /> : "Preparing..."}</HStack>;
            case PlaidLinkStatus.LINKING:
                return <HStack><Spinner size="sm" mr={2} /> {iconOnly ? <Icon as={FiZap} /> : "Launching Link..."}</HStack>;
            case PlaidLinkStatus.PROCESSING_DATA:
                return <HStack><Spinner size="sm" mr={2} /> {iconOnly ? <Icon as={FiCpu} /> : "Processing Data..."}</HStack>;
            case PlaidLinkStatus.SUCCESS:
                return <HStack><Icon as={FiCheckCircle} /> {iconOnly ? <Icon as={FiCheckCircle} /> : "Source Linked"}</HStack>;
            case PlaidLinkStatus.ERROR:
                return <HStack><Icon as={FiXCircle} /> {iconOnly ? <Icon as={FiXCircle} /> : "Link Failed"}</HStack>;
            default:
                return <HStack><Icon as={FiLink} /> Connect Account</HStack>;
        }
    };

    const getButtonVariant = () => {
        const brandColor = 'blue.600';
        const brandHover = 'blue.700';

        switch (variant) {
            case 'primary':
                return {
                    bg: isProcessing ? 'gray.500' : brandColor,
                    color: 'white',
                    _hover: { bg: isProcessing ? 'gray.600' : brandHover },
                };
            case 'secondary':
                return {
                    bg: isProcessing ? 'gray.300' : 'gray.500',
                    color: 'white',
                    _hover: { bg: isProcessing ? 'gray.400' : 'gray.600' },
                };
            case 'ghost':
                return {
                    bg: 'transparent',
                    color: isProcessing ? 'gray.400' : brandColor,
                    _hover: { bg: isProcessing ? 'gray.100' : 'gray.200' },
                };
            default:
                return {}; // Fallback
        }
    };

    const isDisabled = isProcessing || !ready;

    // --- Modal Content Rendering ---

    const renderModalContent = () => {
        if (isSuccess) {
            return (
                <VStack spacing={6} py={8}>
                    <Icon as={FiCheckCircle} w={16} h={16} color="green.500" />
                    <Heading size="lg">Connection Successful</Heading>
                    <Text textAlign="center" color="gray.600">{modalDescription}</Text>
                    <Badge colorScheme="green" variant="solid" fontSize="md">
                        Data Synchronized
                    </Badge>
                </VStack>
            );
        }

        if (isError) {
            return (
                <VStack spacing={6} py={8}>
                    <Icon as={FiAlertTriangle} w={16} h={16} color="red.500" />
                    <Heading size="lg">Connection Error</Heading>
                    <Text textAlign="center" color="red.600">{modalDescription}</Text>
                    <Box p={3} bg="red.50" borderRadius="md" w="full">
                        <Text fontSize="sm" fontFamily="mono">{error}</Text>
                    </Box>
                </VStack>
            );
        }

        // Loading/Initiating States
        return (
            <VStack spacing={6} py={8} px={4}>
                <Heading size="md" color="blue.600">{modalTitle}</Heading>
                <Text textAlign="center" color="gray.600">{modalDescription}</Text>

                {status === PlaidLinkStatus.PROCESSING_DATA && (
                    <VStack w="full" spacing={4}>
                        <Progress
                            hasStripe
                            value={progress}
                            isAnimated
                            width="100%"
                            colorScheme="blue"
                            size="lg"
                        />
                        <HStack justify="space-between" w="full" fontSize="sm" color="gray.500">
                            <Text>Secure Data Ingestion</Text>
                            <Text>{Math.round(progress)}%</Text>
                        </HStack>
                        <Alert status="info" borderRadius="lg" p={3}>
                            <AlertIcon boxSize="4" mr={2} />
                            <Text fontSize="sm">The system is securely validating credentials and importing initial transaction history.</Text>
                        </Alert>
                    </VStack>
                )}

                {(status === PlaidLinkStatus.INITIATING || status === PlaidLinkStatus.LINKING) && (
                    <VStack spacing={3}>
                        <Spinner size="xl" color="blue.500" />
                        <Text fontSize="sm" color="gray.500">Awaiting secure channel establishment...</Text>
                    </VStack>
                )}

                <Box pt={4} borderTop="1px solid" borderColor="gray.100" w="full">
                    <HStack justifyContent="space-between" fontSize="sm" color="gray.500">
                        <Text>User ID: {userId.substring(0, 8)}...</Text>
                        <Text>Product: {config.productType}</Text>
                    </HStack>
                </Box>
            </VStack>
        );
    };

    // --- Main Render ---

    return (
        <>
            {/* 1. The Primary Action Button */}
            <Button
                onClick={initiateLink}
                isDisabled={isDisabled}
                isLoading={isProcessing && !iconOnly}
                loadingText={iconOnly ? "" : "Processing..."}
                spinnerPlacement={iconOnly ? "none" : "start"}
                variant="solid"
                {...getButtonVariant()}
                {...currentSizeProps}
                width={iconOnly ? 'auto' : 'full'}
                title={isDisabled ? "System busy or link token invalid" : "Connect Financial Account"}
            >
                {getButtonContent()}
            </Button>

            {/* 2. The Integration Modal */}
            <Modal isOpen={isOpen} onClose={isProcessing ? () => {} : onClose} size="lg" isCentered>
                <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
                <ModalContent borderRadius="xl" shadow="2xl" p={0}>
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4}>
                        <Flex align="center">
                            <Icon as={FiShield} color="blue.500" mr={3} w={6} h={6} />
                            <Heading size="md">Secure Plaid Link Integration</Heading>
                        </Flex>
                    </ModalHeader>
                    <ModalBody p={0}>
                        {renderModalContent()}
                    </ModalBody>
                    <ModalFooter borderTop="1px solid" borderColor="gray.100">
                        <Button
                            variant="outline"
                            onClick={isProcessing ? () => {} : onClose}
                            isDisabled={isProcessing}
                            leftIcon={isSuccess ? <Icon as={FiSettings} /> : isError ? <Icon as={FiRefreshCw} /> : <Icon as={FiXCircle} />}
                        >
                            {isSuccess ? "Proceed to Dashboard" : isError ? "Retry Connection" : "Cancel Connection"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default PlaidLinkButton;

// --- Extended Component: Link Status Dashboard Widget ---

interface LinkStatusWidgetProps {
    userId: string;
    lastLinkedDate?: Date | null;
    institutionName?: string;
    status: PlaidLinkStatus;
}

/**
 * A high-value dashboard widget providing real-time status of the Plaid Link integration.
 * This component provides clear, safe status monitoring for connected financial data.
 */
const LinkStatusWidget: React.FC<LinkStatusWidgetProps> = ({ userId, lastLinkedDate, institutionName, status }) => {
    const isConnected = status === PlaidLinkStatus.SUCCESS;
    const isSyncing = status === PlaidLinkStatus.PROCESSING_DATA || status === PlaidLinkStatus.LINKING;

    const getStatusBadge = () => {
        switch (status) {
            case PlaidLinkStatus.SUCCESS:
                return <Badge colorScheme="green" variant="solid"><HStack><Icon as={FiCheckCircle} /> <span>Connected & Synchronized</span></HStack></Badge>;
            case PlaidLinkStatus.PROCESSING_DATA:
                return <Badge colorScheme="blue" variant="solid"><HStack><Spinner size="xs" mr={1} /> <span>Synchronizing Data</span></HStack></Badge>;
            case PlaidLinkStatus.ERROR:
                return <Badge colorScheme="red" variant="solid"><HStack><Icon as={FiAlertTriangle} /> <span>Connection Error</span></HStack></Badge>;
            case PlaidLinkStatus.IDLE:
            case PlaidLinkStatus.EXITED:
            default:
                return <Badge colorScheme="gray" variant="outline"><HStack><Icon as={FiInfo} /> <span>Pending Link</span></HStack></Badge>;
        }
    };

    const formatLastSync = useMemo(() => {
        if (!lastLinkedDate) return "Never Synchronized";
        return lastLinkedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }, [lastLinkedDate]);

    const generalInsight = useMemo(() => {
        if (isConnected) {
            return `Secure synchronization established with ${institutionName || 'institution'}. Data is available for financial analysis.`;
        }
        if (isSyncing) {
            return "Real-time data synchronization in progress. Initial data ingestion is underway.";
        }
        return "Connect an account to enable financial monitoring and intelligence features.";
    }, [isConnected, isSyncing, institutionName]);

    return (
        <Flex
            p={6}
            bg="white"
            borderRadius="xl"
            shadow="lg"
            border="1px solid"
            borderColor={isConnected ? "green.200" : "gray.200"}
            direction={{ base: "column", md: "row" }}
            align="center"
            justify="space-between"
            transition="all 0.3s"
            _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
        >
            <VStack align="flex-start" spacing={2} flex={1} minW="0">
                <HStack spacing={3}>
                    <Icon as={FiTrendingUp} w={6} h={6} color="blue.500" />
                    <Heading size="md">Financial Data Connection Status</Heading>
                </HStack>
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                    User ID: <Text as="span" fontWeight="medium" color="gray.700">{userId.substring(0, 12)}...</Text>
                </Text>
                <Box mt={2}>
                    {getStatusBadge()}
                </Box>
            </VStack>

            <VStack align="flex-start" spacing={1} mt={{ base: 4, md: 0 }} ml={{ md: 6 }} flexShrink={0} w={{ base: "full", md: "auto" }}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Institution: {institutionName || "N/A"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                    Last Sync: {formatLastSync}
                </Text>
                <Tooltip label={generalInsight} placement="top">
                    <HStack spacing={1} mt={1} color="blue.500">
                        <Icon as={FiInfo} w={3} h={3} />
                        <Text fontSize="xs" fontStyle="italic" noOfLines={1}>{generalInsight}</Text>
                    </HStack>
                </Tooltip>
            </VStack>
        </Flex>
    );
};

export { LinkStatusWidget };