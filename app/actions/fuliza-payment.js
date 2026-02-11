"use server";

export async function initiateFulizaPayment(phoneNumber, amount, idNumber, selectedLimit) {
  try {
    console.log('📱 Processing Fuliza payment request:', { 
      phoneNumber, 
      amount, 
      idNumber, 
      selectedLimit 
    });

    // ===== VALIDATION =====
    if (!phoneNumber || !amount || !idNumber) {
      return { 
        success: false, 
        message: 'Phone number, amount, and ID number are required.' 
      };
    }

    // Format phone to 254...
    let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('254')) {
      // Already correct format
    }

    // Validate phone format (must be 2547XXXXXXXX)
    if (!/^2547[0-9]{8}$/.test(formattedPhone)) {
      return {
        success: false,
        message: "Invalid phone number. Use format: 07XX XXX XXX or 2547XX XXX XXX"
      };
    }

    // Validate ID number (Kenyan ID - 8 digits)
    if (!/^\d{8}$/.test(idNumber.replace(/\s/g, ''))) {
      return {
        success: false,
        message: "Please enter a valid 8-digit Kenyan ID number"
      };
    }

    // ===== PAYHERO AFRICA V2 API REQUEST =====
    const requestBody = {
      amount: Number(amount),
      phone_number: formattedPhone,
      account_id: Number(process.env.PAYHERO_ACCOUNT_ID),     // 4546
      channel_id: Number(process.env.PAYHERO_CHANNEL_ID),     // 5435
      provider: process.env.PAYHERO_PROVIDER,                // m-pesa
      network_code: process.env.PAYHERO_NETWORK_CODE,        // 63902
      external_reference: `FULIZA_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      callback_url: process.env.PAYHERO_CALLBACK_URL,
      metadata: {
        id_number: idNumber,
        selected_limit: selectedLimit,
        customer_phone: phoneNumber,
        timestamp: new Date().toISOString()
      }
    };

    // ===== 🔍 DEBUG: Log everything =====
    console.log('🚀 Sending to PayHero Africa:');
    console.log('🔍 URL:', `${process.env.PAYHERO_BASE_URL}/payments`);
    console.log('🔍 Method: POST');
    console.log('🔍 Headers:', {
      'Authorization': process.env.PAYHERO_BASIC_AUTH_TOKEN ? `${process.env.PAYHERO_BASIC_AUTH_TOKEN.substring(0, 20)}...` : 'MISSING',
      'Content-Type': 'application/json',
    });
    console.log('🔍 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🔍 Auth Token length:', process.env.PAYHERO_BASIC_AUTH_TOKEN?.length);
    console.log('🔍 Auth Token starts with:', process.env.PAYHERO_BASIC_AUTH_TOKEN?.substring(0, 10));

    // Make the API call
    const response = await fetch(
      `${process.env.PAYHERO_BASE_URL}/payments`,
      {
        method: "POST",
        headers: {
          'Authorization': process.env.PAYHERO_BASIC_AUTH_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    // ===== 🔴 CRITICAL: Log RAW response =====
    console.log('🔴 RESPONSE STATUS:', response.status);
    console.log('🔴 RESPONSE STATUS TEXT:', response.statusText);
    console.log('🔴 RESPONSE HEADERS:', Object.fromEntries(response.headers));
    console.log('🔴 RESPONSE OK:', response.ok);

    // Get raw text first
    const responseText = await response.text();
    console.log('🔴 RAW RESPONSE BODY:', responseText);

    // Try to parse JSON
    let data = {};
    try {
      if (responseText) {
        data = JSON.parse(responseText);
        console.log('✅ Parsed JSON Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('⚠️ Empty response body');
      }
    } catch (e) {
      console.log('🔴 Failed to parse JSON:', e.message);
      console.log('🔴 Response is plain text');
      data = { message: responseText || 'Empty response' };
    }

    // ===== HANDLE RESPONSE =====
    if (response.status === 201 || response.ok) {
      return {
        success: true,
        message: '✅ M-Pesa prompt sent! Check your phone to enter PIN.',
        data: {
          reference: data.reference || data.external_reference || data.transaction_id,
          ...data
        }
      };
    } else {
      console.error('❌ PayHero Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      // Handle specific error cases
      let errorMessage = 'Payment initiation failed. Please try again.';
      
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.errors) {
        errorMessage = Object.values(data.errors).flat().join(', ');
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed. Please check your API credentials.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Please check your permissions.';
      } else if (response.status === 404) {
        errorMessage = 'API endpoint not found. Please check the URL.';
      } else if (response.status === 422) {
        errorMessage = 'Invalid request parameters. Please check your input.';
      } else if (response.status === 500) {
        errorMessage = 'Payhero server error. Please try again later.';
      }

      return {
        success: false,
        message: errorMessage,
        details: data,
        status: response.status
      };
    }

  } catch (error) {
    console.error('❌ Payment Error:', error);
    
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
      details: error.message
    };
  }
}