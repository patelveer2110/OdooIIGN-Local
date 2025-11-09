// src/modules/projects/projects.service.ts
import { Injectable, BadRequestException } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

type CreateProjectDto = {
  name: string
  code?: string
  description?: string
  budgetAmount?: number | string
  currency?: string
  status?: string // will map to your enum
  startDate?: string | Date
  dueDate?: string | Date // FE name -> maps to endDate
  managerId?: string      // FE name -> maps to projectManagerId
  // accept passthrough fields if you have more...
  [key: string]: any
}

type UpdateProjectDto = CreateProjectDto

const ALLOWED_STATUSES = new Set([
  // Put your actual enum members here:
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
])

function toDateOrNull(v?: string | Date) {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return isNaN(d.getTime()) ? null : d
}

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // ---------- Analytics helpers ----------
  async getProjectMetrics(): Promise<{
    totalProjects: number
    totalRevenue: number
    totalCost: number
    totalProfit: number
  }> {
    const totalProjects = await this.prisma.project.count()

    const invoices = await this.prisma.customerInvoice.findMany({
      select: { totalAmount: true },
    })
    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount?.toNumber?.() ?? 0),
      0
    )

    const timesheets = await this.prisma.timesheet.findMany({
      select: { amount: true },
    })
    const timesheetCost = timesheets.reduce(
      (sum, ts) => sum + (ts.amount?.toNumber?.() ?? 0),
      0
    )

    const expenses = await this.prisma.expense.findMany({
      select: { amount: true },
    })
    const expenseCost = expenses.reduce(
      (sum, e) => sum + (e.amount?.toNumber?.() ?? 0),
      0
    )

    const totalCost = timesheetCost + expenseCost

    return {
      totalProjects,
      totalRevenue,
      totalCost,
      totalProfit: totalRevenue - totalCost,
    }
  }

  async getUtilizationTrend(): Promise<Array<{ month: string; utilization: number }>> {
    const timesheets = await this.prisma.timesheet.findMany({
      select: { workDate: true, durationHours: true },
    })

    const monthly = new Map<string, number>()
    timesheets.forEach((ts) => {
      const d = new Date(ts.workDate as any)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const hours = (ts.durationHours as any)?.toNumber?.() ?? Number(ts.durationHours) ?? 0
      monthly.set(key, (monthly.get(key) ?? 0) + hours)
    })

    return Array.from(monthly.entries())
      .sort()
      .map(([month, hours]) => ({ month, utilization: Math.round(hours) }))
  }

  // ---------- Queries ----------
  async findAll(filters?: any) {
    return this.prisma.project.findMany({
      where: filters,
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
        teamMembers: {
          select: {
            id: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    })
  }

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
        teamMembers: {
          select: {
            id: true,
            user: { select: { fullName: true, email: true } },
          },
        },
        tasks: true,
        timesheets: true,
        expenses: true,
      },
    })
  }

  // ---------- Create / Update with mapping ----------
  async create(body: CreateProjectDto) {
    const {
      managerId, // FE -> maps to relation
      dueDate,   // FE -> endDate
      startDate,
      status,
      ...rest
    } = body

    if (!rest.name?.trim()) {
      throw new BadRequestException("Project name is required")
    }

    // status mapping (fallback to PLANNING if invalid/missing)
    const normalizedStatus = String(status || "").toUpperCase()
    const safeStatus = ALLOWED_STATUSES.has(normalizedStatus)
      ? normalizedStatus
      : "PLANNING"

    // date mapping
    const start = toDateOrNull(startDate) ?? new Date()
    const end = toDateOrNull(dueDate)

    // Build data for Prisma
    const data: any = {
      ...rest, // name, code, description, budgetAmount, currency, etc.
      status: safeStatus,
      startDate: start,
      endDate: end,
    }

    // Required relation: either set projectManagerId or connect via projectManager
    if (managerId) {
      // Either do a connect:
      data.projectManager = { connect: { id: managerId } }
      // or if you prefer raw FK: data.projectManagerId = managerId
    } else {
      // Since schema requires projectManagerId, we must fail here if FE omitted it
      throw new BadRequestException("managerId is required")
    }

    return this.prisma.project.create({
      data,
      include: {
        projectManager: { select: { id: true, fullName: true, email: true } },
      },
    })
  }

  async update(id: string, body: UpdateProjectDto) {
    const {
      managerId, // FE optional on update
      dueDate,   // FE -> endDate
      startDate,
      status,
      ...rest
    } = body

    const patch: any = {
      ...rest,
    }

    // Optional status mapping on update
    if (typeof status !== "undefined") {
      const normalized = String(status).toUpperCase()
      if (ALLOWED_STATUSES.has(normalized)) {
        patch.status = normalized
      } else {
        // ignore invalid status instead of throwing (or throw if you prefer)
      }
    }

    // Optional date mapping
    if (typeof startDate !== "undefined") {
      const sd = toDateOrNull(startDate)
      if (sd) patch.startDate = sd
    }
    if (typeof dueDate !== "undefined") {
      const ed = toDateOrNull(dueDate)
      patch.endDate = ed // can be null to clear
    }

    // Manager change (optional)
    if (typeof managerId !== "undefined") {
      if (managerId) {
        patch.projectManager = { connect: { id: managerId } }
        // or: patch.projectManagerId = managerId
      } else {
        // If you want to allow clearing manager (not typical since required FK):
        // patch.projectManager = { disconnect: true } // would violate required FK
        // Better to require a valid id:
        throw new BadRequestException("managerId cannot be empty")
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: patch,
    })
  }

  // ---------- Per-project financials ----------
  async getFinancials(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customerInvoices: true,
        timesheets: true,
        expenses: true,
      },
    })

    if (!project) return null

    const revenue = project.customerInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount?.toNumber?.() ?? 0),
      0
    )

    const costs =
      project.timesheets.reduce(
        (sum, ts) => sum + (ts.amount?.toNumber?.() ?? 0),
        0
      ) +
      project.expenses.reduce(
        (sum, exp) => sum + (exp.amount?.toNumber?.() ?? 0),
        0
      )

    return {
      projectId,
      revenue,
      cost: costs,
      profit: revenue - costs,
      profitMargin: revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0,
    }
  }
}
