'use client';

import { useRouter }from "next//navigation";




export default function RootLayout({
    children,
    params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {

    const router = useRouter();


    return (

        <>

            {children}



            {/* footer */}
            {/* 이용약관 / 개인정보처리방침 / 고객센터 */}
            <div className="w-full flex flex-col items-center justify-center gap-4 p-4 bg-zinc-800 shadow-md rounded-lg mt-5">

              <div className="text-sm ">
                <a href={`/${params.lang}/terms-of-service`} className="text-blue-400 hover:underline">
                  이용약관
                </a>
                {' | '}
                <a href={`/${params.lang}/privacy-policy`} className="text-blue-400 hover:underline">
                  개인정보처리방침
                </a>
                {' | '}
                <a href={`/${params.lang}/contact`} className="text-blue-400 hover:underline">
                  고객센터
                </a>
              </div>

              <div className="text-sm ">
                © 2025 X-Ray. All rights reserved.
              </div>

            </div> 

        </>

    );

}