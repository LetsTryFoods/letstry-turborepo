export interface PresignedUrlRequest {
  filename: string
  contentType?: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  key: string
  finalUrl: string
  baseUrl: string
}

export interface UploadedFile {
  file: File
  alt: string
  preview: string
  uploadUrl?: string
  key?: string
  finalUrl?: string
}