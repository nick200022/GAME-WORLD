// Ejemplo de función serverless para Vercel/AWS que registra una transacción en un backend (placeholder).
// Este archivo es un ejemplo TypeScript para Vercel Serverless Functions (/api/recordPayment).
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { txHash, from, amount, token } = req.body || {};
  // Aquí guardarías en una DB (DynamoDB, Firebase Firestore, etc.)
  console.log('Registro de pago:', txHash, from, amount, token);
  return res.status(200).json({ ok: true });
}
