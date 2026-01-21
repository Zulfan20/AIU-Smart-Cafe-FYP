"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, X, Search, Loader2, Image as ImageIcon, ShoppingCart, Check } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import type { MenuItem } from '@/types/dashboard'

interface SearchResults {
  predicted_category: string
  confidence: number
  all_predictions: Record<string, number>
  items: MenuItem[]
  total_items: number
  search_type: string
  search_value: string
}

export default function VisualSearch({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isCameraMode, setIsCameraMode] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [addedItem, setAddedItem] = useState<string | null>(null) // For popup confirmation
  const [isCameraAvailable, setIsCameraAvailable] = useState(true)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if camera is available (HTTPS required on mobile)
  useEffect(() => {
    const isHttps = window.location.protocol === 'https:'
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    
    // Camera requires HTTPS or localhost
    setIsCameraAvailable(hasMediaDevices && (isHttps || isLocalhost))
  }, [])

  const startCamera = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Camera not available. Please use file upload instead.', {
          description: 'Camera access requires HTTPS connection on mobile devices.'
        })
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setStream(mediaStream)
      setIsCameraMode(true)
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }, 100)
    } catch (error) {
      console.error('Camera error:', error)
      
      // Provide specific error messages
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera permission denied. Please allow camera access in your browser settings.')
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera found on this device.')
        } else if (error.name === 'NotReadableError') {
          toast.error('Camera is already in use by another application.')
        } else if (error.name === 'SecurityError') {
          toast.error('Camera access blocked. Please use HTTPS or file upload.', {
            description: 'Try accessing via https:// or use the Upload button instead.'
          })
        } else {
          toast.error('Unable to access camera. Please use file upload instead.')
        }
      } else {
        toast.error('Unable to access camera. Please check permissions or use file upload.')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraMode(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    // Set canvas size to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return

      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
      setSelectedImage(file)
      setImagePreview(canvas.toDataURL('image/jpeg'))
      
      // Stop camera after capture
      stopCamera()
      setSearchResults(null)
    }, 'image/jpeg', 0.95)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setSelectedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    // Clear previous results
    setSearchResults(null)
  }

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first')
      return
    }

    setIsSearching(true)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch('/api/visual-search', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResults(data)
      toast.success(`Found ${data.total_items} items in ${data.predicted_category}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search'
      console.error('Visual search error:', error)
      toast.error(message)
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setSearchResults(null)
    setAddingToCart(null)
    stopCamera()
  }

  const addToCart = (item: MenuItem) => {
    setAddingToCart(item._id)
    
    try {
      // Call the parent's addToCart function
      if (onAddToCart) {
        onAddToCart(item)
        
        // Show popup confirmation
        setAddedItem(item.name)
        setTimeout(() => {
          setAddedItem(null)
        }, 2000) // Show for 2 seconds
      } else {
        throw new Error("Add to cart function not available")
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to cart'
      console.error('Add to cart error:', error)
      toast.error(message)
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Visual Search
          </CardTitle>
          <CardDescription>
            Discover menu items by uploading a photo or capturing an image in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Not Available Warning */}
          {!isCameraAvailable && !imagePreview && !isCameraMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Camera not available
                  </h4>
                  <p className="text-xs text-amber-700">
                    Camera access requires a secure HTTPS connection on mobile devices. 
                    Please use the <strong>Upload Image</strong> option below instead.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Upload/Camera Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {!imagePreview && !isCameraMode ? (
              <div className="space-y-4">
                {/* Upload Option */}
                <label className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Upload an Image
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Camera Option */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={startCamera}
                  disabled={!isCameraAvailable}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  {isCameraAvailable ? 'Take a Photo' : 'Camera Unavailable (Use Upload)'}
                </Button>
              </div>
            ) : isCameraMode ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-h-96 object-contain"
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={capturePhoto}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview || ''}
                  alt="Selected"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Search Button */}
          {selectedImage && !searchResults && (
            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Similar Items
                </>
              )}
            </Button>
          )}

          {/* Search Results */}
          {searchResults && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">
                  Detected: {searchResults.predicted_category}
                </h3>
                <p className="text-sm text-green-700 mb-1">
                  Confidence: {(searchResults.confidence * 100).toFixed(1)}%
                </p>
                {searchResults.total_items > 0 ? (
                  <p className="text-sm text-green-600">
                    {searchResults.search_type === 'category' 
                      ? `Found ${searchResults.total_items} items in ${searchResults.search_value} category`
                      : `Found ${searchResults.total_items} items with "${searchResults.search_value}" in the name`
                    }
                  </p>
                ) : (
                  <p className="text-sm text-orange-600">
                    No items found matching this prediction
                  </p>
                )}
                
                {/* All Predictions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(searchResults.all_predictions || {}).slice(0, 3).map(([category, score]) => (
                    <Badge key={category} variant="secondary">
                      {category}: {(score * 100).toFixed(0)}%
                    </Badge>
                  ))}
                </div>
              </div>

              {searchResults.total_items > 0 ? (
              <div>
                <h3 className="font-semibold mb-3 text-lg">
                  Found {searchResults.total_items} Similar Items
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.items.map((item) => (
                    <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Item Image */}
                      {item.imageUrl && (
                        <div className="relative w-full h-48 bg-gray-100">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <CardContent className="p-4 space-y-3">
                        {/* Item Details */}
                        <div>
                          <h4 className="font-semibold text-base line-clamp-2">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.category}</p>
                          
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>

                        {/* Price and Rating */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-600">
                            RM {item.price.toFixed(2)}
                          </span>
                          {(item.averageRating || 0) > 0 && (
                            <span className="text-sm text-gray-600">
                              ⭐ {(item.averageRating || 0).toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => addToCart(item)}
                          disabled={addingToCart === item._id}
                        >
                          {addingToCart === item._id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No {searchResults.predicted_category} items available at the moment
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleClear}
              >
                Search Another Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Added to Cart Popup */}
      {addedItem && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-600 text-white px-8 py-6 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in duration-300">
            <div className="bg-emerald-700 rounded-full p-2">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{addedItem}</p>
              <p className="text-sm text-emerald-100">Added to cart</p>
            </div>
          </div>
        </div>
      )}    </div>
  )
}