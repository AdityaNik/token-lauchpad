import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "./components/Navbar";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// // Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import MainContent from "./components/MainContent";

const App = () => {
  return (
    <ThemeProvider>
      <ConnectionProvider
        endpoint={
          "https://solana-devnet.g.alchemy.com/v2/xio_CgWy-_JQRHzbn2e3J2pw5nYesTGp"
        }
      >
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div>
              <Navbar />
              <MainContent />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default App;
