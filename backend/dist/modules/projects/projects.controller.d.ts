import { ProjectsService } from "./projects.service";
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    findAll(): Promise<({
        projectManager: {
            email: string;
            fullName: string;
            id: string;
        };
        teamMembers: {
            user: {
                email: string;
                fullName: string;
            };
            id: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        currency: string;
        code: string;
        customerId: string | null;
        projectManagerId: string;
        startDate: Date;
        endDate: Date | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
        billableFlag: boolean;
        projectType: import(".prisma/client").$Enums.ProjectType;
    })[]>;
    findById(id: string): Promise<({
        timesheets: {
            id: string;
            status: import(".prisma/client").$Enums.TimesheetStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            projectId: string;
            notes: string | null;
            taskId: string | null;
            workDate: Date;
            durationHours: import("@prisma/client/runtime/library").Decimal;
            hourlyRate: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal;
            billable: boolean;
            invoiced: boolean;
            invoiceId: string | null;
        }[];
        expenses: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            projectId: string;
            currency: string;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            billable: boolean;
            date: Date;
            category: string;
            approved: boolean;
            reimbursed: boolean;
            receiptUrl: string | null;
        }[];
        projectManager: {
            email: string;
            fullName: string;
            id: string;
        };
        teamMembers: {
            user: {
                email: string;
                fullName: string;
            };
            id: string;
        }[];
        tasks: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            projectId: string;
            dueDate: Date | null;
            title: string;
            state: import(".prisma/client").$Enums.TaskState;
            priority: import(".prisma/client").$Enums.TaskPriority;
            assigneeId: string | null;
            estimateHours: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        currency: string;
        code: string;
        customerId: string | null;
        projectManagerId: string;
        startDate: Date;
        endDate: Date | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
        billableFlag: boolean;
        projectType: import(".prisma/client").$Enums.ProjectType;
    }) | null>;
    getFinancials(id: string): Promise<{
        projectId: string;
        revenue: number;
        cost: number;
        profit: number;
        profitMargin: number;
    } | null>;
    create(body: any): Promise<{
        projectManager: {
            email: string;
            fullName: string;
            id: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        currency: string;
        code: string;
        customerId: string | null;
        projectManagerId: string;
        startDate: Date;
        endDate: Date | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
        billableFlag: boolean;
        projectType: import(".prisma/client").$Enums.ProjectType;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ProjectStatus;
        defaultHourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        currency: string;
        code: string;
        customerId: string | null;
        projectManagerId: string;
        startDate: Date;
        endDate: Date | null;
        budgetAmount: import("@prisma/client/runtime/library").Decimal | null;
        billableFlag: boolean;
        projectType: import(".prisma/client").$Enums.ProjectType;
    }>;
}
//# sourceMappingURL=projects.controller.d.ts.map