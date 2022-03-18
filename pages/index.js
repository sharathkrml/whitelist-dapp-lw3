import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { useState, useEffect, useRef } from "react";
import { Contract, providers } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS } from "../constants";
import WHITELISTABI from "../artifacts/contracts/Whitelist.sol/Whitelist.json";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    const connection = await web3ModalRef.current.connect();
    const provider = new providers.Web3Provider(connection);
    if (needSigner) {
      const signer = provider.getSigner();
      return signer;
    }
    return provider;
  };
  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        WHITELISTABI.abi,
        provider
      );
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (error) {
      console.log(error);
    }
  };
  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // get address
      const address = await signer.getAddress();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        WHITELISTABI.abi,
        signer
      );
      const _whiteListed = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_whiteListed);
    } catch (error) {
      console.log(error);
    }
  };
  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        WHITELISTABI.abi,
        signer
      );
      const txn = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.log(error);
    }
  };
  const setupEventListener = async () => {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      WHITELISTABI.abi,
      signer
    );
    whitelistContract.on("Whitelisted", (...args) => {
      console.log(args);
    });
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal();
      connectWallet();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
