export const EIP712_DOMAIN = {
  name: "My Web3 App",
  version: "1",
};

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
};

export const PRIMARY_TYPE = "Login";
