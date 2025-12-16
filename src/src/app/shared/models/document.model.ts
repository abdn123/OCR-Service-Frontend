// Document Model
export interface Document {
    id: number;
    name: string;
    type: string;
    text: string;
    metadata: any;
    user: number;
    classificationType: string;
}

// Document Upload Response
export interface DocumentUploadResponse {
    message: string;
    documentId?: number;
}
