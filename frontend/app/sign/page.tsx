'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LedgerSimulator from '@/components/LedgerSimulator';
import LedgerSigner from '@/components/LedgerSigner';
import { ERC7730Formatter, type ERC7730Descriptor, type FormattedTransaction } from '@/lib/erc7730-formatter';

// Smart formatter for fallback when descriptor doesn't match
const formatArgumentsSmart = (args: any[], fragment: any) => {
  const fields: any[] = [];
  
  const formatValue = (value: any, type: string = ''): string => {
    if (value === null || value === undefined) return 'N/A';
    
    // Detect address
    if (typeof value === 'string' && value.match(/^0x[a-fA-F0-9]{40}$/)) {
      const knownTokens: any = {
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC Token',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI Token',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT Token',
      };
      return knownTokens[value] || `${value.slice(0, 6)}...${value.slice(-4)}`;
    }
    
    // Detect number/amount
    if (typeof value === 'bigint' || (typeof value === 'object' && value._isBigNumber)) {
      try {
        const bn = BigInt(value.toString());
        const strVal = bn.toString();
        
        // Auto-detect decimals
        let decimals = strVal.length <= 12 ? 6 : 18;
        const formatted = ethers.formatUnits(bn, decimals);
        const num = parseFloat(formatted);
        
        if (num === 0) return '0';
        if (num < 1) return num.toFixed(6);
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
      } catch {
        return value.toString();
      }
    }
    
    // Detect timestamp (reasonable unix timestamp range)
    if (typeof value === 'number' || typeof value === 'bigint') {
      const num = Number(value);
      if (num > 1600000000 && num < 2000000000) {
        const date = new Date(num * 1000);
        const now = new Date();
        const diffMinutes = Math.floor((date.getTime() - now.getTime()) / 60000);
        
        if (diffMinutes > 0 && diffMinutes < 10080) {
          if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
          if (diffMinutes < 1440) return `in ${Math.floor(diffMinutes / 60)} hours`;
          return `in ${Math.floor(diffMinutes / 1440)} days`;
        }
        
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
    
    return String(value);
  };
  
  // Handle tuple/struct parameters
  if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    const structObj = args[0];
    const keys = Object.keys(structObj).filter(k => isNaN(Number(k)));
    
    for (const key of keys) {
      const value = structObj[key];
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      
      fields.push({
        label,
        value: formatValue(value),
        rawValue: value,
      });
    }
  } else {
    // Handle regular parameters
    const inputs = fragment?.inputs || [];
    
    args.forEach((arg: any, index: number) => {
      const input = inputs[index];
      const label = input?.name || `Param ${index}`;
      
      fields.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: formatValue(arg, input?.type),
        rawValue: arg,
      });
    });
  }
  
  return fields;
};

export default function SignPage() {
  const [calldata, setCalldata] = useState('');
  const [decodedTx, setDecodedTx] = useState<FormattedTransaction | null>(null);
  const [error, setError] = useState('');
  const [showLedger, setShowLedger] = useState(false);
  const [signature, setSignature] = useState('');
  const [descriptor, setDescriptor] = useState<ERC7730Descriptor | null>(null);
  const [abi, setAbi] = useState<any[]>([]);
  const [useLedgerDevice, setUseLedgerDevice] = useState(false);
  const [ledgerConnected, setLedgerConnected] = useState(false);

  useEffect(() => {
    const loadDescriptor = async () => {
      try {
        const response = await fetch('/descriptors/DemoRouter.json');
        const data = await response.json();
        setDescriptor(data);
        setAbi(data.context?.contract?.abi || []);
      } catch (err) {
        console.error('Failed to load descriptor:', err);
      }
    };
    loadDescriptor();
  }, []);

  const decodeCalldata = () => {
    setError('');
    setDecodedTx(null);
    setSignature('');

    if (!calldata.trim()) {
      setError('Please enter calldata');
      return;
    }

    if (!abi.length) {
      setError('ABI not loaded');
      return;
    }

    try {
      // Ensure calldata starts with 0x
      const normalizedCalldata = calldata.startsWith('0x') ? calldata : `0x${calldata}`;
      
      // Check if calldata has minimum length (function selector = 4 bytes = 8 hex chars)
      if (normalizedCalldata.length < 10) {
        setError('Calldata too short - missing function selector');
        return;
      }

      const iface = new ethers.Interface(abi);
      const decoded = iface.parseTransaction({ data: normalizedCalldata });

      if (!decoded) {
        setError('Failed to decode calldata');
        return;
      }

      const functionName = decoded.name;
      const args = decoded.args;

      if (descriptor) {
        const formatter = new ERC7730Formatter(descriptor);
        const formatted = formatter.formatTransaction(functionName, args);
        
        if (formatted) {
          setDecodedTx(formatted);
        } else {
          // Fallback: smart formatting based on value type
          const smartFields = formatArgumentsSmart(args, decoded.fragment);
          setDecodedTx({
            intent: `Execute ${functionName}`,
            functionName,
            fields: smartFields,
          });
        }
      }
    } catch (err: any) {
      console.error('Decode error:', err);
      setError(`Failed to decode: ${err.shortMessage || err.message || 'Unknown error'}`);
    }
  };

  const handleSign = () => {
    if (!decodedTx) {
      setError('Please decode calldata first');
      return;
    }
    setShowLedger(true);
  };

  const handleApprove = () => {
    const mockSignature = `0x${Array.from({ length: 130 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
    
    setSignature(mockSignature);
    setShowLedger(false);
  };

  const handleReject = () => {
    setError('Transaction rejected by user');
    setShowLedger(false);
  };

  const generateExampleCalldata = () => {
    if (!abi.length) return [];

    try {
      const iface = new ethers.Interface(abi);
      
      const swapParams = {
        tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        tokenOut: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        amountIn: ethers.parseUnits('1000', 6), // 1000 USDC
        minAmountOut: ethers.parseUnits('990', 18), // 990 DAI
        recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0000',
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      const liquidityParams = {
        tokenA: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        tokenB: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
        amountA: ethers.parseUnits('1000', 6), // 1000 USDC
        amountB: ethers.parseUnits('1000', 18), // 1000 DAI
        recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0000',
        deadline: Math.floor(Date.now() / 1000) + 3600,
      };

      return [
        {
          name: 'Swap Tokens',
          data: iface.encodeFunctionData('swapExactTokensForTokens', [swapParams]),
        },
        {
          name: 'Add Liquidity',
          data: iface.encodeFunctionData('addLiquidity', [liquidityParams]),
        },
        {
          name: 'Simple Transfer',
          data: iface.encodeFunctionData('simpleTransfer', [
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
            '0x742d35Cc6634C0532925a3b844Bc9e7595f0000',
            ethers.parseUnits('100', 6), // 100 USDC
          ]),
        },
      ];
    } catch (err) {
      console.error('Failed to generate examples:', err);
      return [];
    }
  };

  const exampleCalldata = generateExampleCalldata();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
             Hardware Secure Signing
          </h1>
          <p className="text-xl text-gray-600">
            Sign transactions with Ledger integration & ERC-7730 human-readable display
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                📝 Transaction Calldata
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste Calldata (hex)
                </label>
                <textarea
                  value={calldata}
                  onChange={(e) => setCalldata(e.target.value)}
                  placeholder="0x1760feec..."
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
              </div>

              <button
                onClick={decodeCalldata}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Decode Transaction
              </button>

              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Quick Examples:</p>
                <div className="space-y-2">
                  {exampleCalldata.length > 0 ? (
                    exampleCalldata.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCalldata(example.data);
                          setError('');
                          setDecodedTx(null);
                        }}
                        className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                      >
                        <span className="font-medium text-gray-800">{example.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">Loading examples...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Ledger Connection */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                🔌 Ledger Connection
              </h2>
              
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLedgerDevice}
                    onChange={(e) => setUseLedgerDevice(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Use real Ledger device (WebUSB)</span>
                </label>
              </div>

              {useLedgerDevice && (
                <LedgerSigner
                  onConnected={(address) => {
                    setLedgerConnected(true);
                    console.log('Ledger connected:', address);
                  }}
                  onDisconnected={() => setLedgerConnected(false)}
                  onError={(err) => setError(err)}
                />
              )}

              {!useLedgerDevice && (
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  💡 Simulation mode active. Enable checkbox above to connect real Ledger device.
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Display */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-semibold">❌ {error}</p>
              </div>
            )}

            {decodedTx && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  ✨ Human-Readable Preview
                </h2>
                
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Transaction Intent</div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {decodedTx.intent}
                  </div>
                  <div className="text-sm text-gray-600 mt-2 font-mono bg-white/50 px-3 py-1 rounded inline-block">
                    {decodedTx.functionName}()
                  </div>
                </div>

                <div className="space-y-4">
                  {decodedTx.fields.map((field, index) => {
                    const isAmount = field.label.toLowerCase().includes('amount');
                    const isAddress = field.label.toLowerCase().includes('token') || 
                                     field.label.toLowerCase().includes('recipient');
                    const isTime = field.label.toLowerCase().includes('deadline');
                    
                    return (
                      <div key={index} className="group p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isAmount && <span className="text-xl">💰</span>}
                            {isAddress && <span className="text-xl">🏦</span>}
                            {isTime && <span className="text-xl">⏰</span>}
                            <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                              {field.label}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900 break-all pl-7">
                          {field.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSign}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  🔐 Sign with Ledger
                </button>
              </div>
            )}

            {showLedger && decodedTx && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Ledger Device
                </h2>
                <LedgerSimulator
                  intent={decodedTx.intent}
                  functionName={decodedTx.functionName}
                  fields={decodedTx.fields}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            )}

            {signature && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  ✅ Signed Transaction
                </h2>
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Signature</div>
                  <div className="text-sm font-mono text-gray-800 break-all">
                    {signature}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  ✓ Transaction ready to broadcast to the network
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            🛡️ Secure, Sovereign Systems
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-700">
            <div>
              <h4 className="font-bold text-lg mb-2">ERC-7730 Standard</h4>
              <p className="text-sm">
                Human-readable transaction descriptions that work across all dApps and wallets
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2">Ledger Integration</h4>
              <p className="text-sm">
                Direct hardware wallet signing with WebUSB. Your keys never leave the device
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
