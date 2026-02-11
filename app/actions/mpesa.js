"use server";

export async function initiateSTK(phoneNumber, amount) {
  try {
    // Validate input
    if (!phoneNumber || !amount) {
      return { success: false, message: "Phone and amount are required" };
    }
    
    if (phoneNumber.length < 10) {
      return { success: false, message: "Invalid phone number format" };
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Prepare Authorization
    const auth = Buffer.from(
      `${process.env.PAYHERO_API_KEY}:${process.env.PAYHERO_API_SECRET}`
    ).toString("base64");

    // Call Payhero API
    const response = await fetch("https://backend.payhero.co.ke/api/v1/payments/request-stk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amount,
        phone_number: formattedPhone,
        channel_id: process.env.PAYHERO_CHANNEL_ID,
        external_reference: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/callback`, // We'll create this next
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Payhero API Error:", result);
      return { 
        success: false, 
        message: result.message || "Payment initiation failed" 
      };
    }

    return { 
      success: true, 
      data: result,
      message: "Check your phone for the M-Pesa PIN prompt!"
    };
    
  } catch (error) {
    console.error("Payment Error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}