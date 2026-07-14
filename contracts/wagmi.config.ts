import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'generated/contracts.ts',
  plugins: [
    foundry({
      project: '.',
      artifacts: 'out',
      include: [
        'Counter.sol/**',
        // Add your contract names here
      ],
    }),
  ],
})
