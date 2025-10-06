'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThirdwebProvider } from "thirdweb/react";

import { Toaster } from "react-hot-toast";

import { useState, useEffect } from "react";


import Script from "next/script";

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';


//const inter = Inter({ subsets: ["latin"] });

import localFont from "next/font/local";



import Image from "next/image";
import { useRouter }from "next//navigation";



// import components
import StabilityConsole from '@/components/StabilityConsole';

import CenterConsole from '@/components/CenterConsole';


import {
  clientId,
  client,
} from "../../client";



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


import { useSearchParams } from 'next/navigation';


/*
export const metadata: Metadata = {
  title: "WEB3 Starter",
  description:
    "Starter for  WEB3 Wallet.",
};
*/








// params
// { lang: string; center: string; }
export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string; center: string; };
}>) {

  const searchParams = useSearchParams();


  const router = useRouter();

  /*
  useEffect(() => {
  
    window.googleTranslateElementInit = () => {
     new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
    };
  
   }, []);
   */




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
              storecode: params.center,
              ////walletAddress: address,
            }),
        });

        const data = await response.json();

        //console.log("data", data);

        if (data.result) {

          setStore(data.result);

        } else {
          setStore(null);
        }

        setFetchingStore(false);
    };

    if (!params.center) {
      return;
    }

    fetchData();

  } , [params.center]);



  const [showChain, setShowChain] = useState(false);

  const [showCenter, setShowCenter] = useState(false);

  return (

        <div className="w-full flex flex-col items-center justify-center p-0 bg-black rounded-lg shadow-md mb-4">


          {/* fixed position left and vertically top */}
          <div className="
          fixed top-2 left-2 z-50 flex flex-col items-start justify-start">

            {/* storeLogo and storeName and storecode */}
            {store && (
              <div className="flex flex-row items-center justify-center
                bg-white bg-opacity-20 backdrop-blur-md
                p-2 rounded-lg shadow-lg mb-2
              ">
                {store.storeLogo && (
                  <Image
                    src={store.storeLogo}
                    alt={store.storeName}
                    width={50}
                    height={50}
                    className="
                    w-10 h-10 mr-2
                    rounded-lg object-cover mb-2"
                  />
                )}
                <h1 className="text-2xl font-bold">{store.storeName}</h1>
              </div>
            )}


            <button
              className="
              w-32 
              flex flex-row items-center justify-center gap-2
              mb-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg
              "
              onClick={() => setShowCenter(!showCenter)}
            >
                <Image
                  src={`/icon-shield.png`}
                  alt={`Shield`}
                  width={25}
                  height={25}
                />

                <span className="text-sm">
                  {showCenter ? 'Hide Wallet' : 'Show Wallet'}
                </span>
            </button>

            <div className={`flex flex-col items-center justify-center
              ${showCenter ? 'bg-white' : 'hidden'}
              p-2 rounded-lg shadow-lg
            `}>
              <CenterConsole />
            </div>
          </div>

            
          {children}


          {/* footer */}
          {/* 이용약관 / 개인정보처리방침 / 고객센터 */}
          <div className="w-full flex flex-col items-center justify-center gap-4 p-4 bg-zinc-800 shadow-md rounded-lg mt-5">

            <div className="text-sm ">
              <a href={`/${params.lang}/terms-of-service`} className="text-blue-400 hover:underline">
                이용약관
              </a>
              {' | '}
              <a href='#' className="text-blue-400 hover:underline">
                개인정보처리방침
              </a>
              {' | '}
              <a href='#' className="text-blue-400 hover:underline">
                고객센터
              </a>
            </div>

            <div className="text-sm ">
              © 2025 X-Ray. All rights reserved.
            </div>

          </div>


        </div>

  );


}
