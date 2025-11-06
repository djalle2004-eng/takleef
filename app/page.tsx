import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Takleef
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            University of El Oued Portal
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/signin"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            Sign In
          </Link>
          
          <Link
            href="/signup"
            className="block w-full py-3 px-4 bg-white hover:bg-gray-50 text-indigo-600 font-semibold rounded-lg shadow-md border-2 border-indigo-600 transition duration-200"
          >
            Create Account
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Only @univ-eloued.dz email addresses are allowed
        </p>
      </div>
    </div>
  );
}
