import api from './axios'
import type { PresignedUrlRequest, PresignedUrlResponse } from '@/types/file-upload'

export async function getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
  try {
    const response = await api.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/files/presigned-url`, request)
    return response.data
  } catch (error) {
    console.error('Failed to get presigned URL:', error)
    throw new Error('Failed to get upload URL')
  }
}

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`)
    }
  } catch (error) {
    console.error('Failed to upload file to S3:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to upload file: ${errorMessage}`)
  }
}

export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    // const response = await api.delete(`http://localhost:5000/files/${key}`)
    // if (!response.data.success) {
    //   throw new Error('Delete request failed')
    // }
    const a = true;
    // return a;
  } catch (error) {
    console.error('Failed to delete file from S3:', error)
    throw new Error('Failed to delete file')
  }
}