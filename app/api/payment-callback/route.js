import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const callbackData = await request.json();
    
    console.log('========== 💰 PAYHERO CALLBACK RECEIVED ==========');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Callback Data:', JSON.stringify(callbackData, null, 2));
    console.log('Headers:', Object.fromEntries(request.headers));
    console.log('================================================');

    // Extract callback information
    const {
      status,
      external_reference,
      transaction_id,
      amount,
      phone_number,
      metadata,
      reference,
      ResponseCode,
      ResultCode,
      ResultDesc
    } = callbackData;

    // Determine payment status
    const isSuccessful = 
      status === 'success' || 
      status === 'completed' || 
      ResponseCode === '0' || 
      ResultCode === '0' ||
      callbackData.success === true;

    if (isSuccessful) {
      console.log('🎉✅ PAYMENT SUCCESSFUL!');
      console.log('📝 Transaction Details:', {
        reference: external_reference || reference || transaction_id,
        amount: amount,
        phone: phone_number,
        metadata: metadata
      });
      
      // TODO: Update database - payment successful
      // TODO: Increase user's Fuliza limit
      // TODO: Send confirmation SMS/email
      // TODO: Log successful transaction
      
    } else {
      console.log('❌ PAYMENT FAILED:', {
        reference: external_reference || reference,
        status: status,
        reason: ResultDesc || callbackData.message || 'Unknown error'
      });
      
      // TODO: Update database - payment failed
      // TODO: Log failed transaction
    }

    // ALWAYS return 200 to acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Callback received successfully',
      received_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Callback Processing Error:', error);
    
    // Still return 200 to prevent Payhero from retrying endlessly
    return NextResponse.json({ 
      success: false, 
      message: 'Callback processed with errors',
      error: error.message
    });
  }
}

// Handle GET requests for endpoint verification
export async function GET(request) {
  return NextResponse.json({ 
    status: 'active',
    message: 'PayHero Africa callback endpoint is ready',
    timestamp: new Date().toISOString()
  });
}