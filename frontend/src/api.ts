const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api/v1";
export type Dashboard = { summary: { income: number; expense: number; balance: number }; expensesByCategory: { name: string; color: string; amount: number }[]; transactions: Transaction[]; goals: Goal[] };
export type Transaction = { id: string; description: string; amount: number; type: "income" | "expense"; occurred_at: string; category_name?: string; category_color?: string };
export type Goal = { id: string; name: string; target_amount: number; current_amount: number; deadline?: string };
export type Category = { id: string; name: string; color: string; type: "income" | "expense" };
export async function api<T>(path: string, token?: string, init?: RequestInit): Promise<T> { const response = await fetch(`${BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } }); const body = await response.json(); if (!response.ok) throw new Error(body.message || "Não foi possível concluir a ação."); return body; }
