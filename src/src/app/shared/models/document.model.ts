// Document Model
export interface Document {
    id: number;
    name: string;
    type: string;
    text: string;
    metadata: any;
    user: number;
    classificationType: string;
    document: String;
}

// Document Upload Response
export interface DocumentUploadResponse {
    message: string;
    documentId?: number;
    classificationType?: string;
    content?: string;  // JSON string containing invoice data
}

// Invoice Content Model (as received from API - all strings)
export interface InvoiceContent {
    invoice_number: string;
    invoice_date: string;
    total_amount: string;  // Comes as string like "23,581.71"
    vendor_name: string;
}

// Processed Invoice Content Model (parsed values)
export interface ProcessedInvoiceContent {
    invoice_number: string;
    invoice_date: string;  // Formatted as YYYY-MM-DD
    total_amount: number;  // Parsed as number
    vendor_name: string;
}
