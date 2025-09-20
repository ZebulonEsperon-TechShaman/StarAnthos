
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === Role.USER;

    const wrapperClasses = isUser ? 'flex justify-end' : 'flex justify-start';
    const bubbleClasses = isUser
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-200';
    const textClasses = 'prose prose-sm prose-invert max-w-none break-words';

    return (
        <div className={wrapperClasses}>
            <div className={`rounded-lg p-3 max-w-md ${bubbleClasses}`}>
                 <p className={textClasses}>{message.content}</p>
            </div>
        </div>
    );
};

export default ChatMessage;
