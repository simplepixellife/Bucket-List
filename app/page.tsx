"use client";
import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ethers } from "ethers";
import styles from "./page.module.css";

// Contract configuration
const CONTRACT_ADDRESS = "0x96685284b51e41FdF64379e5B3C008A389fc25eB";
const ABI = [
  { "inputs": [], "name": "MAX_ITEMS_PER_USER", "outputs": [{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name": "FEE_PER_ITEM", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"string","name":"item","type":"string"}], "name": "addItem", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{"internalType":"address","name":"user","type":"address"}], "name":"getItems","outputs": [{"internalType":"string[]","name":"","type":"string[]"}], "stateMutability":"view","type":"function" },
  { "inputs": [], "name":"clearMyItems","outputs": [], "stateMutability":"nonpayable","type":"function" }
];

// Fee amount as hex (0.0001 ETH = 100000000000000 wei)
const FEE_AMOUNT = "0x5af3107a4000"; // 0.0001 ETH in hex

export default function Home() {
  const { setMiniAppReady, isMiniAppReady } = useMiniKit();

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [myItems, setMyItems] = useState<string[]>([]);
  const [otherItems, setOtherItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [otherAddress, setOtherAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);

  // Example bucket lists to showcase the community feature
  const exampleBucketLists = [
    {
      address: '0x1234...abcd',
      items: [
        'Visit the Northern Lights in Iceland',
        'Skydiving from 15,000 feet',
        'Learn to play the guitar',
        'Road trip across America',
        'Start my own business',
        'Climb Mount Everest',
        'Swim with dolphins',
        'Learn Spanish fluently',
        'Write a bestselling book',
        'Own a supercar'
      ]
    },
    {
      address: '0x5678...efgh',
      items: [
        'See the Egyptian Pyramids',
        'Scuba dive in the Great Barrier Reef',
        'Go to a Metallica concert',
        'Learn a new language',
        'Write a book',
        'Run the New York Marathon',
        'Visit Machu Picchu',
        'See the Taj Mahal',
        'Hot air balloon ride',
        'Master the art of cooking'
      ]
    },
    {
      address: '0x90ab...cdef',
      items: [
        'Visit all 7 continents',
        'Run a marathon',
        'Swim with dolphins',
        'See the Northern Lights',
        'Go on a safari',
        'Learn to fly a plane',
        'Go to space camp',
        'Skydive in Dubai',
        'Taste authentic Italian pizza in Naples',
        'Build my dream house'
      ]
    }
  ];

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady();
    }
  }, [setMiniAppReady, isMiniAppReady]);

  useEffect(() => {
    if (isConnected && typeof window !== 'undefined' && (window as any).ethereum) {
      initializeContract();
    }
  }, [isConnected]);

  const initializeContract = async () => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      
      setSigner(signer);
      setContract(contract);
      
      // Load user's items
      if (userAddress) {
        const items = await contract.getItems(userAddress);
        setMyItems(items);
      }
    } catch (error) {
      console.error('Error initializing contract:', error);
      showNotification('Error connecting to contract', 'error');
    }
  };

  const connectWallet = async () => {
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        showNotification('MetaMask is required', 'error');
        return;
      }
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      const addr = accounts?.[0] || '';
      if (!addr) {
        showNotification('No account found', 'error');
        return;
      }
      // Ensure Base network (8453)
      const provider = new ethers.BrowserProvider(eth);
      const network = await provider.getNetwork();
      if (network.chainId !== 8453n) {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }],
        }).catch(async (err: any) => {
          if (err?.code === 4902) {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                rpcUrls: ['https://mainnet.base.org'],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          } else {
            throw err;
          }
        });
      }
      setUserAddress(addr);
      setIsConnected(true);
    } catch (e: any) {
      showNotification(e?.message || 'Connection failed', 'error');
    }
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getEmojiForItem = (item: string) => {
    const text = item.toLowerCase();
    
    // Travel & Nature - Aurora & Northern Lights
    if ((text.includes('northern') || text.includes('norhern') || text.includes('northen') || text.includes('norther')) && text.includes('light')) return '🌌';
    if (text.includes('aurora borealis') || (text.includes('aurora') && !text.includes('australis'))) return '🌌';
    
    // General Travel
    if (text.includes('travel') || text.includes('visit')) return '✈️';
    if (text.includes('mountain') || text.includes('hiking')) return '⛰️';
    if (text.includes('ocean') || text.includes('beach') || text.includes('sea')) return '🌊';
    if (text.includes('desert') || text.includes('sahara')) return '🏜️';
    if (text.includes('rainforest') || text.includes('jungle')) return '🌴';
    if (text.includes('iceland')) return '🧊';
    if (text.includes('tropical') || text.includes('island')) return '🏝️';
    
    // Adventure & Sports
    if (text.includes('skydiving') || text.includes('parachute')) return '🪂';
    if (text.includes('bungee') || text.includes('jump')) return '🚀';
    if (text.includes('diving') || text.includes('scuba')) return '🤿';
    if (text.includes('surf') || text.includes('surfing')) return '🏄';
    if (text.includes('ski') || text.includes('snowboard')) return '⛷️';
    if (text.includes('snow')) return '❄️';
    if (text.includes('marathon') || text.includes('run')) return '🏃';
    if (text.includes('swim')) return '🏊';
    if (text.includes('climb')) return '🧗';
    
    // Learning & Skills
    if (text.includes('learn') || text.includes('study') || text.includes('course')) return '📚';
    if (text.includes('language')) return '🗣️';
    if (text.includes('cook') || text.includes('cooking') || text.includes('chef')) return '👨‍🍳';
    if (text.includes('code') || text.includes('programming')) return '💻';
    if (text.includes('guitar')) return '🎸';
    if (text.includes('piano') || text.includes('learn music')) return '🎹';
    
    // Animals & Wildlife
    if (text.includes('safari') || text.includes('wildlife')) return '🦁';
    if (text.includes('whale') || text.includes('dolphin')) return '🐋';
    if (text.includes('penguin')) return '🐧';
    if (text.includes('elephant')) return '🐘';
    if (text.includes('shark')) return '🦈';
    
    // Food & Drink
    if (text.includes('fancy restaurant') || text.includes('fine dining') || text.includes('michelin')) return '🍽️';
    if (text.includes('restaurant') || text.includes('eat') || text.includes('dining')) return '🍽️';
    if (text.includes('wine') || text.includes('vineyard')) return '🍷';
    if (text.includes('coffee') || text.includes('cafe')) return '☕';
    if (text.includes('pizza')) return '🍕';
    if (text.includes('sushi')) return '🍣';
    if (text.includes('drink') || text.includes('beer') || text.includes('cocktail')) return '🍺';
    if (text.includes('champagne')) return '🥂';
    
    // Space & Astronomy
    if (text.includes('space') || text.includes('planet') || text.includes('star') || text.includes('galaxy')) return '🚀';
    if (text.includes('moon landing') || text.includes('mars') || text.includes('space travel')) return '🌙';
    if (text.includes('eclipse') || text.includes('comet')) return '🌑';
    
    // Entertainment
    if (text.includes('concert') || text.includes('festival') || text.includes('music')) return '🎵';
    if (text.includes('watch movie') || text.includes('cinema') || text.includes('film')) return '🎬';
    if (text.includes('theme park') || text.includes('disney') || text.includes('roller coaster')) return '🎢';
    
    // Achievement & Life Goals
    if (text.includes('graduate') || text.includes('degree')) return '🎓';
    if (text.includes('write') || text.includes('book') || text.includes('author')) return '📖';
    if (text.includes('start business') || text.includes('startup')) return '💼';
    if (text.includes('retire') || text.includes('retirement')) return '🌴';
    
    // Financial & Money
    if (text.includes('millionaire') || text.includes('rich') || text.includes('wealth')) return '💰';
    if (text.includes('invest') || text.includes('investment') || text.includes('save money')) return '💵';
    
    // Luxury & Expensive Things
    if (text.includes('luxury') || text.includes('expensive') || text.includes('first class')) return '💎';
    if (text.includes('yacht') || text.includes('boat')) return '🛥️';
    if (text.includes('private jet') || text.includes('helicopter')) return '🚁';
    if (text.includes('penthouse') || text.includes('mansion')) return '🏰';
    
    // Cars & Vehicles
    if (text.includes('bugatti') || text.includes('ferrari') || text.includes('lamborghini') || text.includes('supercar') || text.includes('super car')) return '🏎️';
    if (text.includes('drive') || text.includes('driving') || (text.includes('car') && !text.includes('scar'))) return '🚗';
    if (text.includes('motorcycle') || text.includes('motorcycle') || text.includes('motorbike')) return '🏍️';
    
    // Health & Fitness
    if (text.includes('gym') || text.includes('workout') || text.includes('fitness')) return '💪';
    if (text.includes('yoga') || text.includes('meditation')) return '🧘';
    if (text.includes('lose weight') || text.includes('diet')) return '⚖️';
    if (text.includes('healthy lifestyle')) return '🥗';
    
    // Default
    return '✨';
  };

  const handleAddItem = async () => {
    if (!contract || !newItem.trim()) {
      showNotification('Please enter a bucket list item', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      showNotification('Transaction sent! Waiting for confirmation...', 'info');
      
      const tx = await contract.addItem(newItem.trim(), { value: FEE_AMOUNT });
      await tx.wait();
      
      setNewItem('');
      showNotification('Item added successfully! 🎉 (Paid 0.0001 ETH)', 'success');
      
      // Refresh items
      if (userAddress) {
        const items = await contract.getItems(userAddress);
        setMyItems(items);
      }
    } catch (error: any) {
      showNotification(error.message || 'Error adding item', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearItems = async () => {
    if (!contract) return;
    
    if (!confirm('Are you sure you want to clear all your bucket list items?')) return;

    try {
      setIsLoading(true);
      showNotification('Transaction sent! Waiting for confirmation...', 'info');
      
      const tx = await contract.clearMyItems();
      await tx.wait();
      
      showNotification('All items cleared successfully! 🗑️', 'success');
      setMyItems([]);
    } catch (error: any) {
      showNotification(error.message || 'Error clearing items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOther = async () => {
    if (!otherAddress.trim()) {
      // Show example lists
      setOtherItems([]);
      showNotification('Showing example lists! Enter an address to view specific lists.', 'info');
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const items = await readContract.getItems(otherAddress);
      
      setOtherItems(items);
      
      if (items.length === 0) {
        showNotification('No items found for this address.', 'warning');
      } else {
        showNotification(`Found ${items.length} items for this address`, 'success');
      }
    } catch (error: any) {
      showNotification(error.message || 'Error loading items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showExampleLists = () => {
    setOtherItems([]);
    setOtherAddress('');
    showNotification('Browse community examples!', 'info');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>🪣</span>
          Bucket List • Base
        </div>
        <button onClick={connectWallet} className={styles.button}>
          {isConnected && userAddress ? `✅ ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>✨ My Bucket List</h3>
            <div className={styles.row}>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. See the Northern Lights"
                maxLength={140}
                className={styles.input}
              />
              <button
                onClick={handleAddItem}
                disabled={isLoading || !isConnected}
                className={styles.button}
              >
                {isLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
            <div className={styles.muted}>
              You can add up to 10 items. • Fee: 0.0001 ETH (~$0.10) per item
            </div>
            <ul className={styles.list}>
              {myItems.length === 0 ? (
                <li className={styles.emptyItem}>No items yet. Be the first to add one!</li>
              ) : (
                myItems.map((item, i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.emoji}>{getEmojiForItem(item)}</span>
                    <span>{i + 1}. {item}</span>
                  </li>
                ))
              )}
            </ul>
            <div className={styles.row}>
              <button
                onClick={() => isConnected && contract && initializeContract()}
                disabled={!isConnected}
                className={styles.button}
              >
                Refresh
              </button>
              <button
                onClick={handleClearItems}
                disabled={isLoading || !isConnected}
                className={`${styles.button} ${styles.danger}`}
              >
                Clear
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>🌍 From Community</h3>
            <div className={styles.row}>
              <input
                type="text"
                value={otherAddress}
                onChange={(e) => setOtherAddress(e.target.value)}
                placeholder="0x... or browse examples below"
                className={styles.input}
              />
              <button
                onClick={handleViewOther}
                disabled={isLoading}
                className={styles.button}
              >
                {isLoading ? 'Loading...' : 'View'}
              </button>
            </div>
            <button
              onClick={showExampleLists}
              className={styles.exampleButton}
            >
              Browse Example Lists
            </button>
            <ul className={styles.list}>
              {otherItems.length === 0 ? (
                <li className={styles.emptyItem}>Enter an address to view their bucket list!</li>
              ) : (
                otherItems.map((item, i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.emoji}>{getEmojiForItem(item)}</span>
                    <span>{i + 1}. {item}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className={styles.networkInfo}>
          <span className={styles.statusIndicator}></span>
          <div className={styles.muted}>
            Network: Base • <span className={styles.address}>{CONTRACT_ADDRESS}</span>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerText}>
            Built by <span className={styles.footerHighlight}>simplepixellife</span> for <span className={styles.footerHighlight}>Base</span> 🚀
          </div>
          <div className={styles.footerSubtext}>
            Your bucket list. On-chain. Forever.
          </div>
        </div>
      </footer>

      {notification && (
        <div className={`${styles.notification} ${styles[`notification-${notification.type}`]}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}