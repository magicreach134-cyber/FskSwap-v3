export const calculateSlippage = (amount: number, slippage: number) => amount - (amount * slippage / 100);
