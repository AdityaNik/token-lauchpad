import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { ModeToggle } from "./ui/toggle-button";
import { useWallet } from "@solana/wallet-adapter-react";

const Navbar = () => {
  const { wallet, select, wallets, disconnect } = useWallet();

  return (
    <div className="flex justify-between m-6">
      <div>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          TokeLaunchi
        </h2>
      </div>
      <div className="flex gap-4">
        {wallet ? (
          <div>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              {wallet.adapter.publicKey?.toBase58()}
            </code>
          </div>
        ) : (
          <div></div>
        )}
        <Dialog>
          {!wallet ? (
            <DialogTrigger asChild>
              <Button className="bg-violet-600 hover:bg-violet-800" size={"lg"}>
                Connet Wallet
              </Button>
            </DialogTrigger>
          ) : (
            <Button
              className="bg-violet-600 hover:bg-violet-800"
              size={"lg"}
              onClick={async () => {
                await disconnect();
              }}
            >
              Disconnect
            </Button>
          )}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex justify-center m-4">
                <DialogTitle>
                  <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Connect a wallet on Solana to continue
                  </h2>
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-2">
              {wallets.map((walletList) => {
                return (
                  <div>
                    <DialogClose asChild>
                      <Button
                        className="w-full"
                        size={"lg"}
                        variant={"ghost"}
                        onClick={() => {
                          select(walletList.adapter.name);
                        }}
                      >
                        <img
                          width={25}
                          height={25}
                          src={walletList.adapter.icon}
                          className="m-2 rounded-lg"
                        ></img>
                        {walletList.adapter.name}
                      </Button>
                    </DialogClose>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
