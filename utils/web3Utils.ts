
export const formatBalance = (rawBalance: string) => {
  try {
    const balanceBigInt = BigInt(rawBalance);
    // Convert to Number for division (loss of precision for very large numbers is acceptable for UI display)
    // 1e18 is 1000000000000000000
    const balance = (Number(balanceBigInt) / 1e18).toFixed(4);
    return balance;
  } catch (e) {
    console.error("Error formatting balance:", e);
    return "0.0000";
  }
}

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex)
  return chainIdNum
}

export const formatAddress = (addr: string) => {
  if (!addr) return '';
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2)
  return `${upperAfterLastTwo.substring(0, 6)}...${upperAfterLastTwo.substring(upperAfterLastTwo.length - 4)}`
}

export const web3Utils = {
  formatBalance,
  formatChainAsNum,
  formatAddress,
};

export default web3Utils;

