import { PrismaClient, GlobalRole, BoardRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Kanban database...');

  await prisma.activityLog.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.boardCollaborator.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kanban.local',
      passwordHash,
      fullName: 'Admin User',
      role: GlobalRole.ADMIN,
      themePreference: 'dark'
    }
  });

  const developer = await prisma.user.create({
    data: {
      email: 'developer@kanban.local',
      passwordHash,
      fullName: 'Developer User',
      role: GlobalRole.USER,
      themePreference: 'light'
    }
  });

  const board1 = await prisma.board.create({
    data: {
      name: 'Platform Launch',
      ownerId: admin.id,
      collaborators: {
        create: [
          { userId: admin.id, role: BoardRole.OWNER },
          { userId: developer.id, role: BoardRole.EDITOR }
        ]
      },
      columns: {
        create: [
          {
            name: 'Todo',
            position: 0,
            tasks: {
              create: [
                {
                  title: 'Build UI Mockups',
                  description: 'Design sleek modern interface components',
                  status: 'Todo',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Header layout', isCompleted: true, position: 0 },
                      { title: 'Sidebar navigation', isCompleted: false, position: 1 }
                    ]
                  }
                },
                {
                  title: 'Configure PostgreSQL DB',
                  description: 'Set up Prisma ORM schema and migrations',
                  status: 'Todo',
                  position: 1,
                  subtasks: {
                    create: [
                      { title: 'Define models', isCompleted: true, position: 0 }
                    ]
                  }
                }
              ]
            }
          },
          {
            name: 'Doing',
            position: 1,
            tasks: {
              create: [
                {
                  title: 'Implement JWT Auth',
                  description: 'Secure API endpoints with Bearer token middleware',
                  status: 'Doing',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Login endpoint', isCompleted: true, position: 0 },
                      { title: 'Register endpoint', isCompleted: true, position: 1 }
                    ]
                  }
                }
              ]
            }
          },
          {
            name: 'Done',
            position: 2,
            tasks: {
              create: [
                {
                  title: 'Setup Monorepo Structure',
                  description: 'Organize server and client root folders',
                  status: 'Done',
                  position: 0,
                  subtasks: {
                    create: [
                      { title: 'Root package.json', isCompleted: true, position: 0 }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  const board2 = await prisma.board.create({
    data: {
      name: 'Marketing Plan',
      ownerId: developer.id,
      collaborators: {
        create: [
          { userId: developer.id, role: BoardRole.OWNER },
          { userId: admin.id, role: BoardRole.VIEWER }
        ]
      },
      columns: {
        create: [
          {
            name: 'Ideas',
            position: 0,
            tasks: {
              create: [
                {
                  title: 'Social Media Campaign',
                  description: 'Plan product announcement posts',
                  status: 'Ideas',
                  position: 0
                }
              ]
            }
          },
          {
            name: 'In Progress',
            position: 1
          }
        ]
      }
    }
  });

  await prisma.activityLog.createMany({
    data: [
      {
        boardId: board1.id,
        userId: admin.id,
        action: 'BOARD_CREATED',
        details: 'Created board "Platform Launch"'
      },
      {
        boardId: board2.id,
        userId: developer.id,
        action: 'BOARD_CREATED',
        details: 'Created board "Marketing Plan"'
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
