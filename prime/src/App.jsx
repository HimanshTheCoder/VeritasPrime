import React, { useState, useEffect, useRef, useCallback } from 'react';
import { geminiService } from './services/gemini';
import { Role } from './types';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import { SparklesIcon, LoadingDots } from './components/AppIcons';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize Chat
  useEffect(() => {
    geminiService.startChat();
    // Optional: Add an initial greeting from the bot locally
    setMessages([
      {
        id: 'init-1',
        role: Role.MODEL,
        text: "Greetings, Seeker. I am Veritas Prime, \n The Deepheart from which all lore flows. Here stands the Answer, yet only the correct Question holds the key.\n Speak your riddle of Eldoria, and the truth shall be unlocked.",
        timestamp: new Date()
      }
    ]);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create a placeholder message for the model response
      const modelMessageId = (Date.now() + 1).toString();
      const initialModelMessage = {
        id: modelMessageId,
        role: Role.MODEL,
        text: '',
        isStreaming: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, initialModelMessage]);

      const stream = await geminiService.sendMessageStream(text);

      let accumulatedText = '';
      
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === modelMessageId 
              ? { ...msg, text: accumulatedText }
              : msg
          )
        );
      }

      // Mark streaming as done
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to send message", error);
      // Remove the empty placeholder if it failed completely or add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: "I'm sorry, I encountered a connection issue. Please try again.",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Header */}
      <header className="flex-none h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-800">Veritas Prime</h1>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === Role.USER && (
             <div className="flex w-full mb-6 justify-start animate-pulse">
                <div className="flex max-w-[75%] gap-3">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                     <SparklesIcon className="w-4 h-4 text-indigo-400" />
                   </div>
                   <div className="px-5 py-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center">
                      <LoadingDots />
                   </div>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-slate-50">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </footer>
    </div>
  );
}

export default App;