import CalldataDecoder from '@/components/CalldataDecoder'

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gradient">
            ERC-7730 Transaction Decoder
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Human-readable transaction signing for any dApp
          </p>
          <p className="text-sm text-gray-500">
            Built with Hardhat 3 • Next.js 14 • TypeScript
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              🎯 Hackathon Demo
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-semibold text-blue-900 mb-1">Smart Contract</div>
                <div className="text-blue-700">DemoRouter with swap & liquidity functions</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="font-semibold text-purple-900 mb-1">ERC-7730 Descriptor</div>
                <div className="text-purple-700">Human-readable field labels & formatting</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-semibold text-green-900 mb-1">Hardhat 3 Backend</div>
                <div className="text-green-700">Network simulation & mainnet forking</div>
              </div>
            </div>
          </div>
        </div>

        <CalldataDecoder />

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            📚 How It Works
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-semibold text-lg mb-2">1. Smart Contract Development</h4>
              <p className="text-sm">
                DemoRouter.sol is compiled and deployed using Hardhat 3 with mainnet forking enabled. 
                The contract includes swap and liquidity functions with complex struct parameters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">2. ERC-7730 Descriptor Generation</h4>
              <p className="text-sm">
                A TypeScript script parses the contract ABI and generates an ERC-7730 descriptor 
                with human-readable labels and formatting rules for each function parameter.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">3. Calldata Encoding</h4>
              <p className="text-sm">
                Transaction calldata is encoded using ethers.js Interface. This raw hex data 
                represents the function call and parameters that would be sent on-chain.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">4. Human-Readable Display</h4>
              <p className="text-sm">
                The decoder uses the ERC-7730 descriptor to transform raw calldata into a 
                beautiful, understandable preview showing exactly what the transaction will do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
