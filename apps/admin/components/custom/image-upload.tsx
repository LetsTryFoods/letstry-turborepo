'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import Compressor from '@uppy/compressor'
import ImageEditor from '@uppy/image-editor'
import { useFileUpload } from '@/hooks/use-file-upload'
import { deleteFileFromS3 } from '@/lib/file-upload'
import type { UploadedFile } from '@/types/file-upload'

import '@uppy/core/css/style.min.css'
import '@uppy/dashboard/css/style.min.css'
import '@uppy/image-editor/css/style.min.css'

interface ImageUploadProps {
  onImagesChange: (images: Array<{ file: File; alt: string; preview: string; finalUrl?: string }>) => void
  initialImages?: Array<{ url: string; alt: string }>
  maxFiles?: number
  allowedFileTypes?: string[]
}

export function ImageUpload({ onImagesChange, initialImages = [], maxFiles = 10, allowedFileTypes = ['image/webp'] }: ImageUploadProps) {
  const dashboardRef = useRef<HTMLDivElement>(null)
  const { uploadFile, isUploading } = useFileUpload()
  const [uppy] = useState(() => new Uppy({
    restrictions: {
      maxNumberOfFiles: maxFiles,
      allowedFileTypes: allowedFileTypes,
      maxFileSize: 5 * 1024 * 1024, 
    },
    autoProceed: false,
  }).use(Compressor, {
    quality: 0.2,
    limit: 10,
    convertSize: 0,
  }).use(ImageEditor, {
    quality: 0.8,
  }))

  const [uploadedImages, setUploadedImages] = useState<UploadedFile[]>([])
  const [altTexts, setAltTexts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialImages.length > 0 && uploadedImages.length === 0) {
      const initialUploadedFiles: UploadedFile[] = initialImages.map((img, index) => ({
        file: {
          name: `existing-${index}-${Date.now()}`,
          type: 'image/unknown',
          size: 0,
          lastModified: Date.now(),
          webkitRelativePath: '',
          slice: () => new Blob(),
          stream: () => new ReadableStream(),
          text: () => Promise.resolve(''),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        } as unknown as File,
        alt: img.alt || '',
        preview: img.url,
        finalUrl: img.url,
        key: img.url,
      }))
      setUploadedImages(initialUploadedFiles)
      
      const alts: Record<string, string> = {}
      initialUploadedFiles.forEach(f => {
        alts[f.file.name] = f.alt
      })
      setAltTexts(alts)
    }
  }, [initialImages])

  useEffect(() => {
    if (dashboardRef.current && !uppy.getPlugin('Dashboard')) {
      uppy.use(Dashboard, {
        inline: true,
        target: dashboardRef.current,
        height: 300,
        theme: 'light',
        width: '100%',
        hideProgressDetails: false,
        hideUploadButton: true,
        showRemoveButtonAfterComplete: true,
        proudlyDisplayPoweredByUppy: false,
        showSelectedFiles: true,
        singleFileFullScreen: false,
        disableThumbnailGenerator: false,
        disableStatusBar: false,
        disableInformer: false,
      })
    }
    const handleFileAdded = (file: any) => {
      console.log('File added:', file.name, file.type)
      uppy.upload()
    }

    const handleFileRemoved = async (file: any) => {
      // Find the uploaded file to get its key for deletion
      const uploadedFile = uploadedImages.find(img => img.file === file.data)

      if (uploadedFile?.key) {
        try {
          await deleteFileFromS3(uploadedFile.key)
        } catch (error) {
          console.error('Failed to delete file from S3:', error)
          // Continue with local removal even if S3 deletion fails
        }
      }

      setUploadedImages(prev => prev.filter(img => img.file !== file.data))
      setAltTexts(prev => {
        const newAltTexts = { ...prev }
        delete newAltTexts[file.id]
        return newAltTexts
      })
    }

    // Listen for compression completion (preprocessing)
    // Listen for compression completion (preprocessing)
    const handlePreprocessComplete = (file: any) => {
      if (!file) return
      console.log('Preprocessing complete for file:', file.name)
      uploadCompressedFile(file)
    }

    const uploadCompressedFile = async (file: any) => {
      if (file.meta.uploaded) return

      try {
        const uploadedFile = await uploadFile(file.data, '')
        uppy.setFileMeta(file.id, { uploaded: true })
        setUploadedImages(prev => [...prev, uploadedFile])
      } catch (error) {
        console.error('Failed to upload file:', error)
        uppy.removeFile(file.id)
      }
    }

    uppy.on('file-added', handleFileAdded)
    uppy.on('file-removed', handleFileRemoved)
    uppy.on('preprocess-complete', handlePreprocessComplete)

    return () => {
      uppy.off('file-added', handleFileAdded)
      uppy.off('file-removed', handleFileRemoved)
      uppy.off('preprocess-complete', handlePreprocessComplete)
    }
  }, [uppy])

  useEffect(() => {
    const imagesWithAlt = uploadedImages.map((img, index) => ({
      file: img.file,
      alt: altTexts[img.file.name] || img.alt || `Product image ${index + 1}`,
      preview: img.preview,
      finalUrl: img.finalUrl,
    }))
    onImagesChange(imagesWithAlt)
  }, [uploadedImages, altTexts, onImagesChange])

  const handleAltTextChange = (fileName: string, alt: string) => {
    setAltTexts(prev => ({
      ...prev,
      [fileName]: alt,
    }))
  }

  const handleRemoveImage = (fileName: string) => {
    setUploadedImages(prev => prev.filter(img => img.file.name !== fileName))
    setAltTexts(prev => {
      const newAlts = { ...prev }
      delete newAlts[fileName]
      return newAlts
    })
  }

  return (
    <div className="space-y-4 w-full">
      <div ref={dashboardRef} className="border rounded-lg w-full" />
      {isUploading && (
        <div className="text-sm text-blue-600">Uploading files...</div>
      )}

      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Images & Alt Text</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={image.file.name} className="border rounded-lg p-3 space-y-2 relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleRemoveImage(image.file.name)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <input
                  type="text"
                  placeholder="Alt text for image"
                  value={altTexts[image.file.name] || image.alt || ''}
                  onChange={(e) => handleAltTextChange(image.file.name, e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Size: {(image.file.size / 1024 / 1024).toFixed(2)} MB</div>
                  {image.finalUrl && (
                    <div className="truncate">
                      URL: <a href={image.finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {image.finalUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}