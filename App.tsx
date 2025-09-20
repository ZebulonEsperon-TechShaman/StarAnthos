import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StarLightSystem } from './lib/amaterasu';
import { CoreFieldState, CognitiveSystemState, Message, Role, PlatformState, PhysicsState, UserAccount, Transaction } from './types';
import ChatInterface from './components/ChatInterface';
import MainDashboard from './components/MainDashboard';
import { generateChatResponse } from './services/geminiService';
import { fetchPlatformState, fetchUserAccounts, fetchTransactionsForAccount, submitDeposit } from './services/apiService';
import { runSREPhysicsSimulation } from './services/physicsService';

const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: Role.BOT, content: "I am Star Light Guide, your AI assistant for the Bank of Anthos. You can ask about platform health or your account details." }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    
    // SRE Platform State
    const [platformState, setPlatformState] = useState<PlatformState | null>(null);
    const [prevPlatformState, setPrevPlatformState] = useState<PlatformState | null>(null);
    const [isPlatformLoading, setIsPlatformLoading] = useState(true);
    const [platformError, setPlatformError] = useState<string | null>(null);
    const [physicsState, setPhysicsState] = useState<PhysicsState | null>(null);

    // User Banking State
    const [accounts, setAccounts] = useState<UserAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isUserDataLoading, setIsUserDataLoading] = useState(true);


    const starLightSystem = useRef(new StarLightSystem());

    const [coreState, setCoreState] = useState<CoreFieldState>(
        starLightSystem.current.getCoreState()
    );
    const [cognitiveState, setCognitiveState] = useState<CognitiveSystemState>(
        starLightSystem.current.getCognitiveState()
    );

    // Effect for SRE Platform Data Polling
    useEffect(() => {
        const getPlatformData = async () => {
            try {
                const data = await fetchPlatformState();
                setPlatformError(null);
                // Functional update to ensure we have the latest state for comparison
                setPlatformState(currentState => {
                    setPrevPlatformState(currentState);
                    return data;
                });
            } catch (error) {
                setPlatformError(error instanceof Error ? error.message : "An unknown error occurred fetching platform data.");
            } finally {
                setIsPlatformLoading(false);
            }
        };
        getPlatformData();
        const interval = setInterval(getPlatformData, 5000);
        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect for Physics Simulation
    useEffect(() => {
        if (platformState && prevPlatformState) {
            const simulationResult = runSREPhysicsSimulation(platformState, prevPlatformState);
            setPhysicsState(simulationResult);
        }
    }, [platformState, prevPlatformState]);

    // Effect for fetching initial user account data
    useEffect(() => {
        const getUserData = async () => {
            try {
                setIsUserDataLoading(true);
                const userAccounts = await fetchUserAccounts();
                setAccounts(userAccounts);
                if (userAccounts.length > 0) {
                    setSelectedAccount(userAccounts[0]);
                }
            } catch (error) {
                console.error("Failed to fetch user accounts", error);
            } finally {
                setIsUserDataLoading(false);
            }
        };
        getUserData();
    }, []);

    // Effect for fetching transactions when selected account changes
    useEffect(() => {
        const getTransactions = async () => {
            if (selectedAccount) {
                try {
                    const accountTransactions = await fetchTransactionsForAccount(selectedAccount.accountId);
                    setTransactions(accountTransactions);
                } catch (error) {
                    console.error("Failed to fetch transactions", error);
                }
            } else {
                setTransactions([]);
            }
        };
        getTransactions();
    }, [selectedAccount]);

    const handleSelectAccount = (accountId: string) => {
        const account = accounts.find(acc => acc.accountId === accountId);
        if (account) {
            setSelectedAccount(account);
        }
    };

    const handleDeposit = async (accountId: string, amount: number): Promise<{success: boolean, message: string}> => {
        try {
            const updatedAccount = await submitDeposit(accountId, amount);
            // Update account balance in state
            setAccounts(prevAccounts => prevAccounts.map(acc => acc.accountId === accountId ? updatedAccount : acc));
            if (selectedAccount?.accountId === accountId) {
                setSelectedAccount(updatedAccount);
            }
            // Refresh transactions
            const accountTransactions = await fetchTransactionsForAccount(accountId);
            setTransactions(accountTransactions);
            return { success: true, message: `Successfully deposited $${amount.toFixed(2)}.` };
        } catch (error) {
            console.error("Deposit failed:", error);
            return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
        }
    };

    const stringToVector = (str: string, dimensions: number): number[] => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i) | 0;
        }
        const stimulus = new Array(dimensions).fill(0);
        const stimulusStrength = 0.2;
        const stimulusIndex = Math.abs(hash) % dimensions;
        stimulus[stimulusIndex] = (hash > 0 ? 1 : -1) * stimulusStrength;
        for (let i = 1; i <= 2; i++) {
            const leftIndex = (stimulusIndex - i + dimensions) % dimensions;
            const rightIndex = (stimulusIndex + i) % dimensions;
            stimulus[leftIndex] = (hash > 0 ? 1 : -1) * stimulusStrength / (i + 1);
            stimulus[rightIndex] = (hash > 0 ? 1 : -1) * stimulusStrength / (i + 1);
        }
        return stimulus;
    };
    
    const handleSendMessage = useCallback(async (userInput: string) => {
        if (!userInput.trim()) return;

        const userMessage: Message = { role: Role.USER, content: userInput };
        setMessages(prev => [...prev, userMessage]);
        setIsThinking(true);

        const externalInput = stringToVector(userInput, starLightSystem.current.core_dynamics.dimensions);
        
        for (let i = 0; i < 5; i++) starLightSystem.current.run_cognitive_cycle(externalInput);
        
        const { patterns, selected_concept } = starLightSystem.current.getLastCycleInfo();
        
        setCoreState(starLightSystem.current.getCoreState());
        setCognitiveState(starLightSystem.current.getCognitiveState());

        try {
            const userData = { accounts, selectedAccount, transactions };
            const botResponseContent = await generateChatResponse(userInput, selected_concept, patterns, platformState, physicsState, userData);
            const botMessage: Message = { role: Role.BOT, content: botResponseContent };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error generating response:", error);
            const errorMessage: Message = { role: Role.BOT, content: "My core processing is fluctuating... I'm having trouble generating a response. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsThinking(false);
        }
    }, [platformState, physicsState, accounts, selectedAccount, transactions]);

    return (
        <div className="flex h-screen w-full font-sans bg-gray-900 text-gray-100">
            <div className="flex flex-col w-full lg:w-1/3 xl:w-2/5 p-4 md:p-6 border-r border-gray-700">
                <header className="mb-4">
                    <h1 className="text-3xl font-bold text-cyan-300">Star Light Guide</h1>
                    <p className="text-gray-400">AI Assistant for Bank of Anthos</p>
                </header>
                <ChatInterface
                    messages={messages}
                    isThinking={isThinking}
                    onSendMessage={handleSendMessage}
                />
            </div>
            <div className="hidden lg:flex flex-col w-2/3 xl:w-3/5 p-4 md:p-6">
                <MainDashboard
                    coreState={coreState} 
                    cognitiveState={cognitiveState}
                    platformState={platformState}
                    isPlatformLoading={isPlatformLoading}
                    platformError={platformError}
                    physicsState={physicsState}
                    accounts={accounts}
                    selectedAccount={selectedAccount}
                    transactions={transactions}
                    isUserDataLoading={isUserDataLoading}
                    onSelectAccount={handleSelectAccount}
                    onDeposit={handleDeposit}
                />
            </div>
        </div>
    );
};

export default App;