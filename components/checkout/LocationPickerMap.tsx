"use client"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

type Props = {
  onPick: (lat: number, lng: number) => void
  initialLat?: number | null
  initialLng?: number | null
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function DragHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const map = useMap()

  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.on("dragend", () => {
          const pos = layer.getLatLng()
          onPick(pos.lat, pos.lng)
        })
      }
    })
  }, [map, onPick])

  return null
}

export default function LocationPickerMap({ onPick, initialLat, initialLng }: Props) {
  const [position, setPosition] = useState<[number, number]>(
    initialLat != null && initialLng != null ? [initialLat, initialLng] : [30.0444, 31.2357]
  )

  useEffect(() => {
    if (initialLat != null && initialLng != null) {
      setPosition([initialLat, initialLng])
    }
  }, [initialLat, initialLng])

  const handlePick = (lat: number, lng: number) => {
    setPosition([lat, lng])
    onPick(lat, lng)
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} draggable />
      <ClickHandler onPick={handlePick} />
      <DragHandler onPick={handlePick} />
    </MapContainer>
  )
}
