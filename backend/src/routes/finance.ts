import { Router } from "express";
import { database } from "../database.js";
import { AuthRequest } from "../middleware/auth.js";

const router = Router();
const monthBounds = (month?: string) => {
  const date = month && /^\d{4}-\d{2}$/.test(month) ? new Date(`${month}-01T12:00:00`) : new Date();
  const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().slice(0, 10);
  return [start, end];
};

router.get("/dashboard", async (request: AuthRequest, response, next) => {
  try {
    const [start, end] = monthBounds(request.query.month as string | undefined);
    const [totals, byCategory, latest, goals] = await Promise.all([
      database.query("SELECT COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income, COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expense FROM transactions WHERE user_id = $1 AND occurred_at >= $2 AND occurred_at < $3", [request.userId, start, end]),
      database.query("SELECT COALESCE(c.name, 'Sem categoria') AS name, COALESCE(c.color, '#64748b') AS color, SUM(t.amount) AS amount FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.user_id = $1 AND t.type = 'expense' AND t.occurred_at >= $2 AND t.occurred_at < $3 GROUP BY c.name, c.color ORDER BY amount DESC", [request.userId, start, end]),
      database.query("SELECT t.id, t.description, t.amount, t.type, t.occurred_at, c.name AS category_name, c.color AS category_color FROM transactions t LEFT JOIN categories c ON c.id = t.category_id WHERE t.user_id = $1 ORDER BY t.occurred_at DESC, t.created_at DESC LIMIT 6", [request.userId]),
      database.query("SELECT id, name, target_amount, current_amount, deadline FROM goals WHERE user_id = $1 ORDER BY created_at DESC", [request.userId])
    ]);
    const summary = totals.rows[0];
    response.json({ month: start.slice(0, 7), summary: { income: Number(summary.income), expense: Number(summary.expense), balance: Number(summary.income) - Number(summary.expense) }, expensesByCategory: byCategory.rows.map(row => ({ ...row, amount: Number(row.amount) })), transactions: latest.rows.map(row => ({ ...row, amount: Number(row.amount) })), goals: goals.rows.map(row => ({ ...row, target_amount: Number(row.target_amount), current_amount: Number(row.current_amount) })) });
  } catch (error) { next(error); }
});

router.get("/categories", async (request: AuthRequest, response, next) => { try { const result = await database.query("SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name", [request.userId]); response.json(result.rows); } catch (error) { next(error); } });
router.post("/categories", async (request: AuthRequest, response, next) => { try { const { name, color, type } = request.body; if (!name || !["income", "expense"].includes(type)) return response.status(400).json({ message: "Categoria inválida." }); const result = await database.query("INSERT INTO categories (user_id, name, color, type) VALUES ($1, $2, $3, $4) RETURNING *", [request.userId, name.trim(), color || "#6366f1", type]); response.status(201).json(result.rows[0]); } catch (error) { next(error); } });
router.post("/transactions", async (request: AuthRequest, response, next) => { try { const { description, amount, type, categoryId, occurredAt } = request.body; if (!description || !Number(amount) || !["income", "expense"].includes(type) || !occurredAt) return response.status(400).json({ message: "Lançamento inválido." }); const result = await database.query("INSERT INTO transactions (user_id, category_id, description, amount, type, occurred_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [request.userId, categoryId || null, description.trim(), amount, type, occurredAt]); response.status(201).json(result.rows[0]); } catch (error) { next(error); } });
router.post("/goals", async (request: AuthRequest, response, next) => { try { const { name, targetAmount, deadline } = request.body; if (!name || !Number(targetAmount)) return response.status(400).json({ message: "Meta inválida." }); const result = await database.query("INSERT INTO goals (user_id, name, target_amount, deadline) VALUES ($1, $2, $3, $4) RETURNING *", [request.userId, name.trim(), targetAmount, deadline || null]); response.status(201).json(result.rows[0]); } catch (error) { next(error); } });

export default router;
