export const EIP712_DOMAIN = {
  name: "My Web3 App",
  version: "1",
} as const;

export const EIP712_TYPES = {
  Login: [
    {
      name: "wallet",
      type: "address",
    },
    {
      name: "nonce",
      type: "string",
    },
  ],
} as const;

export const PRIMARY_TYPE = "Login" as const;
