// components/views/personal/CryptoView.tsx
import React, { useContext, useMemo, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { CryptoAsset, NFTAsset } from '../../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const CryptoView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CryptoView must be within a DataProvider.");
    
    // FIX: Destructure missing functions from context to resolve property not found errors.
    const { cryptoAssets, walletInfo, virtualCard, connectWallet, issueCard, buyCrypto, nftAssets, mintNFT, paymentOperations } = context;
    
    const [isIssuingCard, setIsIssuingCard] = useState(false);
    const [isMetaMaskModalOpen, setIsMetaMaskModalOpen] = useState(false);
    const [isStripeModalOpen, setStripeModalOpen] = useState(false);
    const [buyAmount, setBuyAmount] = useState('100');

    const handleIssueCard = () => { setIsIssuingCard(true); setTimeout(() => { issueCard(); setIsIssuingCard(false); }, 2000); };
    const handleMetaMaskConnect = () => { connectWallet(); setIsMetaMaskModalOpen(false); };
    const handleBuyCrypto = () => { buyCrypto(parseFloat(buyAmount), 'ETH'); setStripeModalOpen(false); };
    
    const MetaMaskConnectModal: React.FC<{ isOpen: boolean; onClose: () => void; onConnect: () => void; }> = ({ isOpen, onClose, onConnect }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full border border-gray-700 flex flex-col" onClick={e=>e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700 text-center"><h3 className="font-semibold text-white">MetaMask</h3></div>
                    <div className="p-6 flex-grow flex flex-col items-center text-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Metamask" className="h-16 w-16 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-white mt-4">Connect With MetaMask</h4>
                        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg w-full">
                            <p className="text-sm text-gray-300">Allow this site to:</p>
                            <ul className="text-xs text-gray-400 list-disc list-inside mt-1 text-left ml-2"><li>View the addresses of your permitted accounts.</li><li>Suggest transactions to approve.</li></ul>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900/50 grid grid-cols-2 gap-3">
                         <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">Cancel</button>
                         <button onClick={onConnect} className="py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg">Connect</button>
                    </div>
                </div>
            </div>
        );
    };
    
    const StripeCheckoutModal: React.FC<{ isOpen: boolean; onClose: () => void; onPay: () => void; amountUSD: string; }> = ({ isOpen, onClose, onPay, amountUSD }) => {
        const [isProcessing, setIsProcessing] = useState(false);
        const handlePayClick = () => { setIsProcessing(true); setTimeout(() => { onPay(); setIsProcessing(false); }, 2000); };
        if (!isOpen) return null;
        return ( <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}><div className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 flex flex-col" onClick={e=>e.stopPropagation()}><div className="p-6 bg-gray-800 rounded-t-lg"><h3 className="font-semibold text-white">Demo Bank Inc.</h3><p className="text-2xl font-bold text-white mt-2">${parseFloat(amountUSD).toFixed(2)}</p></div><div className="p-6 space-y-4"><input type="email" placeholder="Email" className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" defaultValue="visionary@demobank.com" /><input type="text" placeholder="Card information" className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" defaultValue="4242 4242 4242 4242" /><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="MM / YY" className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" defaultValue="12 / 28" /><input type="text" placeholder="CVC" className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" defaultValue="123" /></div><button onClick={handlePayClick} disabled={isProcessing} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center">{isProcessing && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}{isProcessing ? 'Processing...' : `Pay $${parseFloat(amountUSD).toFixed(2)}`}</button></div></div></div>);
    }
    
    const chartData = useMemo(() => cryptoAssets.map(a => ({ ...a })), [cryptoAssets]);
    const totalValue = cryptoAssets.reduce((sum, asset) => sum + asset.value, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Crypto & Web3 Hub</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Crypto Portfolio" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={5}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><RechartsTooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} /><Legend iconSize={8} wrapperStyle={{fontSize: '12px'}} /></PieChart></ResponsiveContainer></div>
                        <div><h4 className="text-3xl font-bold text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4><p className="text-sm text-gray-400">Total Value</p></div>
                    </div>
                </Card>
                 <Card title="Web3 Wallet" className="h-full">
                    <div className="flex flex-col items-center justify-center text-center h-full">
                        {walletInfo ? (<div><img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Metamask" className="h-16 w-16 mx-auto mb-4" /><p className="text-green-400 font-semibold">Wallet Connected</p><p className="text-sm text-gray-300 font-mono break-all my-2">{walletInfo.address}</p><p className="text-xl text-white">{walletInfo.balance.toFixed(4)} ETH</p></div>) : (<><img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Metamask" className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-gray-400 mb-4">Connect your Metamask wallet.</p><button onClick={() => setIsMetaMaskModalOpen(true)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">Connect Metamask</button></>)}
                    </div>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Virtual Card" subtitle="Web3-enabled payments" className="h-full">
                    <div className="flex flex-col items-center justify-center text-center h-full min-h-[15rem]">{virtualCard ? (<div className="w-full max-w-sm aspect-[85.6/54] rounded-xl p-4 flex flex-col justify-between bg-gradient-to-br from-cyan-900 via-gray-900 to-indigo-900 border border-cyan-500/30"><div className="flex justify-between items-start"><p className="font-semibold text-white">Quantum Card</p></div><div><p className="font-mono text-lg text-white tracking-widest text-left">{virtualCard.cardNumber}</p><div className="flex justify-between text-xs font-mono text-gray-300 mt-2"><span>{virtualCard.holderName.toUpperCase()}</span><span>EXP: {virtualCard.expiry}</span><span>CVV: {virtualCard.cvv}</span></div></div></div>) : (<><p className="text-gray-400 mb-4">Issue a virtual card to spend your crypto assets anywhere.</p><button onClick={handleIssueCard} disabled={isIssuingCard} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">{isIssuingCard ? 'Issuing Card...' : 'Issue Virtual Card'}</button></>)}</div>
                </Card>
                <Card title="Buy Crypto (On-Ramp)" className="h-full">
                     <div className="flex flex-col items-center justify-center text-center h-full min-h-[15rem]"><p className="text-gray-400">Buy crypto via our Stripe integration.</p><div className="flex items-center my-4"><span className="text-2xl font-bold text-white mr-2">$</span><input type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} className="w-32 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-cyan-500 focus:outline-none"/></div><button onClick={() => setStripeModalOpen(true)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Buy with Stripe</button></div>
                </Card>
            </div>
            <Card title="NFT Gallery"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">{nftAssets.map(nft => (<div key={nft.id}><img src={nft.imageUrl} alt={nft.name} className="w-full rounded-lg aspect-square object-cover" /><p className="text-xs font-semibold text-white mt-2 truncate">{nft.name}</p></div>))}<button onClick={() => mintNFT("Quantum Vision Pass", "/nft-pass.webp")} className="w-full rounded-lg aspect-square border-2 border-dashed border-gray-600 hover:border-cyan-400 flex flex-col items-center justify-center text-gray-400 hover:text-cyan-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg><span className="text-xs mt-2">Mint NFT</span></button></div></Card>
            <MetaMaskConnectModal isOpen={isMetaMaskModalOpen} onClose={() => setIsMetaMaskModalOpen(false)} onConnect={handleMetaMaskConnect} />
            <StripeCheckoutModal isOpen={isStripeModalOpen} onClose={() => setStripeModalOpen(false)} onPay={handleBuyCrypto} amountUSD={buyAmount} />
        </div>
    );
};

export default CryptoView;
