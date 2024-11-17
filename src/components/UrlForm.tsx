"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Scissors, Link2, Zap, Copy } from "lucide-react";
import { format } from "date-fns";
import { client } from "@/lib/rpc";
import { toast } from "sonner";

export default function UrlForm() {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState<Date>();
  const [shortUrl, setShortUrl] = useState("");
  const [remainingLimit, setRemainingLimit] = useState(10);

  useEffect(() => {
    const fetchLimits = async () => {
      const response = await client.api.limits.$get();
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setRemainingLimit(data.remaining);
    };

    fetchLimits();
  }, [shortUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingLimit <= 0) {
      toast.error("You have reached the daily limit of 10 URLs");
      return;
    }

    const response = await client.api.shortenUrl.$post({
      json: {
        url,
        expiresAt: date,
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      setShortUrl(process.env.NEXT_PUBLIC_APP_URL + "/" + data.shortCode);
      toast.success("URL shortened successfully!");
    } else {
      const data = await response.json();
      toast.error(data.error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error(
        "Failed to copy: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  return (
    <div className="max-w-md w-full bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-lg shadow-lg overflow-hidden z-10">
      <div className="p-8">
        <div className="flex justify-center mb-6 relative">
          <div className="bg-gradient-to-r from-teal-300 via-blue-300 to-indigo-300 p-3 rounded-full">
            <Scissors className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Shorten Your URL
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="url"
              placeholder="Enter your long URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 bg-white placeholder-gray-400 text-gray-800"
            />
            <Link2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                  {date ? (
                    format(date, "PPP")
                  ) : (
                    <span>Pick an expiry date (optional)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="rounded-md border border-gray-200"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          >
            <Zap className="w-5 h-5 mr-2" />
            Shorten URL
          </Button>
        </form>
        {shortUrl && (
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Your shortened URL:
            </p>
            <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="flex-grow px-3 py-2 text-sm text-gray-800 bg-transparent outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                aria-label="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="px-8 py-4 bg-gray-100">
        <p className="text-sm text-gray-600 text-center">
          Daily limit left:{" "}
          <span className="font-semibold text-blue-600">
            {remainingLimit}/10 URLs
          </span>
        </p>
      </div>
    </div>
  );
}
