import prisma from "./prisma"

export async function searchAdminEntities(query: string, take: number = 5) {
  const normalizedQuery = query.trim()

  const [users, projects, leads, updates] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { email: { contains: normalizedQuery, mode: "insensitive" } },
          { companyName: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        clerkId: true,
        name: true,
        email: true,
        companyName: true,
      },
      take,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { description: { contains: normalizedQuery, mode: "insensitive" } },
          {
            client: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
          {
            client: {
              email: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        status: true,
        client: { select: { name: true, email: true } },
      },
      take,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lead.findMany({
      where: {
        OR: [
          { companyName: { contains: normalizedQuery, mode: "insensitive" } },
          { contactName: { contains: normalizedQuery, mode: "insensitive" } },
          { email: { contains: normalizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        status: true,
      },
      take,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.update.findMany({
      where: {
        OR: [
          { title: { contains: normalizedQuery, mode: "insensitive" } },
          { description: { contains: normalizedQuery, mode: "insensitive" } },
          {
            project: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        project: { select: { id: true, name: true } },
      },
      take,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { users, projects, leads, updates }
}

export async function searchAdminFullEntities(query: string, take: number = 5) {
  const normalizedQuery = query.trim()

  const [assets, activities] = await Promise.all([
    prisma.asset.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: "insensitive" } },
          { key: { contains: normalizedQuery, mode: "insensitive" } },
          {
            project: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        project: { select: { id: true, name: true } },
      },
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: {
        OR: [
          { summary: { contains: normalizedQuery, mode: "insensitive" } },
          { entityType: { contains: normalizedQuery, mode: "insensitive" } },
          {
            project: {
              name: { contains: normalizedQuery, mode: "insensitive" },
            },
          },
        ],
      },
      select: {
        id: true,
        summary: true,
        entityType: true,
        projectId: true,
        project: { select: { id: true, name: true } },
      },
      take,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { assets, activities }
}
