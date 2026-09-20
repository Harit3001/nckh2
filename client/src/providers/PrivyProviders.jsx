import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }) {
    return (
        <PrivyProvider
            appId="cmtyod3kv00mz0cl26eclhc60"
            config={
                {
                    appearance: {
                        theme: "light",
                        accentColor: "#676FFF",
                        logo: "",
                    },

                    embedAppearance: {

                        createOnLogin: "users-without-wallets",
                    }
                }
            }
        >
            {children}
        </PrivyProvider>
    )
}