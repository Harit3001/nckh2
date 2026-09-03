import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "../../shared/src/types";
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { counterAbi } from 'contracts'
import authRoutes from "./routes/auth.routes";
import docsRoutes from "./routes/docs.routes";
import adminRoutes from "./routes/admin.routes";
import { sendMail } from "./configs/mail";
import type { Context } from "hono";
const client = createPublicClient({
  chain: sepolia,
  transport: http()
})

export const app = new Hono()

app.use(cors())

app.onError((err, c) => {
  console.error("Global error handler:", err);
  
  let status = 500;
  let message = "Internal Server Error";
  
  if (err instanceof Error) {
    message = err.message;
    
    if ("status" in err && typeof (err as any).status === "number") {
      status = (err as any).status;
    }
  }

  console.error(`Returning ${status} - ${message}`);

  return c.json(
    {
      success: false,
      message,
      status,
    },
    status as any,
  );
});

app.get("/", (c) => {
	return c.text("Hello Hono!");
})

app.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
});

app.get('/contracts/:address/counter', async (c) => {
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

// routes
app.route("/docs", docsRoutes);

app.route("/auth", authRoutes);

app.route("/admin", adminRoutes);

export default app;