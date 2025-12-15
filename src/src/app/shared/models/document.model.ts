// Document Model
export interface Document {
    id: number;
    name: string;
    type: string;
    text: string;
    metadata: any;
    user: number;
}

// Document Upload Response
export interface DocumentUploadResponse {
    message: string;
    documentId?: number;
}
