import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, getInboxEmails, getSentEmails, getTrashEmails } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  try {
    const user = requirePermission(req, 'settings', 'read');
    
    if (user.role === 'guide') {
      return NextResponse.json({ error: 'Guides não têm acesso ao sistema de emails' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'sent';
    const emailType = searchParams.get('type') || 'personal';

    const staff = await prisma.staff.findUnique({
      where: { id: user.userId },
      select: { email: true, departmentId: true },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    let email = staff.email;

    if (emailType === 'department' && staff.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: staff.departmentId },
        select: { email: true },
      });

      if (!department?.email) {
        return NextResponse.json({ error: 'Department email not configured' }, { status: 400 });
      }

      email = department.email;
    }

    let emails;
    if (folder === 'inbox' || folder === 'received') {
      emails = await getInboxEmails(email);
    } else if (folder === 'sent') {
      emails = await getSentEmails(email);
    } else if (folder === 'trash') {
      emails = await getTrashEmails(email);
    } else {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    }

    return NextResponse.json(emails);
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requirePermission(req, 'settings', 'create');

    if (user.role === 'guide') {
      return NextResponse.json({ error: 'Guides não têm acesso ao sistema de emails' }, { status: 403 });
    }

    const body = await req.json();
    const { to, subject, text, html, fromType = 'personal' } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: user.userId },
      select: { email: true, name: true, departmentId: true },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    let fromEmail = staff.email;

    if (fromType === 'department' && staff.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: staff.departmentId },
        select: { email: true },
      });

      if (!department?.email) {
        return NextResponse.json({ error: 'Department email not configured' }, { status: 400 });
      }

      fromEmail = department.email;
    }

    const result = await sendEmail({
      from: fromEmail,
      to,
      subject,
      text,
      html,
      metadata: {
        sentBy: staff.name,
        sentByUserId: user.userId,
        fromType,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
