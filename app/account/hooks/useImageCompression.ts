import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '../types/product'

interface UseImageCompressionResult {
  compressImage: (file: File) => Promise<File>
  isCompressing: boolean
  error: string | null
}

interface UseImageCompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
}

export function useImageCompression(options: UseImageCompressionOptions = {}): UseImageCompressionResult {
  const [isCompressing, setIsCompressing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 1920
  } = options

  const compressImage = useCallback(async (file: File): Promise<File> => {
    try {
      setIsCompressing(true)
      setError(null)

      // Validar tipo de archivo
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido')
      }

      // Si el archivo ya es menor que el límite, retornarlo sin comprimir
      if (file.size <= MAX_FILE_SIZE) {
        return file
      }

      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
      })
      
      // Crear un nuevo File con el mismo nombre pero comprimido
      return new File([compressedFile], file.name, {
        type: compressedFile.type,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al comprimir la imagen'
      setError(message)
      throw err
    } finally {
      setIsCompressing(false)
    }
  }, [maxSizeMB, maxWidthOrHeight])

  return { compressImage, isCompressing, error }
} 