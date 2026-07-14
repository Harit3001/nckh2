import { useState } from 'react'
import beaver from './assets/beaver.svg'
import { hcWithType } from 'server/dist/client'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { counterAbi } from 'contracts'
import './App.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
const CONTRACT_ADDRESS = "0x742d35Cc6634C0532925a3b8D404fBaF464DfD85"

const client = hcWithType(SERVER_URL);
const viemClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

type ResponseType = Awaited<ReturnType<typeof client.hello.$get>>;

function App() {
  const [data, setData] = useState<Awaited<ReturnType<ResponseType["json"]>> | undefined>()
  const [counterValue, setCounterValue] = useState<bigint | undefined>()

  async function sendRequest() {
    try {
      const res = await client.hello.$get()
      if (!res.ok) {
        console.log("Error fetching data")
        return
      }
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.log(error)
    }
  }

  async function readContract() {
    try {
      const result = await viemClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: counterAbi,
        functionName: "number"
      })
      setCounterValue(result)
    } catch (error) {
      console.log("Contract read error:", error)
    }
  }

  return (
    <>
      <div>
        <a href="https://github.com/stevedylandev/bhvr" target="_blank">
          <img src={beaver} className="logo" alt="beaver logo" />
        </a>
      </div>
      <h1>bhvr</h1>
      <h2>Bun + Hono + Vite + React</h2>
      <p>A typesafe fullstack monorepo with smart contracts</p>
      <div className="card">
        <div className='button-container'>
          <button onClick={sendRequest}>
            Call API
          </button>
          <button onClick={readContract}>
            Read Contract
          </button>
          <a className='docs-link' target='_blank' href="https://bhvr.dev">Docs</a>
        </div>
        {data && (
          <pre className='response'>
            <code>
            Message: {data.message} <br />
            Success: {data.success.toString()}
            </code>
          </pre>
        )}
        {counterValue !== undefined && (
          <pre className='response'>
            <code>
            Counter Value: {counterValue.toString()}
            </code>
          </pre>
        )}
      </div>
    </>
  )
}

export default App