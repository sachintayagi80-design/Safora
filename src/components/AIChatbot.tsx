import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi, I am your SAFORA AI assistant. How can I help you stay safe today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to UI immediately
    const userMessage = input;
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Connect to your FastAPI backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Add Gemini's real reply to the UI
      setMessages([...newMessages, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages([...newMessages, { role: 'ai', content: "Sorry, I am having trouble connecting to the network right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-6 bottom-28 z-50 flex flex-col items-end">
      
      {/* The Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="text-white font-semibold">SAFORA AI</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-lg max-w-[85%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white self-end' : 'bg-gray-800 text-gray-200 self-start'}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg max-w-[85%] text-sm bg-gray-800 text-gray-400 self-start animate-pulse">
                Typing...
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for help..." 
              className="flex-1 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading}
              className={`p-2 rounded-lg text-white transition ${isLoading ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* The Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-gray-700 hover:scale-105 transition-all"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}