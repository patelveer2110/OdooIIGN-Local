import { FinanceService } from "./finance.service";
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
    getSalesOrders(query: any): Promise<({
        project: {
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
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            soId: string;
            productId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        customerId: string | null;
        customerName: string | null;
    })[]>;
    createSalesOrder(body: any): Promise<({
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            soId: string;
            productId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        customerId: string | null;
        customerName: string | null;
    }) | null>;
    createInvoiceFromSalesOrder(id: string): Promise<{
        invoice: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            sourceSoId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            dueDate: Date | null;
            notes: string | null;
        };
        invoiceLines: any[];
    }>;
    getSalesOrder(id: string): Promise<({
        project: {
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
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            soId: string;
            productId: string | null;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        customerId: string | null;
        customerName: string | null;
    }) | null>;
    getPurchaseOrders(query: any): Promise<({
        project: {
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
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            poId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        vendorId: string | null;
        vendorName: string | null;
    })[]>;
    getPurchaseOrder(id: string): Promise<({
        project: {
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
        } | null;
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            poId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        vendorId: string | null;
        vendorName: string | null;
    }) | null>;
    createPurchaseOrder(body: any): Promise<({
        lines: {
            id: string;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            poId: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        vendorId: string | null;
        vendorName: string | null;
    }) | null>;
    getVendorBills(query: any): Promise<({
        project: {
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
        } | null;
        billLines: {
            id: string;
            createdAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            billId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        dueDate: Date | null;
        notes: string | null;
        vendorId: string | null;
        vendorName: string | null;
        sourcePo: string | null;
    })[]>;
    getVendorBill(id: string): Promise<({
        project: {
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
        } | null;
        billLines: {
            id: string;
            createdAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            billId: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        dueDate: Date | null;
        notes: string | null;
        vendorId: string | null;
        vendorName: string | null;
        sourcePo: string | null;
    }) | null>;
    createVendorBillFromPo(poId: string, body: any): Promise<{
        vendorBill: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            dueDate: Date | null;
            notes: string | null;
            vendorId: string | null;
            vendorName: string | null;
            sourcePo: string | null;
        };
        billLines: any[];
    }>;
    getInvoices(projectId?: string): Promise<({
        project: {
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
        } | null;
        invoiceLines: {
            id: string;
            createdAt: Date;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string;
            timesheetId: string | null;
            expenseId: string | null;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        sourceSoId: string | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        dueDate: Date | null;
        notes: string | null;
    })[]>;
    createInvoiceFromTimesheets(body: {
        project_id: string;
        timesheet_ids: string[];
    }): Promise<{
        invoice: {
            id: string;
            number: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            totalAmount: number;
            createdAt: Date;
        };
        invoiceLines: {
            id: string;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unitPrice: number;
            amount: number;
        }[];
        timesheetsInvoiced: number;
    }>;
    createInvoiceFromSo(body: any): Promise<{
        invoice: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.DocumentStatus;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            sourceSoId: string | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            dueDate: Date | null;
            notes: string | null;
        };
        invoiceLines: any[];
    }>;
}
//# sourceMappingURL=finance.controller.d.ts.map