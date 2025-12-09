import React, { useState, useRef } from 'react';
import { SendIcon } from './AppIcons';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <div className="relative flex items-end gap-2 bg-white p-2 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask me ...."
          className="w-full bg-transparent border-none text-slate-700 placeholder:text-slate-400 focus:ring-0 resize-none py-3 px-4 max-h-[150px] min-h-[48px] text-sm scrollbar-hide"
          rows={1}
          style={{ height: '48px' }}
        />
        <button
          onClick={() => handleSubmit()}
          disabled={!text.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 mb-1 mr-1 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="text-center mt-3 text-xs text-slate-400">
        AI can make mistakes.
      </div>
    </div>
  );
};

export default ChatInput;