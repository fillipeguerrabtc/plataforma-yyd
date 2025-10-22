import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { markEmailAsRead, moveEmailToFolder, deleteEmail } from '@/lib/email-service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(req, 'settings', 'update');

    if (user.role === 'guide') {
      return NextResponse.json({ error: 'Guides não têm acesso ao sistema de emails' }, { status: 403 });
    }

    const body = await req.json();
    const { action, folder } = body;

    if (action === 'mark_read') {
      await markEmailAsRead(params.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'move' && folder) {
      await moveEmailToFolder(params.id, folder);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requirePermission(req, 'settings', 'delete');

    if (user.role === 'guide') {
      return NextResponse.json({ error: 'Guides não têm acesso ao sistema de emails' }, { status: 403 });
    }

    await deleteEmail(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
