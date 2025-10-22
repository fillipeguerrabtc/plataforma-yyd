import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeAutoApproval } from '@/lib/tour-auto-approval';

export async function POST(req: NextRequest) {
  try {
    const now = new Date();

    const pendingTasks = await prisma.scheduledTask.findMany({
      where: {
        executed: false,
        scheduledFor: {
          lte: now,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      take: 50,
    });

    console.log(`🔄 Processing ${pendingTasks.length} scheduled tasks...`);

    const results = [];

    for (const task of pendingTasks) {
      try {
        console.log(`⏰ Executing task ${task.taskType} for ${task.entityId}`);

        if (task.taskType === 'tour_auto_approval') {
          await executeAutoApproval(task.entityId);
        }

        await prisma.scheduledTask.update({
          where: { id: task.id },
          data: {
            executed: true,
            executedAt: new Date(),
          },
        });

        results.push({
          taskId: task.id,
          taskType: task.taskType,
          entityId: task.entityId,
          success: true,
        });

        console.log(`✅ Task ${task.id} executed successfully`);
      } catch (error: any) {
        console.error(`❌ Error executing task ${task.id}:`, error);

        results.push({
          taskId: task.id,
          taskType: task.taskType,
          entityId: task.entityId,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('❌ Error processing scheduled tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    const pendingCount = await prisma.scheduledTask.count({
      where: {
        executed: false,
        scheduledFor: {
          lte: now,
        },
      },
    });

    const upcomingCount = await prisma.scheduledTask.count({
      where: {
        executed: false,
        scheduledFor: {
          gt: now,
        },
      },
    });

    return NextResponse.json({
      pendingTasks: pendingCount,
      upcomingTasks: upcomingCount,
      currentTime: now.toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error fetching scheduled tasks status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
