import { NextResponse, type NextRequest } from "next/server";

import {
	getAllAgents,
} from '@lib/api/agent';



export async function POST(request: NextRequest) {

  const body = await request.json();

  const {
    walletAddress,
    limit,
    page,
    searchStore,
  } = body;


  const result = await getAllAgents({
    limit: limit || 100,
    page: page || 1,
    //search: '',
    search: searchStore || '',
  });

 
  return NextResponse.json({

    result,
    
  });
  
}
