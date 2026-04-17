import { getBanking, upsertBanking } from '../../lib/store';
import { requireAuth } from '../../lib/security';

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const banking = await getBanking();
    const isAdmin = session.role === 'admin' || session.role === 'CEO';
    if (isAdmin) return res.status(200).json(banking);
    return res.status(200).json(banking.filter((item) => item.userId === session.id));
  }

  if (req.method === 'POST') {
    const { userId, nombreApellido, iban, banco, correoBank, documento, swift } = req.body || {};
    const targetUserId = userId || session.id;
    const isAdmin = session.role === 'admin' || session.role === 'CEO';
    if (!isAdmin && targetUserId !== session.id) {
      return res.status(403).json({ message: 'No puedes modificar datos bancarios de otro usuario' });
    }

    const entry = await upsertBanking({
      userId: targetUserId,
      nombreApellido,
      iban,
      banco,
      correoBank,
      documento,
      swift,
    });
    return res.status(200).json(entry);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
