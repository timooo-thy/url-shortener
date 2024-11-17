import UrlForm from "@/components/UrlForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-100 to-indigo-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute left-1/4 bottom-1/4 w-1/2 h-1/2 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      <UrlForm />
      <div className="mt-8 text-center">
        <p className="text-base text-gray-600 font-medium">
          Simplify your links, amplify your reach
        </p>
      </div>
    </div>
  );
}
