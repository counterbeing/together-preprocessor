export interface Story {
  id: string
  title: string
  location: string
  startDate: Date
  body: string
  description: string
  endDate?: Date
  lat?: number
  lng?: number
  photos?: any[]
}

export interface Media {
  file: string
  date: Date
  checksum: string
  width: number
  height: number
  originalFileName?: string
  contentType: string
  lat?: number
  lng?: number
}
