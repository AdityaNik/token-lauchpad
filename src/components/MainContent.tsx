import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  TokenMetadata,
  pack,
  createInitializeInstruction,
} from "@solana/spl-token-metadata";
import { useState } from "react";

const MainContent = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState("newToken");
  const [symbol, setSymbol] = useState("xyz");
  const [image, setImage] = useState(
    "https://cdn.freecodecamp.org/curriculum/cat-photo-app/relaxing-cat.jpg"
  );
  const [supply, setSupply] = useState(1);
  const [decimals, setDecimals] = useState(9);

  // http://i0.kym-cdn.com/entries/icons/original/000/002/232/bullet_cat.jpg

  const createToken = async () => {
    if (!wallet.connected) {
      alert("Connect wallet first...");
      return;
    }
    if (decimals <= 0) {
      alert("Provide decimals...");
      return;
    }
    
    if(wallet.publicKey == null){
      alert("Please connect your wallet");
      return;
    }

    const keyPair = Keypair.generate();

    const metadata: TokenMetadata = {
      updateAuthority: wallet.publicKey,
      mint: keyPair.publicKey,
      name,
      symbol,
      uri: image,
      additionalMetadata: [["description", "Only Possible On Solana"]],
    };
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLength = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLength
    );

    const transcation = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!,
        newAccountPubkey: keyPair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        keyPair.publicKey,
        wallet.publicKey,
        keyPair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        keyPair.publicKey,
        decimals,
        wallet.publicKey!,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: keyPair.publicKey,
        metadata: keyPair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey!,
        updateAuthority: wallet.publicKey!,
      })
    );

    transcation.feePayer = wallet.publicKey!;
    transcation.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transcation.partialSign(keyPair);

    await wallet.sendTransaction(transcation, connection);
    console.log(`Token mint created at ${keyPair.publicKey.toBase58()}`);
    console.log(`Token mint created at ${keyPair.secretKey}`);

    console.log("Minting Tokens.....");
    mintToken(keyPair);
  };

  const mintToken = async (keyPair: Keypair) => {
    const associatedToken = await getAssociatedTokenAddress(
      keyPair.publicKey,
      wallet?.publicKey!,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const transcation = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey!,
        associatedToken,
        wallet.publicKey!,
        keyPair.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    console.log("ATA created " + associatedToken);

    await wallet.sendTransaction(transcation, connection);

    const transcation1 = new Transaction().add(
      createMintToInstruction(
        keyPair.publicKey,
        associatedToken,
        wallet.publicKey!,
        supply * (1 ^ decimals),
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    await wallet.sendTransaction(transcation1, connection);
    console.log(`Minted ${supply} Tokens`);
  };

  return (
    <div className="flex justify-center">
      <Card className="w-full m-12">
        <CardHeader>
          <CardTitle>
            <div className="flex justify-center m -10">
              <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Create Your own Solana Token
              </h2>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label aria-required htmlFor="text">
                    Name
                  </Label>
                  <Input
                    type="text"
                    placeholder="Put the name of your Token"
                    required
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="text">Symbol</Label>
                  <Input
                    type="text"
                    placeholder="Put the symbol of your Token"
                    onChange={(e) => {
                      setSymbol(e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="number">Decimals</Label>
                  <Input
                    type="number"
                    placeholder="Put the decimal of your token (0 to 9)"
                    value={decimals}
                    onChange={(e) => {
                      if (
                        e.target.valueAsNumber < 0 ||
                        e.target.valueAsNumber > 9
                      ) {
                        alert("Don't do this");
                      } else {
                        setDecimals(e.target.valueAsNumber);
                      }
                    }}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="number">Supply</Label>
                  <Input
                    type="number"
                    placeholder=""
                    onChange={(e) => {
                      setSupply(e.target.valueAsNumber);
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="URL">Image</Label>
                  <Input
                    type="url"
                    placeholder="Put image URL"
                    onChange={(e) => {
                      setImage(e.target.value);
                    }}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="text">Discription</Label>
                  <Textarea placeholder="Put the description of your token" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size={"lg"} onClick={createToken}>
            Create Token
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MainContent;
