import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detects if a file is a video based on its URL or file extension
 */
export function isVideoFile(url: string): boolean {
  if (!url) return false
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.mpeg', '.mpg', '.m4v']
  const lowercaseUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowercaseUrl.includes(ext))
}

/**
 * Detects if a file is an audio based on its URL or file extension
 */
export function isAudioFile(url: string): boolean {
  if (!url) return false
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.m4b', '.m4p']
  const lowercaseUrl = url.toLowerCase()
  return audioExtensions.some(ext => lowercaseUrl.includes(ext))
}

/**
 * Detects if a file is an image based on its URL or file extension
 */
export function isImageFile(url: string): boolean {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
  const lowercaseUrl = url.toLowerCase()
  return imageExtensions.some(ext => lowercaseUrl.includes(ext))
}

/**
 * Gets the media type of a file
 */
export function getMediaType(url: string): 'image' | 'video' | 'audio' | 'unknown' {
  if (isVideoFile(url)) return 'video'
  if (isAudioFile(url)) return 'audio'
  if (isImageFile(url)) return 'image'
  return 'unknown'
}