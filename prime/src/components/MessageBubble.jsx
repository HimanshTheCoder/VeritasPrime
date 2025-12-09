import React from 'react';
import { Role } from '../types';
import { UserIcon, BotIcon } from './AppIcons';

const MessageBubble = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm 
          ${isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' 
            : 'bg-white text-indigo-500 border border-slate-100'
          }`}>
          {isUser ? <UserIcon className="w-4 h-4" /> : <BotIcon className="w-4 h-4" />}
        </div>

        {/* Bubble */}
        <div className={`relative px-5 py-3.5 shadow-sm text-sm leading-relaxed
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
            : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm'
          }
        `}>
          <div className="whitespace-pre-wrap">
            {message.text}
          </div>
          <div className={`text-[10px] mt-1.5 opacity-60 font-medium ${isUser ? 'text-indigo-100' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;