import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { userHelpers } from '@/lib/db-helpers';
import { USER_ROLES, type UserRole } from '@/db/schema';

const isRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await userHelpers.findById(session.user.id);
  return user?.role === 'admin' ? user : null;
}

export async function GET(request: NextRequest) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const search = request.nextUrl.searchParams.get('search') || undefined;
  const items = await userHelpers.findAll(search);

  return NextResponse.json({ items, currentUserId: currentUser.id });
}

export async function POST(request: Request) {
  const currentUser = await requireAdmin();
  if (!currentUser) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role || 'membre';
    const photoUrl = typeof body.photoUrl === 'string' && body.photoUrl.trim() ? body.photoUrl.trim() : null;

    if (username.length < 2 || username.length > 50) {
      return NextResponse.json({ error: 'Le nom doit contenir entre 2 et 50 caractères.' }, { status: 400 });
    }

    if (firstName.length < 2 || firstName.length > 100 || lastName.length < 2 || lastName.length > 100) {
      return NextResponse.json({ error: 'Le prénom et le nom doivent contenir entre 2 et 100 caractères.' }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }

    if (!isRole(role)) {
      return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
    }

    const [user] = await userHelpers.create({ username, firstName, lastName, email, password, role, isCeMember: role !== 'admin', photoUrl });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json({ error: 'Cet e-mail ou ce nom est déjà utilisé.' }, { status: 409 });
    }

    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Impossible de créer cet utilisateur.' }, { status: 500 });
  }
}
