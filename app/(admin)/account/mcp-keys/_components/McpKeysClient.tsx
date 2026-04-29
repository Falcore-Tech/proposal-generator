"use client";

import { useState } from "react";
import axios from "axios";
import { Copy, Plus, Trash2, Check } from "lucide-react";

interface McpKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

interface McpKeysClientProps {
  initialKeys: McpKey[];
}

export default function McpKeysClient({ initialKeys }: McpKeysClientProps) {
  const [keys, setKeys] = useState<McpKey[]>(initialKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeKeys = keys.filter((k) => !k.revoked_at);
  const vercelUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://your-app.vercel.app";

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/mcp-keys", { name: newKeyName.trim() });
      setCreatedKey(data.plaintext_key);
      setKeys((prev) => [{ ...data, revoked_at: null }, ...prev]);
      setNewKeyName("");
    } catch {
      setError("Failed to create key.");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    setRevoking(id);
    setError(null);
    try {
      await axios.delete(`/api/mcp-keys?id=${id}`);
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k))
      );
    } catch {
      setError("Failed to revoke key.");
    } finally {
      setRevoking(null);
    }
  }

  async function copyKey(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const configSnippet = createdKey
    ? JSON.stringify(
        {
          mcpServers: {
            "xma-proposals": {
              type: "http",
              url: `${vercelUrl}/api/mcp`,
              headers: { Authorization: `Bearer ${createdKey}` },
            },
          },
        },
        null,
        2
      )
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">MCP API Keys</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Generate keys to connect Claude Desktop to the XMA proposal tools.
        </p>
      </div>

      {createdKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-400">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-zinc-900 px-3 py-2 text-xs text-zinc-200 break-all">
              {createdKey}
            </code>
            <button
              onClick={() => copyKey(createdKey)}
              className="shrink-0 rounded bg-zinc-700 p-2 text-zinc-300 hover:bg-zinc-600"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Add to Claude Desktop <code>claude_desktop_config.json</code>:
          </p>
          <pre className="rounded bg-zinc-900 p-3 text-xs text-zinc-300 overflow-auto">
            {configSnippet}
          </pre>
          <button
            onClick={() => setCreatedKey(null)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">Create new key</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Key name (e.g. My MacBook)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            className="flex-1 rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          <button
            onClick={createKey}
            disabled={creating || !newKeyName.trim()}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            <Plus size={14} />
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">
          Active keys ({activeKeys.length})
        </h2>
        {activeKeys.length === 0 ? (
          <p className="text-sm text-zinc-500">No active keys.</p>
        ) : (
          <ul className="space-y-2">
            {activeKeys.map((key) => (
              <li
                key={key.id}
                className="flex items-center justify-between rounded-md bg-zinc-800 border border-zinc-700 px-4 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-white">{key.name}</p>
                  <p className="text-xs text-zinc-500">
                    <code>{key.key_prefix}…</code> &middot; Created{" "}
                    {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && (
                      <> &middot; Last used {new Date(key.last_used_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => revokeKey(key.id)}
                  disabled={revoking === key.id}
                  className="ml-4 shrink-0 rounded p-1.5 text-zinc-500 hover:bg-zinc-700 hover:text-red-400 disabled:opacity-50"
                  title="Revoke key"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
