import { create } from 'zustand'

interface FileData {
  name: string
  type: string
  size: number
  data: string | ArrayBuffer
  uploadType: 'camera' | 'photo' | 'pdf'
}

interface UploadStore {
  files: FileData[]
  setFiles: (files: FileData[]) => void
  clearFiles: () => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  clearFiles: () => set({ files: [] }),
}))
