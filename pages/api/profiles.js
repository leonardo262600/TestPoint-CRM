import { getProfiles, upsertProfile } from '../../lib/store';
import { requireAuth } from '../../lib/security';

export default async function handler(req, res) {
  const session = requireAuth(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    const profiles = await getProfiles();
    return res.status(200).json(profiles);
  }

  if (req.method === 'POST') {
    const { userId, nombre, cargo, correo, telefonoPersonal, telefonoEmpresa } = req.body || {};
    const targetUserId = userId || session.id;
    const isAdmin = session.role === 'admin' || session.role === 'CEO';
    if (!isAdmin && targetUserId !== session.id) {
      return res.status(403).json({ message: 'No puedes modificar el perfil de otro usuario' });
    }

    const profile = await upsertProfile({
      userId: targetUserId,
      nombre,
      cargo,
      correo,
      telefonoPersonal,
      telefonoEmpresa,
    });
    return res.status(200).json(profile);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
