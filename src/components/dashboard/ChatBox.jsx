import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Paperclip, 
  Flag,
  Image as ImageIcon,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatBox({ 
  currentUserId, 
  otherUserId, 
  otherUserName, 
  otherUserPhoto,
  subscriptionId 
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', currentUserId, otherUserId],
    queryFn: async () => {
      const sent = await base44.entities.ChatMessage.filter({ from_user_id: currentUserId, to_user_id: otherUserId });
      const received = await base44.entities.ChatMessage.filter({ from_user_id: otherUserId, to_user_id: currentUserId });
      return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    staleTime: 10000,
    refetchInterval: 10000, // Poll for new messages every 10 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.ChatMessage.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages']);
      setMessage("");
    },
  });

  const flagMessageMutation = useMutation({
    mutationFn: (messageId) => base44.entities.ChatMessage.update(messageId, { flagged: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages']);
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() && !pendingAttachment) return;

    const messageData = {
      from_user_id: currentUserId,
      to_user_id: otherUserId,
      subscription_id: subscriptionId,
      message: message.trim() || (pendingAttachment ? pendingAttachment.name : ''),
      is_read: false
    };

    if (pendingAttachment) {
      messageData.attachment_url = pendingAttachment.url;
    }

    await sendMessageMutation.mutateAsync(messageData);
    setPendingAttachment(null);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPendingAttachment({
        url: file_url,
        name: file.name,
        isImage: file.type.startsWith('image/')
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const removePendingAttachment = () => {
    setPendingAttachment(null);
  };

  const handleFlag = async (messageId) => {
    if (confirm("Flag this message for admin review?")) {
      await flagMessageMutation.mutateAsync(messageId);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-6 border-b">
        <Avatar className="w-12 h-12">
          <AvatarImage src={otherUserPhoto} />
          <AvatarFallback className="bg-[#B3E5FC]">
            {otherUserName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{otherUserName}</h3>
          <p className="text-sm text-gray-500">Active now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.from_user_id === currentUserId;
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div 
                    className={`rounded-2xl px-4 py-3 ${
                      isOwn 
                        ? 'bg-[#FF6B5C] text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-200 rounded-tl-sm'
                    }`}
                  >
                    {msg.attachment_url ? (
                      <div className="space-y-2">
                        {msg.attachment_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img 
                            src={msg.attachment_url} 
                            alt="Attachment" 
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          <a 
                            href={msg.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:underline"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{msg.message}</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <p className="text-xs text-gray-500">
                      {format(new Date(msg.created_date), 'h:mm a')}
                    </p>
                    {!isOwn && (
                      <button
                        onClick={() => handleFlag(msg.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Flag message"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                    {msg.flagged && (
                      <span className="text-xs text-red-500">Flagged</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white">
        {/* Pending Attachment Preview */}
        {pendingAttachment && (
          <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center gap-3">
            {pendingAttachment.isImage ? (
              <img 
                src={pendingAttachment.url} 
                alt="Attachment preview" 
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pendingAttachment.name}</p>
              <p className="text-xs text-gray-500">Ready to send</p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={removePendingAttachment}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              onChange={(e) => {
                handleFileUpload(e.target.files[0]);
                e.target.value = '';
              }}
              className="hidden"
              disabled={uploading}
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="rounded-full"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
                ) : (
                  <Paperclip className="w-5 h-5" />
                )}
              </span>
            </Button>
          </label>

          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={pendingAttachment ? "Add a message (optional)..." : "Type your message..."}
            className="flex-1 rounded-full h-12 px-6"
          />

          <Button 
            type="submit" 
            disabled={(!message.trim() && !pendingAttachment) || sendMessageMutation.isPending}
            className="btn-primary text-white rounded-full h-12 w-12 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}