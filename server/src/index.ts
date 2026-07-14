import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { counterAbi } from 'contracts'

const client = createPublicClient({
  chain: sepolia,
  transport: http()
})

export const app = new Hono()

.use(cors())

.get("/", (c) => {
	return c.text("Hello Hono!");
})

.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
});

.get('/contracts/:address/counter', async (c) => {
  try {
    const address = c.req.param('address') as `0x${ string }`

    const result = await client.readContract({
      address,
      abi: counterAbi,
      functionName: 'number'
    })

    const response: ApiResponse = {
      message: `Counter value: ${ result } `,
      success: true
    }

    return c.json(response)
  } catch (error) {
    return c.json({
      message: 'Failed to read contract',
      success: false
    }, 500)
  }
})

export default app;