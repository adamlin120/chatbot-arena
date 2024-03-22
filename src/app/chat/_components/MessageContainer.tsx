export default function MessageContainer({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`${
          isUser ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-800'
        } p-2 rounded-lg max-w-xs whitespace-pre-wrap	`}
      >
        {message}
      </div>
    </div>
  );
}