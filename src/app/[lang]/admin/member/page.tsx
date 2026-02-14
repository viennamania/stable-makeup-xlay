'use client';

import { useState, useEffect, use, act } from "react";

import Image from "next/image";



// open modal

import ModalUser from '@/components/modal-user';

import { useRouter }from "next//navigation";


import { toast } from 'react-hot-toast';

import {
  clientId,
  client
} from "../../../client";



import {
  getContract,
  sendAndConfirmTransaction,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";




import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useWalletBalance,

  useSetActiveWallet,

  useConnectedWallets,


} from "thirdweb/react";

import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";





import {
  getUserEmail,
  getUserPhoneNumber,
} from "thirdweb/wallets/in-app";


import { balanceOf, deposit, transfer } from "thirdweb/extensions/erc20";
import { add } from "thirdweb/extensions/farcaster/keyGateway";
 


import AppBarComponent from "@/components/Appbar/AppBar";
import { getDictionary } from "../../../dictionaries";
//import Chat from "@/components/Chat";
import { ClassNames } from "@emotion/react";


import useSound from 'use-sound';
import { it } from "node:test";
import { get } from "http";


import { useSearchParams } from 'next/navigation';


// import config/payment.ts
import { paymentUrl } from "@/app/config/payment";
import { version } from "../../../config/version";



import {
  ethereum,
  polygon,
  arbitrum,
  bsc,
} from "thirdweb/chains";

import {
  chain,
  ethereumContractAddressUSDT,
  polygonContractAddressUSDT,
  arbitrumContractAddressUSDT,
  bscContractAddressUSDT,

  bscContractAddressMKRW,
} from "@/app/config/contractAddresses";
import * as XLSX from "xlsx";


interface BuyOrder {
  _id: string;
  createdAt: string;
  walletAddress: string;
  nickname: string;
  avatar: string;
  trades: number;
  price: number;
  available: number;
  limit: string;
  paymentMethods: string[];

  usdtAmount: number;
  krwAmount: number;
  rate: number;



  seller: any;

  tradeId: string;
  status: string;
  acceptedAt: string;
  paymentRequestedAt: string;
  paymentConfirmedAt: string;
  cancelledAt: string;


  buyer: any;

  canceller: string;

  escrowTransactionHash: string;
  transactionHash: string;

  storecode: string;

  store: any;

}


/*
const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "email",
        "x",
        "passkey",
        "phone",
        "facebook",
        "line",
        "apple",
        "coinbase",
      ],
    },
  }),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("io.metamask"),
  createWallet("com.bitget.web3"),
  createWallet("com.trustwallet.app"),
  createWallet("com.okex.wallet"),

];
*/
const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google",
        ],
      },
    }),
  ];

const getUserTypeMeta = (userType?: string) => {
  if (userType === 'AAA') {
    return { label: '1등급', className: 'bg-red-500/20 text-red-200 ring-1 ring-red-400/40' };
  }
  if (userType === 'BBB') {
    return { label: '2등급', className: 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/40' };
  }
  if (userType === 'CCC') {
    return { label: '3등급', className: 'bg-yellow-500/20 text-yellow-200 ring-1 ring-yellow-400/40' };
  }
  if (userType === 'DDD') {
    return { label: '4등급', className: 'bg-green-500/20 text-green-200 ring-1 ring-green-400/40' };
  }
  return { label: '일반', className: 'bg-slate-500/20 text-slate-200 ring-1 ring-slate-400/40' };
};

const getBuyOrderStatusMeta = (status?: string) => {
  if (status === 'ordered') {
    return { label: '구매주문', className: 'text-amber-300' };
  }
  if (status === 'accepted') {
    return { label: '판매자확정', className: 'text-cyan-300' };
  }
  if (status === 'paymentRequested') {
    return { label: '결제요청', className: 'text-orange-300' };
  }
  if (status === 'paymentConfirmed') {
    return { label: '결제완료', className: 'text-emerald-300' };
  }
  if (status === 'cancelled') {
    return { label: '거래취소', className: 'text-rose-300' };
  }
  return { label: '-', className: 'text-slate-400' };
};

const formatDateTimeForDisplay = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};
  





export default function Index({ params }: any) {




  const searchParams = useSearchParams();
 
  const wallet = searchParams.get('wallet');


  // limit, page number params

  const limit = searchParams.get('limit') || 20;
  const page = searchParams.get('page') || 1;


  const searchParamsStorecode = searchParams.get('storecode') || "";




  const activeWallet = useActiveWallet();
    

  const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    
    
    //chain: arbitrum,
    chain:  chain === "ethereum" ? ethereum :
            chain === "polygon" ? polygon :
            chain === "arbitrum" ? arbitrum :
            chain === "bsc" ? bsc : arbitrum,
  
  
  
    // the contract's address
    ///address: contractAddressArbitrum,

    address: chain === "ethereum" ? ethereumContractAddressUSDT :
            chain === "polygon" ? polygonContractAddressUSDT :
            chain === "arbitrum" ? arbitrumContractAddressUSDT :
            chain === "bsc" ? bscContractAddressUSDT : arbitrumContractAddressUSDT,


    // OPTIONAL: the contract's abi
    //abi: [...],
  });


 


  useEffect(() => {
    // Dynamically load the Binance widget script
    const script = document.createElement("script");
    script.src = "https://public.bnbstatic.com/unpkg/growth-widget/cryptoCurrencyWidget@0.0.20.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);





  const [data, setData] = useState({
    title: "",
    description: "",

    menu : {
      buy: "",
      sell: "",
      trade: "",
      chat: "",
      history: "",
      settings: "",
    },

    Go_Home: "",
    Buy: "",
    Sell: "",
    Amount: "",
    Price: "",
    Total: "",
    Orders: "",
    Trades: "",
    Search_my_trades: "",

    Anonymous: "",

    Seller: "",
    Buyer: "",
    Me: "",

    Buy_USDT: "",
    Rate: "",
    Payment: "",
    Bank_Transfer: "",

    I_agree_to_the_terms_of_trade: "",
    I_agree_to_cancel_the_trade: "",

    Opened_at: "",
    Cancelled_at: "",
    Completed_at: "",


    Opened: "",
    Completed: "",
    Cancelled: "",


    Waiting_for_seller_to_deposit: "",

    to_escrow: "",
    If_the_seller_does_not_deposit_the_USDT_to_escrow: "",
    this_trade_will_be_cancelled_in: "",

    Cancel_My_Trade: "",


    Order_accepted_successfully: "",
    Order_has_been_cancelled: "",
    My_Order: "",

    hours: "",
    minutes: "",
    seconds: "",

    hours_ago: "",
    minutes_ago: "",
    seconds_ago: "",

    Order_Opened: "",
    Trade_Started: "",
    Expires_in: "",

    Accepting_Order: "",

    Escrow: "",

    Chat_with_Seller: "",
    Chat_with_Buyer: "",

    Table_View: "",

    TID: "",

    Status: "",

    Sell_USDT: "",

    Buy_Order_Opened: "",
  
    Insufficient_balance: "",


    Request_Payment: "",

    Payment_has_been_confirmed: "",

    Confirm_Payment: "",

    Escrow_Completed: "",

    Buy_Order_Accept: "",

    Payment_Amount: "",

    Buy_Amount: "",

    Deposit_Name: "",

    My_Balance: "",

    Make_Escrow_Wallet: "",
    Escrow_Wallet_Address_has_been_created: "",
    Failed_to_create_Escrow_Wallet_Address: "",

    Newest_order_has_been_arrived: "",
    Payment_request_has_been_sent: "",
    Escrow_balance_is_less_than_payment_amount: "",

    Copied_Wallet_Address: "",


  } );

  useEffect(() => {
      async function fetchData() {
          const dictionary = await getDictionary(params.lang);
          setData(dictionary);
      }
      fetchData();
  }, [params.lang]);

  const {
    title,
    description,
    menu,
    Go_Home,
    Buy,
    Sell,
    Amount,
    Price,
    Total,
    Orders,
    Trades,
    Search_my_trades,

    Anonymous,

    Seller,
    Buyer,
    Me,

    Buy_USDT,
    Rate,
    Payment,
    Bank_Transfer,
    I_agree_to_the_terms_of_trade,
    I_agree_to_cancel_the_trade,

    Opened_at,
    Cancelled_at,
    Completed_at,

    Opened,
    Completed,
    Cancelled,

    Waiting_for_seller_to_deposit,

    to_escrow,

    If_the_seller_does_not_deposit_the_USDT_to_escrow,
    this_trade_will_be_cancelled_in,

    Cancel_My_Trade,

    Order_accepted_successfully,
    Order_has_been_cancelled,
    My_Order,

    hours,
    minutes,
    seconds,

    hours_ago,
    minutes_ago,
    seconds_ago,

    Order_Opened,
    Trade_Started,
    Expires_in,

    Accepting_Order,

    Escrow,

    Chat_with_Seller,
    Chat_with_Buyer,

    Table_View,

    TID,

    Status,

    Sell_USDT,

    Buy_Order_Opened,

    Insufficient_balance,

    Request_Payment,

    Payment_has_been_confirmed,

    Confirm_Payment,

    Escrow_Completed,

    Buy_Order_Accept,

    Payment_Amount,

    Buy_Amount,

    Deposit_Name,

    My_Balance,

    Make_Escrow_Wallet,
    Escrow_Wallet_Address_has_been_created,
    Failed_to_create_Escrow_Wallet_Address,

    Newest_order_has_been_arrived,
    Payment_request_has_been_sent,
    Escrow_balance_is_less_than_payment_amount,

    Copied_Wallet_Address,

  } = data;




  const router = useRouter();



  /*
  const setActiveAccount = useSetActiveWallet();
 

  const connectWallets = useConnectedWallets();

  const smartConnectWallet = connectWallets?.[0];
  const inAppConnectWallet = connectWallets?.[1];
  */


  const activeAccount = useActiveAccount();

  const address = activeAccount?.address;



  const [phoneNumber, setPhoneNumber] = useState("");

  
  useEffect(() => {

    if (address) {

  

      //const phoneNumber = await getUserPhoneNumber({ client });
      //setPhoneNumber(phoneNumber);


      getUserPhoneNumber({ client }).then((phoneNumber) => {
        setPhoneNumber(phoneNumber || "");
      });

    }

  } , [address]);
  


  


  // get User by wallet address
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);





  useEffect(() => {

    if (address) {

      getUserEmail({ client }).then((email) => {
        console.log('email', email);

        if (email) {
          

          fetch('/api/user/setUserVerified', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // storecode, walletAddress, nickname, mobile, email
            body: JSON.stringify({
              storecode: "admin",
              walletAddress: address,
              nickname: email,
              mobile: '+82',
              email: email,
            }),
          })
          .then(response => response.json())
          .then(data => {
              //console.log('data', data);



              fetch('/api/user/getUser', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  storecode: "admin",
                  walletAddress: address,
                }),
              })
              .then(response => response.json())
              .then(data => {
                  //console.log('data', data);
                  setUser(data.result);
                  setIsAdmin(data.result?.role === "admin");
              })

          });



        }

      });

  

      //const phoneNumber = await getUserPhoneNumber({ client });
      //setPhoneNumber(phoneNumber);


      getUserPhoneNumber({ client }).then((phoneNumber) => {
        setPhoneNumber(phoneNumber || "");
      });

    }

  } , [address]);



  
  useEffect(() => {

    if (!address) {

      setUser(null);
      return;
    }

    setLoadingUser(true);

    fetch('/api/user/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            storecode: "admin",
            walletAddress: address,
        }),
    })
    .then(response => response.json())
    .then(data => {
        
        //console.log('data.result', data.result);


        setUser(data.result);
        setIsAdmin(data.result?.role === "admin");

    })
    .catch((error) => {
        console.error('Error:', error);
        setUser(null);
        setIsAdmin(false);
    });

    setLoadingUser(false);


  } , [address]);





  const [isPlaying, setIsPlaying] = useState(false);
  //const [play, { stop }] = useSound(galaxySfx);
  const [play, { stop }] = useSound('/ding.mp3');

  function playSong() {
    setIsPlaying(true);
    play();
  }

  function stopSong() {
    setIsPlaying(false);
    stop();
  }






  const [isModalOpen, setModalOpen] = useState(false);

  const closeModal = () => setModalOpen(false);
  const openModal = () => setModalOpen(true);

  


  const [searchMyOrders, setSearchMyOrders] = useState(false);



  // limit number
  const [limitValue, setLimitValue] = useState(limit || 20);
  useEffect(() => {
    setLimitValue(limit || 20);
  }, [limit]);

  // page number
  const [pageValue, setPageValue] = useState(page || 1);
  useEffect(() => {
    setPageValue(page || 1);
  }, [page]);




  //const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);


  //console.log('buyOrders', buyOrders);

  



  /* agreement for trade */
  const [agreementForTrade, setAgreementForTrade] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
      agreementForTrade.push(false);
  }
  /*
  useEffect(() => {
      setAgreementForTrade (
          buyOrders.map((item, idx) => {
              return false;
          })
      );
  } , [buyOrders]);
    */
    
    
  // initialize false array of 100
  const [acceptingBuyOrder, setAcceptingBuyOrder] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
      acceptingBuyOrder.push(false);
  }

   



   
    /*
    useEffect(() => {
        setAcceptingBuyOrder (
            buyOrders.map((item, idx) => {
                return false;
            })
        );
    } , [buyOrders]);
     */




  // agreement for cancel trade
  const [agreementForCancelTrade, setAgreementForCancelTrade] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    agreementForCancelTrade.push(false);
  }
  /*
  useEffect(() => {
    setAgreementForCancelTrade(
      buyOrders.map(() => false)
    );
  } , [buyOrders]);
   */












    // request payment check box
    const [requestPaymentCheck, setRequestPaymentCheck] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      requestPaymentCheck.push(false);
    }

    /*
    useEffect(() => {
        
        setRequestPaymentCheck(
          new Array(buyOrders.length).fill(false)
        );
  
    } , [buyOrders]);
     */
    




    // array of escrowing
    const [escrowing, setEscrowing] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      escrowing.push(false);
    }

    /*
    useEffect(() => {
        
        setEscrowing(
          new Array(buyOrders.length).fill(false)
        );
  
    } , [buyOrders]);
     */

    // array of requestingPayment
    const [requestingPayment, setRequestingPayment] = useState([] as boolean[]);
    for (let i = 0; i < 100; i++) {
      requestingPayment.push(false);
    }


    /*
    useEffect(() => {

      setRequestingPayment(

        new Array(buyOrders.length).fill(false)

      );

    } , [buyOrders]);
      */







  // array of confirmingPayment

  const [confirmingPayment, setConfirmingPayment] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    confirmingPayment.push(false);
  }

  /*
  useEffect(() => {
      
      setConfirmingPayment(
        new Array(buyOrders.length).fill(false)
      );

  } , [buyOrders]);
   */


  // confirm payment check box
  const [confirmPaymentCheck, setConfirmPaymentCheck] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    confirmPaymentCheck.push(false);
  }

  /*
  useEffect(() => {
      
      setConfirmPaymentCheck(
        new Array(buyOrders.length).fill(false)
      );

  } , [buyOrders]);
    */






  const [storeAdminWalletAddress, setStoreAdminWalletAddress] = useState("");

  const [fetchingStore, setFetchingStore] = useState(false);
  const [store, setStore] = useState(null) as any;

  useEffect(() => {

    setFetchingStore(true);

    const fetchData = async () => {
        const response = await fetch("/api/store/getOneStore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
              storecode: "admin",
              ////walletAddress: address,
            }),
        });

        const data = await response.json();

        //console.log("data", data);

        if (data.result) {

          setStore(data.result);

          setStoreAdminWalletAddress(data.result?.adminWalletAddress);

        }

        setFetchingStore(false);
    };

    fetchData();

  } , []);



  //const [searchStorecode, setSearchStorecode] = useState(searchParamsStorecode || "");




  const [searchBuyer, setSearchBuyer] = useState("");

  const [searchDepositName, setSearchDepositName] = useState("");


  // fetch all buyer user 
  const [fetchingAllBuyer, setFetchingAllBuyer] = useState(false);
  const [allBuyer, setAllBuyer] = useState([] as any[]);
  const [totalCount, setTotalCount] = useState(0);
  const [exportingBuyerExcel, setExportingBuyerExcel] = useState(false);

  const getBuyerSearchPayload = (requestLimit: number, requestPage: number) => {
    return {
      storecode: searchParamsStorecode,
      search: searchBuyer,
      depositName: searchDepositName,
      limit: requestLimit,
      page: requestPage,
    };
  };
    
  const fetchAllBuyer = async (
    requestPage: number = Number(pageValue),
    requestLimit: number = Number(limitValue),
  ) => {
    if (fetchingAllBuyer) {
      return;
    }
    setFetchingAllBuyer(true);
    const response = await fetch('/api/user/getAllBuyers', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(getBuyerSearchPayload(requestLimit, requestPage)),
    });
    if (!response.ok) {
      setFetchingAllBuyer(false);
      toast.error('회원 검색에 실패했습니다.');
      return;
    }
    const data = await response.json();
    //console.log('data', data);
    setAllBuyer(data.result.users);
    setTotalCount(data.result.totalCount);

    setFetchingAllBuyer(false);

    return data.result.users;
  };

  const fetchAllBuyerForExcel = async () => {
    const batchLimit = 500;
    let currentPage = 1;
    let collectedUsers: any[] = [];
    let totalResultCount = 0;

    while (true) {
      const response = await fetch('/api/user/getAllBuyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getBuyerSearchPayload(batchLimit, currentPage)),
      });

      if (!response.ok) {
        throw new Error('회원 검색에 실패했습니다.');
      }

      const data = await response.json();
      const users = data?.result?.users || [];
      const totalCount = Number(data?.result?.totalCount || 0);

      if (currentPage === 1) {
        totalResultCount = totalCount;
      }

      collectedUsers = [...collectedUsers, ...users];

      if (users.length === 0 || collectedUsers.length >= totalResultCount) {
        break;
      }

      currentPage += 1;
    }

    return collectedUsers;
  };

  const downloadBuyerExcel = async () => {
    if (exportingBuyerExcel) {
      return;
    }

    setExportingBuyerExcel(true);

    try {
      const users = await fetchAllBuyerForExcel();

      if (!users.length) {
        toast.error('엑셀로 내보낼 회원 데이터가 없습니다.');
        return;
      }

      const rows = users.map((item: any, index: number) => {
        const userTypeMeta = getUserTypeMeta(item?.userType);
        const statusMeta = getBuyOrderStatusMeta(item?.buyOrderStatus);

        return {
          No: index + 1,
          가입일시: formatDateTimeForDisplay(item?.createdAt),
          회원아이디: item?.nickname || '',
          회원등급: userTypeMeta.label,
          가맹점명: item?.store?.storeName || '',
          가맹점코드: item?.store?.storecode || item?.storecode || '',
          입금은행: item?.buyer?.depositBankName || '',
          계좌번호: item?.buyer?.depositBankAccountNumber || '',
          입금자명: item?.buyer?.depositName || '',
          결제건수: Number(item?.totalPaymentConfirmedCount || 0),
          결제금액원: Number(item?.totalPaymentConfirmedKrwAmount || 0),
          구매량USDT: Number(item?.totalPaymentConfirmedUsdtAmount || 0),
          주문상태: statusMeta.label,
          지갑주소: item?.walletAddress || '',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [
        { wch: 7 },
        { wch: 22 },
        { wch: 18 },
        { wch: 10 },
        { wch: 20 },
        { wch: 16 },
        { wch: 14 },
        { wch: 22 },
        { wch: 14 },
        { wch: 12 },
        { wch: 16 },
        { wch: 13 },
        { wch: 12 },
        { wch: 46 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

      const now = new Date();
      const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      const storeSegment = searchParamsStorecode ? searchParamsStorecode : 'all';

      XLSX.writeFile(workbook, `member-search-results-${storeSegment}-${stamp}.xlsx`);
      toast.success(`엑셀 다운로드 완료 (${rows.length}건)`);
    } catch (error) {
      console.error(error);
      toast.error('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setExportingBuyerExcel(false);
    }
  };

  

  useEffect(() => {
    if (!address) {
      setAllBuyer([]);
      return;
    }
    fetchAllBuyer();
  ///} , [address, limitValue, pageValue, searchStorecode]);

  } , [address, limitValue, pageValue, searchParamsStorecode]);





  {/*
  {"storecode":"teststorecode","storeName":"테스트상점","storeType":"test","storeUrl":"https://test.com","storeDescription":"설명입니다.","storeLogo":"https://test.com/logo-xlay.jpg","storeBanner":"https://test.com/banner.png"}
  */}

  // insert buyer user
  const [userCode, setUserCode] = useState('');
  
  

  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userBankDepositName, setUserBankDepositName] = useState('');
  const [userBankName, setUserBankName] = useState('');
  const [userBankAccountNumber, setUserBankAccountNumber] = useState('');
  const [userType, setUserType] = useState('');



  const [insertingUserCode, setInsertingUserCode] = useState(false);
  const insertBuyer = async () => {
    if (insertingUserCode) {
      return;
    }


    if (!address) {
      toast.error('지갑을 연결해주세요.');
      return;
    }

    if (!userPassword) {
      toast.error('비밀번호를 입력해주세요.');
      return;
    }
    if (!userName) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    if (!userBankDepositName) {
      toast.error('입금자명을 입력해주세요.');
      return;
    }
    if (!userBankName) {
      toast.error('은행명을 입력해주세요.');
      return;
    }
    if (!userBankAccountNumber) {
      toast.error('계좌번호를 입력해주세요.');
      return;
    }

    /*
    if (searchStorecode === '') {
      toast.error('가맹점 코드를 선택해주세요.');
      return;
    }
    */
    if (searchParamsStorecode === '') {
      toast.error('가맹점 코드를 선택해주세요.');
      return;
    }


    let generatedUserCode = userCode;
    
    if (userCode === '') {

      
      // generate user code
      // start with lowercase alphabet
      // lowercase alphabet and number
      // generate random user code with 4 ~ 20 characters
      
      
      //const randomString = (Math.random().toString(36).substring(2, 10)).toLowerCase();

      // randomString is lowercase alphabet
      let randomString = '';
      const characters = 'abcdefghijklmnopqrstuvwxyz';
      for (let i = 0; i < 8; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const randomNumber = Math.floor(Math.random() * 1000);
      const generatedUserCode = randomString + randomNumber;

    }

  
    

    //console.log('generatedUserCode', generatedUserCode);


    setInsertingUserCode(true);
    const response = await fetch('/api/user/setBuyerWithoutWalletAddressByStorecode', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          //storecode: searchStorecode,
          storecode: searchParamsStorecode,


          walletAddress: address,
          userCode: generatedUserCode,
          userPassword: userPassword,
          userName: userName,
          userBankDepositName: userBankDepositName,
          userBankName: userBankName,
          userBankAccountNumber: userBankAccountNumber,
          userType: userType,
        }
      ),
    });
    if (!response.ok) {
      setInsertingUserCode(false);
      toast.error('회원 아이디 추가에 실패했습니다.');
      return;
    }

    setInsertingUserCode(false);

    const data = await response.json();
    
    //console.log('setBuyerWithoutWalletAddressByStorecode data', data);

    if (data.result) {
      toast.success('회원 아이디가 추가되었습니다.');
      setUserCode('');
      setUserPassword('');
      setUserName('');
      setUserBankDepositName('');
      setUserBankName('');
      setUserBankAccountNumber('');
      setUserType('');


      // fetch all buyer user
      fetchAllBuyer();
    } else {
      toast.error('회원 아이디 추가에 실패했습니다.');
    }


    return;
  }





  /*
  {
    "_id": "681991dcd631f7d635a06492",
    "storecode": "handsome",
    "storeName": "핸썸",
    "storeType": "test",
    "storeUrl": "https://test.com",
    "storeDescription": "설명입니다.",
    "storeLogo": "https://xlay-tether.vercel.app/logo-xlay.jpg",
    "storeBanner": "https://xlay-tether.vercel.app/logo-xlay.jpg",
    "createdAt": "2025-05-06T04:36:44.683Z"
    "adminWalletAddress": "0x2111b6A49CbFf1C8Cc39d13250eF6bd4e1B59cF6",
  }
  */
  




  /*
  // get All users by storecode
  const [fetchingAllUsers, setFetchingAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([] as any[]);
  const [userTotalCount, setUserTotalCount] = useState(0);
  const fetchAllUsers = async () => {
    if (fetchingAllUsers) {
      return;
    }
    setFetchingAllUsers(true);
    const response = await fetch('/api/user/getAllUsersByStorecode', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          storecode: "admin",
        }
      ),
    });
    if (!response.ok) {
      setFetchingAllUsers(false);
      return;
    }
    const data = await response.json();
    
    //console.log('getAllUsersByStorecode data', data);

    setAllUsers(data.result.users);
    setUserTotalCount(data.result.totalCount);

    setFetchingAllUsers(false);

    return data.result.users;
  }

  useEffect(() => {
    if (!address) {
      setAllUsers([]);
      return;
    }
    fetchAllUsers();
    // interval
    const interval = setInterval(() => {
      fetchAllUsers();
    } , 5000);
    return () => clearInterval(interval);
  } , [address]);
  //console.log('allUsers', allUsers);
  */



  /*
  {
    "_id": "6819b8071da61ff93eeac02e",
    "id": 3497428,
    "email": null,
    "nickname": "bansua",
    "mobile": "",
    "storecode": "handsome",
    "walletAddress": "0x4020CDbd580603dEd0eAe33520b1F4A1653010fF",
    "createdAt": "2025-05-06T07:19:35.173Z",
    "settlementAmountOfFee": "0",
    "verified": true
  }
  */


  // update adminWalletAddress of store
  // 관리자 지갑 변경
  /*
  const [updatingAdminWalletAddress, setUpdatingAdminWalletAddress] = useState(false);
  const [selectedAdminWalletAddress, setSelectedAdminWalletAddress] = useState('');
  const updateAdminWalletAddress = async () => {
    if (updatingAdminWalletAddress) {
      return;
    }
    setUpdatingAdminWalletAddress(true);
    const response = await fetch('/api/store/updateStoreAdminWalletAddress', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          storecode: "admin",
          adminWalletAddress: selectedAdminWalletAddress,
        }
      ),
    });
    if (!response.ok) {
      setUpdatingAdminWalletAddress(false);
      toast.error('가맹점 관리자 변경에 실패했습니다.');
      return;
    }

    const data = await response.json();
    //console.log('data', data);
    if (data.result) {
      toast.success('가맹점 관리자가 변경되었습니다.');
      setSelectedAdminWalletAddress('');

      fetchStore();

    } else {
      toast.error('가맹점 관리자 변경에 실패했습니다.');
    }

    setUpdatingAdminWalletAddress(false);

    return data.result;
  }

  */






  const [usdtBalance, setUsdtBalance] = useState([] as any[]);

  allBuyer.forEach((user) => {
    usdtBalance.push(0);
  });




  const getBalanceOfWalletAddress = async (walletAddress: string) => {
  

    const balance = await balanceOf({
      contract,
      address: walletAddress,
    });
    
    console.log('getBalanceOfWalletAddress', walletAddress, 'balance', balance);

    //toast.success(`잔액이 업데이트되었습니다. 잔액: ${(Number(balance) / 10 ** 6).toFixed(3)} USDT`);

    // if chain is bsc, then 10 ** 18
    if (chain === 'bsc') {
      toast.success(`잔액이 업데이트되었습니다. 잔액: ${(Number(balance) / 10 ** 18).toFixed(3)} USDT`);
    } else {
      toast.success(`잔액이 업데이트되었습니다. 잔액: ${(Number(balance) / 10 ** 6).toFixed(3)} USDT`);
    }

    /*
    setAllUsers((prev) => {
      const newUsers = [...prev];
      const index = newUsers.findIndex(u => u.walletAddress === walletAddress);
      if (index !== -1) {
        newUsers[index] = {
          ...newUsers[index],
          usdtBalance: Number(balance) / 10 ** 6,
        };
      }
      return newUsers;
    });
    */


    // update the usdtBalance of the user
    
    setUsdtBalance((prev) => {
      const newUsdtBalance = [...prev];
      const index = allBuyer.findIndex(u => u.walletAddress === walletAddress);
      if (index !== -1) {
        newUsdtBalance[index] = Number(balance) / 10 ** 6; // Convert to USDT
      }
      return newUsdtBalance;
    });




    return Number(balance) / 10 ** 6; // Convert to USDT

  };



  // clearanceWalletAddress
  const [clearanceingWalletAddress, setClearanceingWalletAddress] = useState([] as boolean[]);
  for (let i = 0; i < 100; i++) {
    clearanceingWalletAddress.push(false);
  }

  const clearanceWalletAddress = async (walletAddress: string) => {
    
    if (clearanceingWalletAddress.includes(true)) {
      return;
    }


    // api call to clear the wallet address
    setClearanceingWalletAddress((prev) => {
      const newClearanceing = [...prev];
      const index = newClearanceing.findIndex(u => u === false);
      if (index !== -1) {
        newClearanceing[index] = true;
      }
      return newClearanceing;
    });


    
    const response = await fetch('/api/user/clearanceWalletAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: walletAddress,
      }),
    });

    if (!response.ok) {
      setClearanceingWalletAddress((prev) => {
        const newClearanceing = [...prev];
        const index = newClearanceing.findIndex(u => u === true);
        if (index !== -1) {
          newClearanceing[index] = false;
        }
        return newClearanceing;
      });
      toast.error('지갑 주소 정산에 실패했습니다.');
      return;
    }

    const data = await response.json();
    //console.log('clearanceWalletAddress data', data);
    if (data.result) {
      toast.success('지갑 주소 정산이 완료되었습니다.');
      // update the balance of the user
      getBalanceOfWalletAddress(walletAddress);
    } else {
      toast.error('지갑 주소 정산에 실패했습니다.');
    }
    setClearanceingWalletAddress((prev) => {
      const newClearanceing = [...prev];
      const index = newClearanceing.findIndex(u => u === true);
      if (index !== -1) {
        newClearanceing[index] = false;
      }
      return newClearanceing;
    });
    return data.result;
  };









  // check table view or card view
  const [tableView, setTableView] = useState(true);



  const [selectedItem, setSelectedItem] = useState<any>(null);


  // get All stores
  const [fetchingAllStores, setFetchingAllStores] = useState(false);
  const [allStores, setAllStores] = useState([] as any[]);
  const [storeTotalCount, setStoreTotalCount] = useState(0);
  const fetchAllStores = async () => {
    if (fetchingAllStores) {
      return;
    }
    setFetchingAllStores(true);
    const response = await fetch('/api/store/getAllStores', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          limit: 100,
          page: 1,
        }
      ),
    });

    if (!response.ok) {
      setFetchingAllStores(false);
      toast.error('가맹점 검색에 실패했습니다.');
      return;
    }

    const data = await response.json();
    
    console.log('getAllStores data', data);




    setAllStores(data.result.stores);
    setStoreTotalCount(data.result.totalCount);
    setFetchingAllStores(false);
    return data.result.stores;
  }
  useEffect(() => {
    if (!address) {
      setAllStores([]);
      return;
    }
    fetchAllStores();
  }, [address]);

  //console.log('allStores', allStores);




  // array of depositAmountKrw
  const [depositAmountKrw, setDepositAmountKrw] = useState([] as number[]);
  for (let i = 0; i < 100; i++) {
    depositAmountKrw.push(0);
  }




 // totalNumberOfBuyOrders
  const [loadingTotalNumberOfBuyOrders, setLoadingTotalNumberOfBuyOrders] = useState(false);
  const [totalNumberOfBuyOrders, setTotalNumberOfBuyOrders] = useState(0);
  const [processingBuyOrders, setProcessingBuyOrders] = useState([] as BuyOrder[]);
  const [totalNumberOfAudioOnBuyOrders, setTotalNumberOfAudioOnBuyOrders] = useState(0);


  // Move fetchTotalBuyOrders outside of useEffect to avoid self-reference error
  const fetchTotalBuyOrders = async (): Promise<void> => {
    setLoadingTotalNumberOfBuyOrders(true);
    const response = await fetch('/api/order/getTotalNumberOfBuyOrders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      console.error('Failed to fetch total number of buy orders');
      setLoadingTotalNumberOfBuyOrders(false);
      return;
    }
    const data = await response.json();
    //console.log('getTotalNumberOfBuyOrders data', data);
    setTotalNumberOfBuyOrders(data.result.totalCount);
    setProcessingBuyOrders(data.result.orders);

    setTotalNumberOfAudioOnBuyOrders(data.result.audioOnCount);
    setLoadingTotalNumberOfBuyOrders(false);
  };

  useEffect(() => {
    if (!address) {
      setTotalNumberOfBuyOrders(0);
      return;
    }

    fetchTotalBuyOrders();

    const interval = setInterval(() => {
      fetchTotalBuyOrders();
    }, 5000);
    return () => clearInterval(interval);

  }, [address]);

      
  /*
  useEffect(() => {
    if (totalNumberOfBuyOrders > 0 && loadingTotalNumberOfBuyOrders === false) {
      const audio = new Audio('/notification.wav'); 
      audio.play();
    }
  }, [totalNumberOfBuyOrders, loadingTotalNumberOfBuyOrders]);
  */

  useEffect(() => {
    if (totalNumberOfAudioOnBuyOrders > 0 && loadingTotalNumberOfBuyOrders === false) {
      const audio = new Audio('/notification-buy-order.wav');

      audio.play();
    }
  }, [totalNumberOfAudioOnBuyOrders, loadingTotalNumberOfBuyOrders]);






  // totalNumberOfClearanceOrders
  const [loadingTotalNumberOfClearanceOrders, setLoadingTotalNumberOfClearanceOrders] = useState(false);
  const [totalNumberOfClearanceOrders, setTotalNumberOfClearanceOrders] = useState(0);
  const [processingClearanceOrders, setProcessingClearanceOrders] = useState([] as BuyOrder[]);
  useEffect(() => {
    if (!address) {
      setTotalNumberOfClearanceOrders(0);
      return;
    }

    const fetchTotalClearanceOrders = async () => {
      setLoadingTotalNumberOfClearanceOrders(true);
      const response = await fetch('/api/order/getTotalNumberOfClearanceOrders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        }),
      });
      if (!response.ok) {
        console.error('Failed to fetch total number of clearance orders');
        return;
      }
      const data = await response.json();
      //console.log('getTotalNumberOfClearanceOrders data', data);
      setTotalNumberOfClearanceOrders(data.result.totalCount);
      setProcessingClearanceOrders(data.result.orders);
      setLoadingTotalNumberOfClearanceOrders(false);
    };

    fetchTotalClearanceOrders();

    const interval = setInterval(() => {
      fetchTotalClearanceOrders();
    }, 5000);
    return () => clearInterval(interval);

  }, [address]);

  useEffect(() => {
    if (totalNumberOfClearanceOrders > 0 && loadingTotalNumberOfClearanceOrders === false) {
      const audio = new Audio('/notification.wav');
      audio.play();
    }
  }, [totalNumberOfClearanceOrders, loadingTotalNumberOfClearanceOrders]);



  if (address && !loadingUser && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center">

        <h1 className="text-2xl font-bold">접근권한을 체크중입니다...</h1>
        <p className="text-lg">이 페이지에 접근할 권한이 없습니다.</p>
        <div className="text-lg ">{address}</div>

              {/* logout button */}
              <button
                  onClick={() => {
                      confirm("로그아웃 하시겠습니까?") && activeWallet?.disconnect()
                      .then(() => {

                          toast.success('로그아웃 되었습니다');

                          //router.push(
                          //    "/admin/" + params.center
                          //);
                      });
                  } }

                  className="flex items-center justify-center gap-2
                    bg-gray-700 text-sm text-[#f3f4f6] px-4 py-2 rounded-lg hover:bg-gray-700/80"
              >
                <Image
                  src="/icon-logout.webp"
                  alt="Logout"
                  width={20}
                  height={20}
                  className="rounded-lg w-5 h-5"
                />
                <span className="text-sm">
                  로그아웃
                </span>
              </button>


      </div>
    );
  }

  const totalPage = Math.max(1, Math.ceil(Number(totalCount) / Number(limit)));



  return (

    <main className="relative min-h-[100vh] w-full bg-[radial-gradient(circle_at_top,#334155_0%,#0f172a_45%,#020617_100%)] px-4 pb-10 pt-4 text-slate-100">


      {/* fixed position right and vertically center */}
      <div className="
        hidden xl:flex
        fixed right-4 top-1/2 transform -translate-y-1/2
        z-40
        ">

          <div className="w-full flex flex-col items-end justify-center gap-4">


            <div className="flex flex-row items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/85 p-3 shadow-2xl backdrop-blur-xl">
              {loadingTotalNumberOfBuyOrders ? (
                <Image
                  src="/loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="w-6 h-6 animate-spin"
                />
              ) : (
                <Image
                  src="/icon-buyorder.png"
                  alt="Buy Order"
                  width={35}
                  height={35}
                  className="w-6 h-6"
                />
              )}


              {/* array of processingBuyOrders store logos */}
              <div className="flex flex-row items-center justify-center gap-1">
                {processingBuyOrders.slice(0, 3).map((order: BuyOrder, index: number) => (

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-600/70 bg-slate-800/90 p-1 shadow-md"
                  key={index}>
                    <Image
                      src={order?.store?.storeLogo || '/logo.png'}
                      alt={order?.store?.storeName || 'Store'}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-400">
                      {order?.store?.storeName || 'Store'}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">
                      {order?.buyer.depositName || 'Buyer'}
                    </span>
                  </div>

                ))}

                {processingBuyOrders.length > 3 && (
                  <span className="text-sm text-slate-400">
                    +{processingBuyOrders.length - 3}
                  </span>
                )}
              </div>


              <p className="text-lg font-semibold text-rose-300">
                {
                totalNumberOfBuyOrders
                }
              </p>

              {totalNumberOfBuyOrders > 0 && (
                <div className="flex flex-row items-center justify-center gap-2">
                  <Image
                    src="/icon-notification.gif"
                    alt="Notification"
                    width={50}
                    height={50}
                    className="w-15 h-15 object-cover"
                    
                  />
                  <button
                    onClick={() => {
                      router.push('/' + params.lang + '/admin/buyorder');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
                  >
                    <span className="text-sm">
                      구매<br />관리
                    </span>
                  </button>
                </div>
              )}
            </div>


            {/* Clearance Orders */}
            {version !== 'bangbang' && (
            <div className="flex flex-row items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/85 p-3 shadow-2xl backdrop-blur-xl">

              {loadingTotalNumberOfClearanceOrders ? (
                <Image
                  src="/loading.png"
                  alt="Loading"
                  width={20}
                  height={20}
                  className="w-6 h-6 animate-spin"
                />
              ) : (
                <Image
                  src="/icon-clearance.png"
                  alt="Clearance"
                  width={35}
                  height={35}
                  className="w-6 h-6"
                />
              )}

              {/* array of processingClearanceOrders store logos */}
              <div className="flex flex-row items-center justify-center gap-1">
                {processingClearanceOrders.slice(0, 3).map((order: BuyOrder, index: number) => (

                  <div className="flex flex-col items-center justify-center rounded-xl border border-slate-600/70 bg-slate-800/90 p-1 shadow-md"
                  key={index}>
                    <Image
                      src={order?.store?.storeLogo || '/logo.png'}
                      alt={order?.store?.storeName || 'Store'}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-400">
                      {order?.store?.storeName || 'Store'}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">
                      {order?.buyer?.depositName || 'Buyer'}
                    </span>
                  </div>

                ))}

                {processingClearanceOrders.length > 3 && (
                  <span className="text-sm text-slate-400">
                    +{processingClearanceOrders.length - 3}
                  </span>
                )}
              </div>



              <p className="text-lg font-semibold text-amber-300">
                {
                totalNumberOfClearanceOrders
                }
              </p>

              {totalNumberOfClearanceOrders > 0 && (
                <div className="flex flex-row items-center justify-center gap-2">
                  <Image
                    src="/icon-notification.gif"
                    alt="Notification"
                    width={50}
                    height={50}
                    className="w-15 h-15 object-cover"
                    
                  />
                  <button
                    onClick={() => {
                      router.push('/' + params.lang + '/admin/clearance-history');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-orange-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
                  >
                    <span className="text-sm">
                      청산<br />관리
                    </span>
                  </button>
                </div>
              )}
            </div>
            )}

        
          </div>

      </div>


      <div className="mx-auto w-full max-w-screen-2xl py-0">



        <div className="mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-3 shadow-xl backdrop-blur-xl xl:flex-row">
            
          {/*
           <div className="w-full flex flex-row items-center justify-start gap-2">
             <button
               onClick={() => router.push('/' + params.lang + '/admin')}
               className="flex items-center justify-center gap-2
                rounded-lg p-2
                hover:bg-black/20
                hover:cursor-pointer
                hover:scale-105
                transition-transform duration-200 ease-in-out"

             >
              <Image
                src="/logo-xlay.jpg"
                alt="logo"
                width={50}
                height={50}
                className="h-10 w-10 rounded-lg object-cover"
              />
             </button>
           </div>
          */}


          {address && !loadingUser && (


            <div className="flex w-full flex-row items-center justify-end gap-2">
              <button
                onClick={() => {
                  router.push('/' + params.lang + '/admin/profile-settings');
                }}
                className="flex rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
              >
                <div className="flex flex-row items-center justify-center gap-2">
                  {isAdmin && (
                    <div className="flex flex-row items-center justify-center gap-2">
                      <Image
                        src="/icon-admin.png"
                        alt="Admin"
                        width={20}
                        height={20}
                        className="rounded-lg w-5 h-5"
                      />
                      <span className="text-sm text-yellow-300">
                        전체 관리자
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-slate-100">
                    {user?.nickname || "프로필"}
                  </span>

                </div>
              </button>


              {/* logout button */}
              <button
                  onClick={() => {
                      confirm("로그아웃 하시겠습니까?") && activeWallet?.disconnect()
                      .then(() => {

                          toast.success('로그아웃 되었습니다');

                          //router.push(
                          //    "/admin/" + params.center
                          //);
                      });
                  } }

                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
              >
                <Image
                  src="/icon-logout.webp"
                  alt="Logout"
                  width={20}
                  height={20}
                  className="rounded-lg w-5 h-5"
                />
                <span className="text-sm">
                  로그아웃
                </span>
              </button>
            </div>


          )}


        </div>



        <div className="mt-4 flex flex-col items-start justify-center gap-3">
              
          {/* USDT 가격 binance market price */}
          {/*
          <div
            className="
            h-20
              w-full flex
              binance-widget-marquee
            flex-row items-center justify-center gap-2
            p-2
            "


            data-cmc-ids="1,1027,52,5426,3408,74,20947,5994,24478,13502,35336,825"
            data-theme="dark"
            data-transparent="true"
            data-locale="ko"
            data-fiat="KRW"
            //data-powered-by="Powered by X-RAY"
            //data-disclaimer="Disclaimer"
          ></div>
          */}







      
          {/* 홈 / 가맹점관리 / 회원관리 / 구매주문관리 */}
          {/* memnu buttons same width left side */}
          <div className="mb-4 grid w-full grid-cols-2 items-center justify-start gap-2 md:grid-cols-3 xl:grid-cols-6">




              <button
                  onClick={() => router.push('/' + params.lang + '/admin/store')}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                  가맹점관리
              </button>

              <button
                onClick={() => router.push('/' + params.lang + '/admin/agent')}
                className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                에이전트관리
            </button>

              <div className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 p-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/20'>
                <Image
                  src="/icon-user.png"
                  alt="Buyer"
                  width={35}
                  height={35}
                  className="w-4 h-4"
                />
                <div className="text-sm font-normal">
                  회원관리
                </div>
            </div>

              <button
                  onClick={() => router.push('/' + params.lang + '/admin/buyorder')}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                  구매주문관리
              </button>

              <button
                  onClick={() => router.push('/' + params.lang + '/admin/trade-history')}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                  P2P 거래내역
              </button>

              {version !== 'bangbang' && (
                <button
                    onClick={() => router.push('/' + params.lang + '/admin/clearance-history')}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                    청산관리
                </button>
              )}

              <button
                  onClick={() => router.push('/' + params.lang + '/admin/trade-history-daily')}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                  통계(가맹)
              </button>

              <button
                  onClick={() => router.push('/' + params.lang + '/admin/trade-history-daily-agent')}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                  통계(AG)
              </button>

              { version !== 'bangbang' && (
                <button
                    onClick={() => router.push('/' + params.lang + '/admin/escrow-history')}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2 text-sm text-slate-100 transition hover:border-slate-500 hover:bg-slate-700">
                  보유량내역
                </button>
              )}

          </div>





          <div className='flex w-full flex-row items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4'>
              <div className='flex flex-row items-center space-x-4'>
                <Image
                  src="/icon-user.png"
                  alt="Buyer"
                  width={35}
                  height={35}
                  className="h-7 w-7 rounded-lg bg-cyan-300 p-1"
                />

                <div className="text-xl font-semibold tracking-tight">
                  회원관리
                </div>
              </div>

              <div className="rounded-xl bg-slate-800 px-4 py-2 text-right ring-1 ring-slate-600/60">
                <p className="text-xs text-slate-400">{Total}</p>
                <p className="text-xl font-semibold text-white">{Number(totalCount || 0).toLocaleString('ko-KR')}</p>
              </div>
          </div>




          {/* 바이어 추가 input and button */}
          <div className="mt-3 flex w-full flex-col items-start justify-center gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">


            <div className="flex w-full flex-col items-center justify-between gap-2 xl:flex-row">

              <input
                disabled={insertingUserCode}
                type="text"
                value={userCode}
                onChange={(e) => {


                  setUserCode(e.target.value);

                } }
                placeholder="회원 아이디"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              {/* userPassword */}
              <input
                disabled={insertingUserCode}
                type="text"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="회원 비밀번호"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />


  
              <input
                disabled={insertingUserCode}
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="회원 이름"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

            </div>


            <div className="flex w-full flex-col items-center justify-between gap-2 xl:flex-row">


              {/* userBankDepositName */}
              <input
                disabled={insertingUserCode}
                type="text"
                value={userBankDepositName}
                onChange={(e) => setUserBankDepositName(e.target.value)}
                placeholder="회원 입금자명"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />



              {/* userBankName */}

              <select
                disabled={insertingUserCode}
                value={userBankName}
                onChange={(e) => setUserBankName(e.target.value)}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">
                  은행선택
                </option>
                <option value="카카오뱅크">
                  카카오뱅크
                </option>
                <option value="케이뱅크">
                  케이뱅크
                </option>
                <option value="토스뱅크">
                  토스뱅크
                </option>
                <option value="국민은행">
                  국민은행
                </option>
                <option value="우리은행">
                  우리은행
                </option>
                <option value="신한은행">
                  신한은행
                </option>
                <option value="농협">
                  농협
                </option>
                <option value="새마을금고">
                  새마을금고
                </option>
                <option value="우체국">
                  우체국
                </option>
                <option value="산림조합">
                  산림조합
                </option>
                <option value="SC제일은행">
                  SC제일은행
                </option>
                <option value="기업은행">
                  기업은행
                </option>
                <option value="하나은행">
                  하나은행
                </option>
                <option value="외환은행">
                  외환은행
                </option>
                <option value="부산은행">
                  부산은행
                </option>
                <option value="경남은행">
                  경남은행
                </option>
                <option value="대구은행">
                  대구은행
                </option>
                <option value="전북은행">
                  전북은행
                </option>
                <option value="경북은행">
                  경북은행
                </option>
                <option value="광주은행">
                  광주은행
                </option>
                <option value="제주은행">
                  제주은행
                </option>
                <option value="수협">
                  수협
                </option>
                <option value="신협">
                  신협
                </option>
                <option value="저축은행">
                  저축은행
                </option>
                <option value="씨티은행">
                  씨티은행
                </option>
                <option value="대신은행">
                  대신은행
                </option>
                <option value="동양종합금융">
                  동양종합금융
                </option>
                <option value="산업은행">
                  산업은행
                </option>
              </select>

          

              {/* userBankAccountNumber */}
              <input
                disabled={insertingUserCode}
                type="text"
                value={userBankAccountNumber}
                onChange={(e) => setUserBankAccountNumber(e.target.value)}
                placeholder="회원 계좌번호"
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

            </div>

        
            
            <button
              disabled={insertingUserCode}
              onClick={() => {

                // check if store name length is less than 2
                if (userName.length < 2) {
                  toast.error('회원 이름은 2자 이상이어야 합니다.');
                  return;
                }
                // check if store name length is less than 20
                if (userName.length > 10) {
                  toast.error('회원 이름은 10자 이하여야 합니다.');
                  return;
                }

                confirm(
                  `정말 ${userCode} (${userName})을 추가하시겠습니까?`
                ) && insertBuyer();

              }}
              className={`w-full rounded-xl bg-gradient-to-r from-indigo-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110
                ${insertingUserCode ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {insertingUserCode ? '회원추가 중...' : '회원추가'}
            </button>
          </div>







          <div className="mt-4 flex w-full flex-col items-start justify-between gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 xl:flex-row">
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-slate-600 bg-slate-800/80 px-3 py-2">
                {fetchingAllStores ? (
                  <Image
                    src="/loading.png"
                    alt="Loading"
                    width={20}
                    height={20}
                    className="animate-spin"
                  />
                ) : (
                  <Image
                    src="/icon-store.png"
                    alt="Store"
                    width={20}
                    height={20}
                    className="h-5 w-5 rounded-lg"
                  />
                )}

                <span className="w-20 text-sm text-slate-300">가맹점</span>

                <select
                  value={searchParamsStorecode || ""}
                  onChange={(e) => {
                    router.push(`/${params.lang}/admin/member?storecode=${e.target.value}`);
                  }}
                  disabled={fetchingAllStores}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">전체</option>
                  {allStores && allStores.map((item, index) => (
                    <option key={index} value={item.storecode}>
                      {item.storeName}{' '}({item.storecode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid w-full gap-2 md:grid-cols-2 xl:max-w-xl">
                <input
                  type="text"
                  value={searchBuyer}
                  onChange={(e) => setSearchBuyer(e.target.value)}
                  placeholder="회원 아이디"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />

                <input
                  type="text"
                  value={searchDepositName}
                  onChange={(e) => setSearchDepositName(e.target.value)}
                  placeholder="입금자명"
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row">
              <button
                onClick={() => {
                  setPageValue(1);
                  fetchAllBuyer(1, Number(limitValue));
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={fetchingAllBuyer}
              >
                <Image
                  src="/icon-search.png"
                  alt="Search"
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-lg"
                />
                <span>{fetchingAllBuyer ? '검색중...' : '검색'}</span>
              </button>

              <button
                onClick={downloadBuyerExcel}
                className="rounded-xl border border-emerald-400/50 bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={exportingBuyerExcel}
              >
                {exportingBuyerExcel ? '엑셀 생성중...' : '검색결과 엑셀 다운로드'}
              </button>
            </div>
          </div>


            {/*
            {"storecode":"teststorecode","storeName":"테스트상점","storeType":"test","storeUrl":"https://test.com","storeDescription":"설명입니다.","storeLogo":"https://test.com/logo-xlay.jpg","storeBanner":"https://test.com/banner.png"}
            */}

            {/* table view is horizontal scroll */}
            {tableView ? (


              <div className="w-full overflow-x-auto rounded-2xl border border-slate-700/70 bg-slate-900/70 shadow-xl">

                <table className="min-w-[1280px] w-full table-auto border-collapse">

                  <thead className="bg-slate-800/95 text-sm font-medium text-slate-100">
                    <tr>

                      <th className="
                        p-2">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span>가입일시</span>
                          </div>
                      </th>

                      <th className="p-2">
                        <div className="flex flex-col xl:flex-row items-center justify-center gap-2">
                          <span>회원 아이디</span>
                          <span>가맹점 </span>
                        </div>
                      </th>

                      <th className="p-2">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span>회원은행정보</span>
                        </div>
                      </th>

                      <th className="p-2">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span>결제건수(건)</span>
                          <span>결제금액(원)</span>
                          <span>구매량(USDT)</span>
                        </div>
                        </th>

                      <th className="
                        p-2">
                        USDT지갑
                      </th>
                      <th className="p-2">충전금액(원)</th>
                      <th className="p-2">결제페이지</th>
                      <th className="p-2">주문상태</th>

                      <th className="p-2">잔액확인</th>
                    </tr>
                  </thead>

                  {/* if my trading, then tr has differenc color */}
                  <tbody>

                    {allBuyer.map((item, index) => (

                      
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? 'bg-slate-900/70' : 'bg-slate-800/70'} border-t border-slate-700/60 transition hover:bg-slate-700/80`}
                      >

                        <td className="p-2 text-sm text-slate-200">
                          {formatDateTimeForDisplay(item.createdAt)}
                        </td>
                      
                        <td className="p-2">
                          <div className="flex flex-col items-start justify-center gap-2">
                            <div className="
                              w-40
                              xl:w-64
                              flex flex-col xl:flex-row items-center justify-between gap-2">
                              
                              <div className="flex flex-row items-center justify-center gap-2">
                                <span className={`rounded-lg px-2 py-1 text-xs ${getUserTypeMeta(item?.userType).className}`}>
                                  {getUserTypeMeta(item?.userType).label}
                                </span>
                                <span className="text-lg font-normal text-slate-100">
                                  {item.nickname}
                                </span>

                              </div>




                              <span className="text-sm text-slate-300">
                                {item?.store?.storeName}{' '}({item?.store?.storecode})
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                router.push(
                                  `/${params.lang}/admin/member-settings?storecode=${item?.storecode}&walletAddress=${item?.walletAddress}`
                                );
                              }}
                              className="mt-2 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                            >
                              변경하기
                            </button>

                          </div>
                        </td>

                        <td className="p-2">
                          <div className="flex flex-col items-start justify-center gap-2">
                            <span>{item?.buyer?.depositBankName}</span>
                            
                            <span>{item?.buyer?.depositBankAccountNumber}</span>
                            
                            <span>{item?.buyer?.depositName}</span>
                          </div>
                        </td>

                        <td className="p-2">
                          <div className="flex flex-col items-end mr-2 justify-center gap-2">

                            {item?.totalPaymentConfirmedCount ? (
                              <div className="flex flex-row items-center justify-center gap-2">
                                {item?.totalPaymentConfirmedCount}
                              </div>
                            ) : (
                              <div className="flex flex-row items-center justify-center gap-2">
                                0
                              </div>
                            )}
                              

                            {item?.totalPaymentConfirmedKrwAmount ? (

                              <div className="flex flex-row items-center justify-center gap-2">
                                {Number(item?.totalPaymentConfirmedKrwAmount)?.toLocaleString('ko-KR')}
                              </div>
                            ) : (
                              <div className="flex flex-row items-center justify-center gap-2">
                                0
                              </div>
                            )}

                            {item?.totalPaymentConfirmedUsdtAmount ? (
                              <div className="flex flex-row items-center justify-center gap-2">
                                {Number(item?.totalPaymentConfirmedUsdtAmount)?.toLocaleString('ko-KR')}
                              </div>
                            ) : (
                              <div className="flex flex-row items-center justify-center gap-2">
                                0
                              </div>
                            )}

                          </div>
                          
                        </td>



                        <td className="
                          p-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item?.walletAddress);
                              toast.success(Copied_Wallet_Address);
                            } }
                            className="text-sm text-cyan-200 underline decoration-cyan-300/60 underline-offset-2"
                          >
                            {item?.walletAddress
                              ? item.walletAddress.substring(0, 6) + '...' + item.walletAddress.substring(item.walletAddress.length - 4)
                              : '-'}
                          </button>
                        </td>

                        {/* depositAmountKrw input */}
                        <td className="p-2">
                          <div className="flex flex-col xl:flex-row items-start justify-center gap-2">
                            <input
                              type="text"
                              value={depositAmountKrw[index]}
                              onChange={(e) => {
                                setDepositAmountKrw((prev) => {
                                  const newDepositAmountKrw = [...prev];
                                  newDepositAmountKrw[index] = Number(e.target.value);
                                  return newDepositAmountKrw;
                                });
                              }}
                              placeholder="충전금액"
                              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            />
                          </div>
                        </td>


                        <td className="p-2">

                          <div className="flex flex-col xl:flex-row items-start justify-center gap-2">



                            {/* Modal open */}
                            <button
                              onClick={() => {
                                
                                setSelectedItem({
                                  ...item,
                                  depositAmountKrw: depositAmountKrw[index],
                                });
                                openModal();

                              }}
                              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                            >
                              보기
                            </button>




                            {/* 복사 버튼 */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  paymentUrl + '/' + params.lang + '/' + clientId + '/' + item.storecode + '/payment?'
                                  + 'storeUser=' + item.nickname
                                  + '&depositBankName=' + item?.buyer?.depositBankName
                                  + '&depositBankAccountNumber=' + item?.buyer?.depositBankAccountNumber
                                  + '&depositName=' + item?.buyer?.depositName
                                  + '&depositAmountKrw=' + depositAmountKrw[index]
                                );
                                toast.success('회원 홈페이지 링크가 복사되었습니다.');
                              }}
                              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                            >
                              복사
                            </button>


                            {/* 새창 열기 버튼 */}
                            <button
                              onClick={() => {
                                window.open(
                                  paymentUrl + '/' + params.lang + '/' + clientId + '/' + item.storecode + '/payment?'
                                  + 'storeUser=' + item.nickname
                                  + '&depositBankName=' + item?.buyer?.depositBankName
                                  + '&depositBankAccountNumber=' + item?.buyer?.depositBankAccountNumber
                                  + '&depositName=' + item?.buyer?.depositName
                                  + '&depositAmountKrw=' + depositAmountKrw[index],
                                  '_blank'
                                );
                                toast.success('회원 홈페이지를 새창으로 열었습니다.');
                              }}
                              className="rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                            >
                              새창열기
                            </button>
                            
                          </div>

                        </td>


                        <td className="p-2">
                          <div className="flex flex-col xl:flex-row items-start justify-center gap-2">
                            <span className={`text-sm font-medium ${getBuyOrderStatusMeta(item?.buyOrderStatus).className}`}>
                              {getBuyOrderStatusMeta(item?.buyOrderStatus).label}
                            </span>
                          </div>
                        </td>


                          {/* 잔고확인 버튼 */}
                          {/* USDT 잔액 */}
                          <td className="p-2">
                            <div className="w-24
                              flex flex-col items-between justify-between gap-2">

                              {/*
                              <div className="w-full flex flex-col items-center justify-center gap-2">

                                <span className="text-lg text-green-400"
                                  style={{ fontFamily: 'monospace' }}
                                >
                                  {usdtBalance[index] ?
                                    usdtBalance[index].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.000'}{' USDT'}
                                </span>
        
                              </div>
                              */}


                              {/* button to getBalance of USDT */}
                              <button
                                //disabled={!isAdmin || insertingStore}
                                onClick={() => {
                                  //if (!isAdmin || insertingStore) return;
                                  //getBalance(item.storecode);

                                  getBalanceOfWalletAddress(item.walletAddress);
          

                                  //toast.success('잔액을 가져왔습니다.');

                                  // toast usdtBalance[index] is updated
                                  //toast.success(`잔액을 가져왔습니다. 현재 잔액: ${usdtBalance[index] ? usdtBalance[index].toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0.000'} USDT`);

                                }}
                                className="mb-2 w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                              >
                                잔액 확인하기
                              </button>


                              {/* function call button clearanceWalletAddress */}
                              
                              <button
                                onClick={() => {
                                  clearanceWalletAddress(item.walletAddress);
                                  toast.success('잔액을 회수했습니다.');
                                }}
                                className="mb-2 w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
                              >
                                잔액 회수하기
                              </button>
                              

                            

                            </div>
                          </td>





                      </tr>

                    ))}

                    {allBuyer.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-sm text-slate-400">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>


            ) : (

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {allBuyer.map((item, index) => (
                  <div key={index} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-md">
                    <h2 className="text-lg font-normal text-slate-100">{item.nickname}</h2>

                  </div>
                ))}

              </div>

            )}



        </div>

      

        {/* pagination */}
        {/* url query string */}
        {/* 1 2 3 4 5 6 7 8 9 10 */}
        {/* ?limit=10&page=1 */}
        {/* submit button */}
        {/* totalPage = Math.ceil(totalCount / limit) */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span>표시수</span>
            <select
              value={limit}
              onChange={(e) =>
                router.push(`/${params.lang}/admin/member?limit=${Number(e.target.value)}&page=1&storecode=${searchParamsStorecode}`)
              }
              className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-sm text-slate-100"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            disabled={Number(page) <= 1}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${Number(page) <= 1 ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30'}`}
            onClick={() => {
              router.push(`/${params.lang}/admin/member?limit=${Number(limit)}&page=1&storecode=${searchParamsStorecode}`);
            }}
          >
            처음
          </button>

          <button
            disabled={Number(page) <= 1}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${Number(page) <= 1 ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30'}`}
            onClick={() => {
              router.push(`/${params.lang}/admin/member?limit=${Number(limit)}&page=${Number(page) - 1}&storecode=${searchParamsStorecode}`);
            }}
          >
            이전
          </button>

          <span className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-600/70">
            {page} / {totalPage}
          </span>

          <button
            disabled={Number(page) >= totalPage}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${Number(page) >= totalPage ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30'}`}
            onClick={() => {
              router.push(`/${params.lang}/admin/member?limit=${Number(limit)}&page=${Number(page) + 1}&storecode=${searchParamsStorecode}`);
            }}
          >
            다음
          </button>

          <button
            disabled={Number(page) >= totalPage}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${Number(page) >= totalPage ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30'}`}
            onClick={() => {
              router.push(`/${params.lang}/admin/member?limit=${Number(limit)}&page=${totalPage}&storecode=${searchParamsStorecode}`);
            }}
          >
            마지막
          </button>
        </div>


          





          
        </div>

        
        <ModalUser isOpen={isModalOpen} onClose={closeModal}>
            <UserHomePage
                closeModal={closeModal}
                selectedItem={selectedItem}
            />
        </ModalUser>
        


      </main>

  );


};



const UserHomePage = (
  {
      closeModal = () => {},
      selectedItem = null as {
        nickname: string; storecode: string; buyer?: {
          depositBankName?: string; depositName?: string; depositBankAccountNumber?: string;
        }; depositAmountKrw?: number;
      } | null,
  }
) => {

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-normal">회원 결제페이지</h1>
      
      {/* iframe */}
      <iframe
        src={`${paymentUrl}/ko/${clientId}/${selectedItem?.storecode}/payment?`
          + 'storeUser=' + selectedItem?.nickname
          + '&depositBankName=' + selectedItem?.buyer?.depositBankName
          + '&depositBankAccountNumber=' + selectedItem?.buyer?.depositBankAccountNumber
          + '&depositName=' + selectedItem?.buyer?.depositName
          + '&depositAmountKrw=' + selectedItem?.depositAmountKrw}

        width="400px"
        height="500px"
        className="border border-zinc-300 rounded-lg"
        title="User Home Page"
      ></iframe>


      <button
        onClick={closeModal}
        className="bg-gray-700  px-4 py-2 rounded-lg hover:bg-gray-700/80"
      >
        닫기
      </button>
    </div>
  );

};



// close modal
{/*
const TradeDetail = (
    {
        closeModal = () => {},
        goChat = () => {},
        
    }
) => {


    const [amount, setAmount] = useState(1000);
    const price = 91.17; // example price
    const receiveAmount = (amount / price).toFixed(3);
    const commission = 0.01; // example commission
  
    return (

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-2"></span>
          <h2 className="text-lg font-normal text-black ">Iskan9</h2>
          <span className="ml-2 text-blue-400 text-sm">318 trades</span>
        </div>
        <p className="text-gray-600 mt-2">The offer is taken from another source. You can only use chat if the trade is open.</p>
        
        <div className="mt-4">
          <div className="flex justify-between ">
            <span>Price</span>
            <span>{price} KRW</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Limit</span>
            <span>40680.00 KRW - 99002.9 KRW</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Available</span>
            <span>1085.91 USDT</span>
          </div>
          <div className="flex justify-between text-gray-700 mt-2">
            <span>Seller&apos;s payment method</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 rounded-full">Tinkoff</span>
          </div>
          <div className="mt-4 ">
            <p>24/7</p>
          </div>
        </div>
  
        <div className="mt-6 border-t pt-4 ">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block ">I want to pay</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(
                    e.target.value === '' ? 0 : parseInt(e.target.value)
                ) }

                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block ">I will receive</label>
              <input 
                type="text"
                value={`${receiveAmount} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block ">Commission</label>
              <input 
                type="text"
                value={`${commission} USDT`}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
                className="bg-green-500  px-4 py-2 rounded-lg"
                onClick={() => {
                    console.log('Buy USDT');
                    // go to chat
                    // close modal
                    closeModal();
                    goChat();

                }}
            >
                Buy USDT
            </button>
            <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                onClick={() => {
                    console.log('Cancel');
                    // close modal
                    closeModal();
                }}
            >
                Cancel
            </button>
          </div>

        </div>


      </div>
    );
  };
  */}
