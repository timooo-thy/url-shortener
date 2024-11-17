"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Zap } from "lucide-react";

export default function UrlSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
    >
      <Zap className="w-5 h-5 mr-2" />
      Shoooort it
    </Button>
  );
}
