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





/*
export const metadata: Metadata = {
  title: "WEB3 Starter",
  description:
    "Starter for  WEB3 Wallet.",
};
*/







export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {

  const router = useRouter();

  /*
  useEffect(() => {
  
    window.googleTranslateElementInit = () => {
     new window.google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
    };
  
   }, []);
   */


  const [showChain, setShowChain] = useState(false);

  const [showCenter, setShowCenter] = useState(false);

  return (

        <div className="w-full flex flex-col items-center justify-center p-0 bg-black rounded-lg shadow-md mb-4">

            {/* fixed position left and vertically top */}
            <div className="
            fixed top-2 left-2 z-50 flex flex-col items-start justify-start">
              <button
                className="
                w-32
                flex flex-row items-center justify-center gap-2
                mb-2 px-4 py-2 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-75"
                onClick={() => setShowCenter(!showCenter)}
              >
                  <Image
                    src={`/icon-shield.png`}
                    alt={`Shield`}
                    width={25}
                    height={25}
                  />

                  <span className="text-sm text-white">
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
