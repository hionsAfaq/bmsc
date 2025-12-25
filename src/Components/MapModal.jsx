import React, { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for Leaflet default marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapModal = ({ isOpen, onClose, boards }) => {
  if (!isOpen) return null;

  // Default center (Pakistan)
  const defaultCenter = [30.3753, 69.3451];
  
  // Calculate center based on first valid board
  let center = defaultCenter;
  const validBoards = boards.filter(
    (b) =>
      b.Latitude != null &&
      b.Longitude != null &&
      !isNaN(parseFloat(b.Latitude)) &&
      !isNaN(parseFloat(b.Longitude))
  );

  if (validBoards.length > 0) {
    center = [parseFloat(validBoards[0].Latitude), parseFloat(validBoards[0].Longitude)];
  }

  // Jitter logic to handle overlapping markers
  const markers = [];
  const positions = [];

  validBoards.forEach((board) => {
    let lat = parseFloat(board.Latitude);
    let lng = parseFloat(board.Longitude);

    // Simple overlap check
    const isOverlapping = positions.some(
      (p) => Math.abs(p.lat - lat) < 0.0001 && Math.abs(p.lng - lng) < 0.0001
    );

    if (isOverlapping) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 0.0001; // ~11 meters
      lat += radius * Math.cos(angle);
      lng += radius * Math.sin(angle);
    }

    positions.push({ lat, lng });
    markers.push({ ...board, lat, lng });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Campaign Boards Map
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full bg-gray-100 z-0 map-container-fix">
          <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite (Esri)">
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Detailed Streets (Google)">
                <TileLayer
                   url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                   maxZoom={20}
                   subdomains={['mt0','mt1','mt2','mt3']}
                />
              </LayersControl.BaseLayer>
               
               <LayersControl.BaseLayer name="Hybrid (Google)">
                <TileLayer
                   url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
                   maxZoom={20}
                   subdomains={['mt0','mt1','mt2','mt3']}
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            {markers.map((board, idx) => (
              <Marker key={`${board._id}-${idx}`} position={[board.lat, board.lng]}>
                <Popup>
                  <div className="text-gray-800 font-sans p-1">
                    <h3 className="font-bold text-base m-0 mb-1">{board.BoardNo}</h3>
                    <p className="m-0 text-sm mb-1">{board.Location}</p>
                    <p className="m-0 text-xs text-gray-500">{board.City}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white border-t text-sm text-gray-500 flex justify-between relative z-10">
          <span>Total Boards: {boards.length}</span>
          <span>Showing valid locations: {markers.length}</span>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
