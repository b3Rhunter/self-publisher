import { Col, Row, notification, Modal } from "antd";
import "antd/dist/antd.css";
import {
  useBalance,
  useContractLoader,
  useGasPrice,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { Link, Route, Switch} from "react-router-dom";
import "./App.css";
import { Account, Contract, Header, NetworkDisplay, NetworkSwitch } from "./components";
import { NETWORKS, INFURA_ID } from "./constants";
// contracts
import { Transactor, Web3ModalSetup } from "./helpers";
import { useStaticJsonRPC } from "./hooks";


import Logo from "./images/opinion.svg";
import "./myCss.css";

import newGmn from "./newGMN.json";
import gmnabi from "./gmnabi.json";



import twitterLogo from "./images/twitterLogo.svg";
import discordLogo from "./images/discordLogo.svg";


  const sendNotification = (type, data) => {
    return notification[type]({
      ...data,
      placement: "bottomRight",
    });
  };


const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

/// 📡 What chain are your contracts deployed to?
const initialNetwork = NETWORKS.polygon; // <------- select your target frontend network (localhost, goerli, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = false;
const NETWORKCHECK = true;
const USE_BURNER_WALLET = false; // toggle burner wallet feature
const USE_NETWORK_SELECTOR = false;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://mainnet.infura.io/v3/${INFURA_ID}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = [initialNetwork.name, "mainnet", "goerli"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);


  const targetNetwork = NETWORKS[selectedNetwork];

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider, USE_BURNER_WALLET);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();



  // Load in your local 📝 contract and read a value from it:

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  //
  // If you want to bring in the mainnet DAI contract it would look like:






  /*
  const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  console.log("🏷 Resolved austingriffith.eth as:",addressFromENS)
  */

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      yourMainnetBalance &&
      writeContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");

      console.log("🔐 writeContracts", writeContracts);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    yourMainnetBalance,
    writeContracts,
    localChainId,
  ]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [allPostsData, setAllPosts] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [open, setOpen] = useState();

  const sendNotification = (type, data) => {
    return notification[type]({
      ...data,
      placement: "bottomRight",
    });
  };

  // Sign In With Ethereum

  const handleSignIn = async () => {
    if (web3Modal.cachedProvider === "") {
      return sendNotification("error", {
        message: "Failed to Sign In!",
        description: "Please Connect a wallet before Signing in",
      });
    }

    setIsSigning(true);

    try {
      // sign message using wallet
      const message = `GMN Verify`;
      const address = await userSigner.getAddress();
      let signature = await userSigner.signMessage(message);

      const isValid = await validateUser(message, address, signature);

      if (!isValid) {
        throw new Error("You are not a GMN holder.");
      }

      setIsAuth(isValid);

      // notify user of sign-in
      sendNotification("success", {
        message: "Welcome back " + address.substr(0, 6) + "...",
      });
    } catch (error) {
      sendNotification("error", {
        message: "Verification Failed!",
        description: `Connection issue - ${error.message}`,
      });
    }

    setIsSigning(false);
  };

  // Token Gate 🚫
  const validateUser = async (message, address, signature) => {
    // validate signature
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return false;
    }

    try {
      // validate token balance
      const tokenAddress = "0xfD18418c4AEf8edcAfF3EFea4A4bE2cC1cF2E580";

      const tokenContract = new ethers.Contract(tokenAddress, gmnabi, userSigner);

      const balance = await tokenContract.balanceOf(address);

      return balance.gt(0);
    } catch (error) {
      console.log(error);

      return false;
    }
  };

  function f1() {
    //function to make the text bold using DOM method
    document.getElementById("textarea1").style.fontWeight = "bold";
}
  
function f2() {
    //function to make the text italic using DOM method
    document.getElementById("textarea1").style.fontStyle = "italic";
}
  
function f3() {
    //function to make the text alignment left using DOM method
    document.getElementById("textarea1").style.textAlign = "left";
}
  
function f4() {
    //function to make the text alignment center using DOM method
    document.getElementById("textarea1").style.textAlign = "center";
}
  
function f5() {
    //function to make the text alignment right using DOM method
    document.getElementById("textarea1").style.textAlign = "right";
}
  
function f6() {
    //function to make the text alignment right using DOM method
    document.getElementById("textarea1").style.textAlign = "justify";
}

function f7() {
    var inputValue = document.getElementById('input').value;
    document.getElementById('textarea1').style.fontSize = inputValue + 'px';
    console.log("font size:" + inputValue)
}


  return (
    <div className="App background">

    <div className="twitterContainer">
            <a href="https://twitter.com/GMN_NFT" target="_blank" rel="noreferrer">
              <img 
              src={twitterLogo}
              alt="twitter"
              style={{width: "30px", height: "30px", transform: "rotate(-90deg)"}}
              ></img>
            </a>
      </div>

      <div className="discordContainer">
            <a href="https://discord.gg/sZSJbsZeez" target="_blank" rel="noreferrer">
              <img 
              src={discordLogo}
              alt="substack"
              style={{width: "30px", height: "30px", transform: "rotate(-90deg)"}}
              ></img>
            </a>
      </div>


      {/* ✏️ Edit the header and change the title to your project name */}
      <Header>
        {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flex: 1 }}>
            {USE_NETWORK_SELECTOR && (
              <div style={{ marginRight: 20 }}>
                <NetworkSwitch
                  networkOptions={networkOptions}
                  selectedNetwork={selectedNetwork}
                  setSelectedNetwork={setSelectedNetwork}
                />
              </div>
            )}
            <Account
              useBurner={USE_BURNER_WALLET}
              address={address}
              localProvider={localProvider}
              userSigner={userSigner}
              mainnetProvider={mainnetProvider}
              price={price}
              web3Modal={web3Modal}
              loadWeb3Modal={loadWeb3Modal}
              logoutOfWeb3Modal={logoutOfWeb3Modal}
              blockExplorer={blockExplorer}
            />
          </div>
        </div>
      </Header>

      <button
        className="mint"
        onClick={async () => {

          const headline = document.getElementById("textarea2").value;
          document.getElementById("textarea2").innerHTML = headline;
          console.log(headline)

          const story = document.getElementById("textarea1").value;
           document.getElementById("textarea1").innerHTML = story;
          console.log(story)
          /* look how you call setPurpose on your contract: */
          /* notice how you pass a call back for tx updates too */
          const contract = new ethers.Contract("0x5eEAD112B4A412799c95d18CD995f55860626BD5", newGmn, userSigner);
          const result = tx(contract.CreateNewIssue("" + story, "Test", address), update => {
            console.log("📡 Transaction Update:", update);
            if (update && (update.status === "confirmed" || update.status === 1)) {
              sendNotification("success", {
                message: "Minted",
                description: `Thank you for minting an issue of Good Morning News🙏`,
              });
              console.log(" 🍾 Transaction " + update.hash + " finished!");
              console.log(
                " ⛽️ " +
                  update.gasUsed +
                  "/" +
                  (update.gasLimit || update.gas) +
                  " @ " +
                  parseFloat(update.gasPrice) / 1000000000 +
                  " gwei",
              );
            }
          });
          console.log("awaiting metamask/web3 confirm result...", result);
          console.log(await result);
        }}
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          display: "block",
          width: "auto",
          cursor: "pointer",
          zIndex: "10",
        }}
        type="default"
      >
        <strong>Publish</strong>
      </button>

      <div className=" p-12 mobile" style={{ marginBottom: "0px" }}>
        <div className="container mx-auto">
          <img className=" logo" style={{ paddingTop: "100px" }} src={Logo} alt="logo"></img>

          <section style={{marginBottom: "100px"}}>
            <div className="flex-box">
            <div className="row">
              <div className="col">
                <button onClick={f1} className="text-btn">
                  Bold
                </button>
                <button onClick={f2} className="text-btn">
                  Italic
                </button>
                <button onClick={f3} className="text-btn">
                  Left
                </button >
                <button onClick={f4} className="text-btn">
                  Center
                </button>
                <button onClick={f5} className="text-btn">
                  Right
                </button>
                <button onClick={f6} className="text-btn">
                  Justify
                </button>
                <button className="text-btn side" type="button" onclick ="f7()">Font Size</button>
			          <input style={{width: "35px", height: "35px", backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid #E100FF", borderRadius: "5px", textAlign: "center", position: "relative", top: "0px", padding: "auto"}} id='input' placeholder="18"></input>


                <div className="row">
                  <div className="col-md-3 col-sm-3">
                    <div className="col-md-6 col-sm-9">
                      <input className="newHeadline" style={{fontSize: "24px"}} id="textarea2" rows="1" cols="100" placeholder="headline..."></input>
                    </div>
                    <div className="col-md-3">
                    </div>
                  </div>
                </div>


                <div className="row">
                  <div className="col-md-3 col-sm-3">
                    <div className="col-md-6 col-sm-9">
                      <textarea style={{fontSize: "18px"}} id="textarea1" rows="15" cols="100" placeholder="story..."></textarea>
                    </div>
                    <div className="col-md-3">
                    </div>
                  </div>
                </div>

              </div>
            </div>
            </div>
          </section>


        </div>
      </div>

      <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
      />

      <Switch>
        <Route exact path="/debug">
          {/*
                🎛 this scaffolding is full of commonly used components
                this <Contract/> component will automatically parse your ABI
                and give you a form to interact with it locally
            */}

    
        </Route>
      </Switch>
    </div>
  );
}

export default App;
