import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { count, eq } from 'drizzle-orm';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { userHelpers } from '@/lib/db-helpers';
import { USER_ROLES, users, type UserRole } from '@/db/schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const isRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await userHelpers.findById(session.user.id);
  return user?.role === 'admin' ? user : null;
}

async function hasAnotherAdmin(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, 'admin'));

  const adminCount = Number(result[0]?.count || 0);
  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });

  return target?.role !== 'admin' || adminCount > 1;
}

export async function PATCH(request: Request, context: RouteContext) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const updates: {
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      isCeMember?: boolean;
      photoUrl?: string | null;
    } = {};

    if (body.username !== undefined) {
      const username = typeof body.username === 'string' ? body.username.trim() : '';
      if (username.length < 2 || username.length > 50) {
        return NextResponse.json({ error: 'Le nom doit contenir entre 2 et 50 caractères.' }, { status: 400 });
      }
      updates.username = username;
    }

    for (const field of ['firstName', 'lastName'] as const) {
      if (body[field] !== undefined) {
        const value = typeof body[field] === 'string' ? body[field].trim() : '';
        if (value.length < 2 || value.length > 100) {
          return NextResponse.json({ error: 'Le prénom et le nom doivent contenir entre 2 et 100 caractères.' }, { status: 400 });
        }
        updates[field] = value;
      }
    }

    if (body.email !== undefined) {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
      }
      updates.email = email;
    }

    if (body.password !== undefined && body.password !== '') {
      if (typeof body.password !== 'string' || body.password.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
      }
      updates.password = body.password;
    }

    if (body.role !== undefined) {
      if (!isRole(body.role)) {
        return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
      }
      updates.role = body.role;
    }

    if (body.photoUrl !== undefined) {
      if (body.photoUrl !== null && (typeof body.photoUrl !== 'string' || body.photoUrl.length > 500)) {
        return NextResponse.json({ error: 'Photo invalide.' }, { status: 400 });
      }
      updates.photoUrl = body.photoUrl || null;
    }

    if (updates.role) updates.isCeMember = updates.role !== 'admin';

    if (updates.role && updates.role !== 'admin' && !(await hasAnotherAdmin(id))) {
      return NextResponse.json({ error: 'Il doit rester au moins un administrateur.' }, { status: 400 });
    }

    const [user] = await userHelpers.update(id, updates);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'Cet e-mail ou ce nom est déjà utilisé.' }, { status: 409 });
    }

    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Impossible de modifier cet utilisateur.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const { id } = await context.params;

  if (id === currentUser.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 });
  }

  if (!(await hasAnotherAdmin(id))) {
    return NextResponse.json({ error: 'Il doit rester au moins un administrateur.' }, { status: 400 });
  }

  const deleted = await userHelpers.delete(id);
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
