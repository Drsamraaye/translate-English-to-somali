"use client";



import { useState, useCallback, ChangeEvent } from "react";

import { ArrowRight, Globe, Mic, Clipboard, RefreshCw, XCircle } from 'lucide-react';



// Define the type for the custom button component props

interface GreenOutlineButtonProps {

  icon: React.ReactNode;

  text: string;

  onClick?: () => void;

  disabled?: boolean;

}



// Main component

export default function App() {

  // State management with explicit typing

  const [text, setText] = useState<string>("");

  const [result, setResult] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  // New state to track translation direction (true = English -> Somali)

  const [isEnglishToSomali, setIsEnglishToSomali] = useState<boolean>(true);



  // Derive dynamic language labels

  const sourceLang = isEnglishToSomali ? "English (US)" : "Somali";

  const targetLang = isEnglishToSomali ? "Somali" : "English (US)";

  const sourcePlaceholder = isEnglishToSomali ? "Type English text here..." : "Type Somali text here...";



  // Clear function: Resets all text and error states

  const handleClear = useCallback(() => {

    setText("");

    setResult("");

    setError("");

  }, []);



  // Swap function: Toggles language direction and clears fields

  const handleSwap = useCallback(() => {

    handleClear();

    setIsEnglishToSomali(prev => !prev);

  }, [handleClear]);





  // Functionality (Logic remains the same, types added)

  const handleTranslate = useCallback(async () => {

    if (!text.trim()) return;



    setLoading(true);

    setError("");

    setResult("");



    try {

      // NOTE: The user's original API path is preserved. The server is assumed to handle the language detection/routing.

      const res = await fetch("/api/translate", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        // Optionally, you might pass the direction if your API supported it:

        // body: JSON.stringify({ text, direction: isEnglishToSomali ? 'en-so' : 'so-en' }),

        body: JSON.stringify({ text }),

      });



      const data: { success: boolean; translated?: string; error?: string } = await res.json();



      if (data.success && data.translated) {

        setResult(data.translated);

      } else {

        setError(data.error || "Translation service error.");

      }

    } catch (err: unknown) {

      if (err instanceof Error) {

        setError(err.message);

      } else {

        setError("Network error. Could not connect.");

      }

    } finally {

      setLoading(false);

    }

  }, [text]); // Dependency array includes 'text'



  // Helper component for the distinctive green-outlined buttons

  const GreenOutlineButton: React.FC<GreenOutlineButtonProps> = ({ icon, text, onClick = () => {}, disabled = false }) => (

    <button

      onClick={onClick}

      className="flex items-center space-x-1 p-2 text-xs sm:text-sm font-medium text-green-700 bg-white border border-green-300 rounded-full shadow-sm transition hover:bg-green-50 active:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed "

      disabled={disabled || loading}

    >

      {icon}

      <span>{text}</span>

    </button>

  );



  // Function to simulate the 'Paste text' functionality

  const handlePaste = useCallback(async () => {

    try {

      const clipboardText: string = await navigator.clipboard.readText();

      setText(clipboardText);

    } catch (err) {

      console.error("Failed to read clipboard:", err);

      setError("Clipboard access denied or failed.");

      setTimeout(() => setError(""), 3000);

    }

  }, []);



  // Handler for text area changes

  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {

    setText(e.target.value);

  }, []);





  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans">

      {/* Main Translation Card Container - Max-width adjusts gracefully */}

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-100">



        {/* --- Language/Mode Selector Bar (Top) --- */}

        <div className="flex justify-between items-center mb-8 relative">

          {/* Input Side Selectors */}

          <div className="flex space-x-2">

            <GreenOutlineButton

              icon={<Globe className="w-4 h-4" />}

              text={sourceLang} // Dynamic language source

              disabled={loading}

            />

          </div>



          {/* Separator / Swap Button (Central Button) */}

          <button

            onClick={handleSwap} // Swaps language direction

            className="flex items-center justify-center mx-4 p-2 rounded-full hover:bg-gray-100 transition disabled:opacity-50"

            disabled={loading}

            title="Swap translation direction"

          >

            <RefreshCw className="w-5 h-5 text-gray-500" />

          </button>



          {/* Output Side Selectors */}

          <div className="flex space-x-2">

            <GreenOutlineButton

              icon={<Globe className="w-4 h-4" />}

              text={targetLang} // Dynamic language target

              disabled={loading}

            />

            <GreenOutlineButton

              icon={<Mic className="w-4 h-4" />}

              text="Tone"

              disabled={loading}

            />

          </div>

        </div>



        {/* --- Input and Output Areas - Responsive Layout Change --- */}

        <div className="flex flex-col md:flex-row min-h-[300px] relative">



          {/* Vertical Separator Line (Only visible on desktop) */}

          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-200 transform -translate-x-1/2" />



          {/* 1. Input Area */}

          <div className="md:w-1/2 p-2 md:pr-6 mb-6 md:mb-0">

            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">

              Enter text

            </h2>

           

            {/* Input Action Buttons: Paste and Clear */}

            <div className="flex space-x-3">

                <GreenOutlineButton

                    icon={<Clipboard className="w-4 h-4" />}

                    text="Paste text"

                    onClick={handlePaste}

                    disabled={loading}

                />

                <GreenOutlineButton

                    icon={<XCircle className="w-4 h-4" />}

                    text="Clear"

                    onClick={handleClear}

                    disabled={loading || !text}

                />

            </div>





            {/* Textarea */}

            <textarea

              className="w-full h-48 mt-4 p-4 text-base md:text-lg border-2 border-black rounded-lg focus:outline-none focus:border-green-400 resize-none transition duration-150 shadow-sm"

              placeholder={sourcePlaceholder}

              value={text}

              onChange={handleTextChange}

              disabled={loading}

            />



            {/* Error Message */}

            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          </div>



          {/* 2. Output Area */}

          <div className="md:w-1/2 p-2 md:pl-6">

            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4 opacity-50">

              Translation

            </h2>



            {/* The output display area */}

            <div className="w-full h-48 mt-4 p-4 text-base md:text-lg text-gray-800 bg-gray-50 rounded-lg border border-gray-100 overflow-y-auto">

              {loading ? (

                <div className="flex items-center space-x-2 text-green-600">

                  <RefreshCw className="w-5 h-5 animate-spin" />

                  <span>Translating...</span>

                </div>

              ) : result ? (

                <p>{result}</p>

              ) : (

                <p className="text-gray-400 italic">Translation will appear here.</p>

              )}

            </div>

          </div>

        </div>



        {/* --- Translate Button (Bottom Center) --- */}

        <div className="flex justify-center mt-8 pt-4 border-t border-gray-100">

          <button

            onClick={handleTranslate}

            className="flex items-center space-x-2 px-6 py-3 md:px-8 bg-green-600 text-white font-bold text-base md:text-lg rounded-full shadow-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"

            disabled={loading || !text.trim()}

          >

            <ArrowRight className="w-5 h-5" />

            <span>{loading ? "Translating..." : "Translate"}</span>

          </button>

        </div>



      </div>

    </div>

  );

}