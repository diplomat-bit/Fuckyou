
import React, { createContext, useContext, ReactNode } from 'react';
import { MoneyMovementAPI } from './CitibankMoneyMovementSDK';

interface MoneyMovementContextType {
    api: MoneyMovementAPI | null;
    accessToken: string | null;
    uuid: string;
    generateNewUuid: () => void;
}

const MoneyMovementContext = createContext<MoneyMovementContextType>({
    api: null,
    accessToken: null,
    uuid: '',
    generateNewUuid: () => {},
});

export const useMoneyMovement = () => useContext(MoneyMovementContext);

export const MoneyMovementProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    // Mock implementation for the provider to ensure app runs
    const api = new MoneyMovementAPI('https://sandbox.apihub.citi.com/gcb//api', 'client_id');
    
    return (
        <MoneyMovementContext.Provider value={{
            api,
            accessToken: 'mock_token',
            uuid: 'mock_uuid',
            generateNewUuid: () => {}
        }}>
            {children}
        </MoneyMovementContext.Provider>
    );
};
