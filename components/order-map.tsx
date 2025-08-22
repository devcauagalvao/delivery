'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'

interface OrderMapProps {
  latitude: number
  longitude: number
  customerName: string
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export function OrderMap({ latitude, longitude, customerName }: OrderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current).setView([latitude, longitude], 16)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    const pulsingIcon = L.divIcon({
      className: 'pulsing-marker',
      html: `
        <div class="relative">
          <div class="w-6 h-6 bg-red-500 rounded-full animate-ping absolute"></div>
          <div class="w-6 h-6 bg-red-600 rounded-full relative flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    const marker = L.marker([latitude, longitude], { icon: pulsingIcon }).addTo(map)
    marker.bindPopup(`📍 ${customerName}<br/>Localização do cliente`)

    const restaurantLat = -23.550520
    const restaurantLng = -46.633308
    const distance = calculateDistance(latitude, longitude, restaurantLat, restaurantLng)

    const distancePopup = L.popup()
      .setLatLng([latitude, longitude])
      .setContent(`
        <div class="text-center">
          <strong>${customerName}</strong><br/>
          📍 Localização do cliente<br/>
          📏 ~${distance.toFixed(1)}km do restaurante
        </div>
      `)

    marker.bindPopup(distancePopup)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, customerName])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      ref={mapRef}
      className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 2xl:h-96 rounded-2xl overflow-hidden"
      style={{ minHeight: '192px' }}
    />
  )
}
