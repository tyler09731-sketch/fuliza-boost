export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6">
      <div className="max-w-lg w-full text-center backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl">
        
        <div className="mb-6">
          <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse mx-auto mb-4"></div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            We'll Be Back Shortly
          </h1>
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">
          Our website is currently undergoing scheduled maintenance.
          We’re working to restore service as soon as possible.
        </p>

        <div className="text-sm text-gray-400">
          For urgent matters, please contact the administrator.
        </div>

      </div>
    </div>
  );
}
