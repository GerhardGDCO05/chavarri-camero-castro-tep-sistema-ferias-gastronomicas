export interface Stall {
    id: string;
    name: string;
    description: string;
    location?: string;
    status: 'pendiente' | 'aprobado' | 'activo';
    entrepreneurId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StallResponse {
    stall: Stall;
    message?: string;
}

export interface StallListResponse {
    stalls: Stall[];
    total: number;
}

export interface ValidateOwnershipRequest {
    stallId: string;
    entrepreneurId: string;
}

export interface ValidateOwnershipResponse {
    valid: boolean;
    message?: string;
}