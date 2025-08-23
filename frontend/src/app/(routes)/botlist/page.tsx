'use client'
import { useChatBots } from '@/hooks/api/useChatBots';
import { useBotAccessList, useUpdateBotAccess } from '@/hooks/api/useBotAccess';
import { useUsers } from '@/hooks/api/useUsers';
import { useAuthContext } from '@/context/AuthContext';

export default function BotList() {
  const { data: chatbots } = useChatBots();
  const { data: users } = useUsers();
  const updateBotAccess = useUpdateBotAccess();
  const { user } = useAuthContext();

  // For each bot, show access for each user and allow updating
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Chatbots</h1>
      {chatbots?.map(bot => (
        <div key={bot.id} className="mb-6 border p-4 rounded-lg">
          <h2 className="font-semibold">{bot.name}</h2>
          <p className="text-gray-500">{bot.description}</p>
          <h3 className="mt-3 font-medium">User Access</h3>
          <ul>
            {users?.map(u => (
              <li key={u.id} className="flex items-center gap-2">
                <span>{u.firstName} {u.lastName} ({u.email})</span>
                {/* You can fetch and show current access status here */}
                <button
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => updateBotAccess.mutate({ id: bot.id, data: { isBlocked: false } })}
                >
                  Grant Access
                </button>
                <button
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => updateBotAccess.mutate({ id: bot.id, data: { isBlocked: true } })}
                >
                  Block Access
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}