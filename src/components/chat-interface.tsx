"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat-message";
import type { ChatMessage as ChatMessageType, Entreprise, DataGouvDataset } from "@/types";

interface ChatInterfaceProps {
  onSelectEntreprise: (entreprise: Entreprise) => void;
  onAddToList: (entreprise: Entreprise) => void;
}

const WELCOME_MESSAGE: ChatMessageType = {
  id: "welcome",
  role: "assistant",
  content: `Bonjour ! Je suis votre assistant de prospection B2B basé sur les données officielles françaises (data.gouv.fr).

Je peux vous aider à trouver des entreprises selon vos critères. Voici quelques exemples de questions :

• "Trouve-moi des agences de communication à Paris avec plus de 10 salariés"
• "Cherche des restaurants dans le département 69 (Rhône)"
• "Quelles sont les entreprises ESS dans le secteur informatique ?"
• "Montre-moi des PME dans la construction en Île-de-France"

Posez votre question en langage naturel et je m'occupe du reste !`,
  timestamp: new Date().toISOString(),
};

export function ChatInterface({ onSelectEntreprise, onAddToList }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStatus("Analyse de votre requête...");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Erreur ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";
      let assistantEntreprises: Entreprise[] | undefined;
      let assistantDatasets: DataGouvDataset[] | undefined;
      const assistantId = `assistant-${Date.now()}`;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const parsed = JSON.parse(raw) as {
              event: string;
              data: string | { results: Entreprise[] } | DataGouvDataset[];
            };

            if (parsed.event === "status") {
              setStatus(parsed.data as string);
            } else if (parsed.event === "entreprises") {
              assistantEntreprises = (parsed.data as { results: Entreprise[] }).results;
            } else if (parsed.event === "datasets") {
              assistantDatasets = parsed.data as DataGouvDataset[];
            } else if (parsed.event === "message") {
              assistantContent = parsed.data as string;
              setMessages((prev) => {
                const exists = prev.find((m) => m.id === assistantId);
                const newMsg: ChatMessageType = {
                  id: assistantId,
                  role: "assistant",
                  content: assistantContent,
                  entreprises: assistantEntreprises,
                  datasets: assistantDatasets,
                  timestamp: new Date().toISOString(),
                };
                if (exists) {
                  return prev.map((m) => (m.id === assistantId ? newMsg : m));
                }
                return [...prev, newMsg];
              });
            } else if (parsed.event === "error") {
              throw new Error((parsed.data as string) ?? "Erreur inconnue");
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Finalize message if content wasn't set via stream
      if (!assistantContent) {
        assistantContent = "Je n'ai pas pu traiter votre demande. Veuillez réessayer.";
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: assistantContent,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Une erreur est survenue";
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Désolé, une erreur est survenue : ${errMsg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold">Assistant de prospection</h1>
        <p className="text-sm text-muted-foreground">
          Recherchez des entreprises en langage naturel
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              entreprises={msg.entreprises}
              datasets={msg.datasets}
              onSelectEntreprise={onSelectEntreprise}
              onAddToList={onAddToList}
            />
          ))}

          {/* Status indicator */}
          {loading && status && (
            <div className="flex justify-start mb-4">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                <span className="animate-pulse">{status}</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Posez votre question... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="resize-none min-h-[52px] max-h-[200px]"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
