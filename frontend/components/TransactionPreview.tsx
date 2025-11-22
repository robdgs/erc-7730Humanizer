'use client'

import type { DecodedTransaction } from '@/lib/decoder'

interface TransactionPreviewProps {
  transaction: DecodedTransaction
}

export default function TransactionPreview({ transaction }: TransactionPreviewProps) {
  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="mb-6">
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          ✅ Successfully Decoded with ERC-7730
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {transaction.intent}
        </h3>
        <p className="text-sm text-gray-600">
          Function: <code className="bg-white px-2 py-1 rounded text-xs">{transaction.functionName}</code>
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800">Transaction Details</h4>
        
        {transaction.fields.map((field, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{field.label}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                {field.format}
              </span>
            </div>
            <div className="font-mono text-sm text-gray-900 break-all">
              {field.displayValue}
            </div>
            {field.rawValue !== field.displayValue && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Show raw value
                </summary>
                <div className="mt-1 text-xs font-mono text-gray-400 break-all">
                  {field.rawValue}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Raw Calldata</h5>
        <div className="font-mono text-xs text-gray-600 break-all">
          {transaction.rawCalldata}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        <span>Ready to sign and broadcast to blockchain</span>
      </div>
    </div>
  )
}
