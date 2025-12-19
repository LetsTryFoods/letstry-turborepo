import { useState, useCallback } from 'react'
import { getPresignedUrl, uploadFileToS3 } from '@/lib/file-upload'
import type { PresignedUrlRequest, UploadedFile } from '@/types/file-upload'

interface UseFileUploadReturn {
  uploadFile: (file: File, alt?: string) => Promise<UploadedFile>
  isUploading: boolean
  error: string | null
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File, alt = ''): Promise<UploadedFile> => {
    setIsUploading(true)
    setError(null)
    try {
      const presignedRequest: PresignedUrlRequest = {
        filename: file.name,
        contentType: file.type,
      }

      const presignedResponse = await getPresignedUrl(presignedRequest)
      await uploadFileToS3(presignedResponse.uploadUrl, file)
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      const uploadedFile: UploadedFile = {
        file,
        alt: alt || file.name,
        preview,
        uploadUrl: presignedResponse.uploadUrl,
        key: presignedResponse.key,
        finalUrl: presignedResponse.finalUrl,
      }

      return uploadedFile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    uploadFile,
    isUploading,
    error,
  }
}