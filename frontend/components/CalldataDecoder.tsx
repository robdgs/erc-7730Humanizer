'use client'

import { useState } from 'react'
import TransactionPreview from './TransactionPreview'
import { decodeCalldata, generateExampleCalldata } from '@/lib/decoder'
import type { DecodedTransaction } from '@/lib/decoder'

export default function CalldataDecoder() {
  const [calldata, setCalldata] = useState('')
  const [decodedTx, setDecodedTx] = useState<DecodedTransaction | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDecode = async () => {
    setError('')
    setDecodedTx(null)
    setIsLoading(true)

    try {
      if (!calldata.trim()) {
        throw new Error('Please enter calldata')
      }

      if (!calldata.startsWith('0x')) {
        throw new Error('Calldata must start with 0x')
      }

      const decoded = await decodeCalldata(calldata)
      setDecodedTx(decoded)
    } catch (err: any) {
      setError(err.message || 'Failed to decode calldata')
    } finally {
      setIsLoading(false)
    }
  }

  const loadExample = async (exampleType: string) => {
    setError('')
    setDecodedTx(null)
    setIsLoading(true)

    try {
      const exampleCalldata = await generateExampleCalldata(exampleType)
      setCalldata(exampleCalldata)
      const decoded = await decodeCalldata(exampleCalldata)
      setDecodedTx(decoded)
    } catch (err: any) {
      setError(err.message || 'Failed to load example')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Decode Transaction Calldata
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Calldata (hex)
          </label>
          <textarea
            value={calldata}
            onChange={(e) => setCalldata(e.target.value)}
            placeholder="0x..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleDecode}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Decoding...' : '🔍 Decode Calldata'}
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={() => loadExample('swap')}
            disabled={isLoading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            📝 Example: Swap
          </button>
          
          <button
            onClick={() => loadExample('addLiquidity')}
            disabled={isLoading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            📝 Example: Add Liquidity
          </button>
          
          <button
            onClick={() => loadExample('transfer')}
            disabled={isLoading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            📝 Example: Transfer
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">❌ {error}</p>
          </div>
        )}

        {decodedTx && <TransactionPreview transaction={decodedTx} />}
      </div>
    </div>
  )
}
