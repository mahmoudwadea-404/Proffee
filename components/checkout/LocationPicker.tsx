"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useCallback } from "react"
import { MapPin, X } from "lucide-react"

const MapInner = dynamic(() => import("./LocationPickerMap"), { ssr: false })

type LocationPickerProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (lat: number, lng: number) => void
  initialLat?: number | null
  initialLng?: number | null
}

export default function LocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const [selectedLat, setSelectedLat] = useState<number | null>(initialLat ?? null)
  const [selectedLng, setSelectedLng] = useState<number | null>(initialLng ?? null)

  useEffect(() => {
    if (isOpen) {
      setSelectedLat(initialLat ?? null)
      setSelectedLng(initialLng ?? null)
    }
  }, [isOpen, initialLat, initialLng])

  const handlePick = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat)
    setSelectedLng(lng)
  }, [])

  const handleConfirm = () => {
    if (selectedLat != null && selectedLng != null) {
      onConfirm(selectedLat, selectedLng)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-background overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-base font-serif text-text-primary">Pick Delivery Location</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="h-80 w-full">
          <MapInner
            onPick={handlePick}
            initialLat={initialLat}
            initialLng={initialLng}
          />
        </div>

        <div className="px-6 py-4 border-t border-border space-y-3">
          {selectedLat != null && selectedLng != null ? (
            <p className="text-xs text-text-secondary">
              Selected: <span className="text-text-primary font-mono">{selectedLat.toFixed(5)}, {selectedLng.toFixed(5)}</span>
            </p>
          ) : (
            <p className="text-xs text-text-muted">Click on the map or drag the pin to select your location</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedLat == null || selectedLng == null}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
