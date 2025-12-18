import React from 'react';
import Navbar from './Navbar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper to convert DMS to decimal (pre‑computed here for clarity)
const markers = [
  {
    id: 1,
    name: 'Brgy. Talamban',
    position: [10.36625, 123.91116666666668], // 10°21'58.5\"N 123°54'40.2\"E
  },
  {
    id: 2,
    name: 'Brgy. Canduman',
    position: [10.364277777777778, 123.93199999999999], // 10°21'51.4\"N 123°55'55.2\"E
  },
  {
    id: 3,
    name: 'Brgy. Basak',
    position: [10.360777777777778, 123.94527777777778], // 10°21'38.8\"N 123°56'43.0\"E
  },
  {
    id: 4,
    name: 'Brgy. Cabancalan',
    position: [10.351305555555555, 123.92480555555556], // 10°21'04.7\"N 123°55'29.3\"E
  },
  {
    id: 5,
    name: 'Brgy. Banilad',
    position: [10.344416666666666, 123.91358333333333], // 10°20'39.9\"N 123°54'48.9\"E
  },
  {
    id: 6,
    name: 'Brgy. Apas',
    position: [10.335305555555555, 123.90602777777778], // 10°20'07.1\"N 123°54'21.7\"E
  },
  {
    id: 7,
    name: 'Brgy. Kasambagan',
    position: [10.329138888888889, 123.91233333333333], // 10°19'44.9\"N 123°54'44.4\"E
  },
  {
    id: 8,
    name: 'Brgy. Lahug',
    position: [10.335611111111111, 123.89175], // 10°20'08.2\"N 123°53'30.3\"E
  },
  {
    id: 9,
    name: 'Brgy. Mandaue',
    position: [10.32725, 123.94708333333334], // 10°19'38.1\"N 123°56'49.5\"E
  },
];

const MapPage = () => {
  // Center roughly around Banilad / Talamban area
  const center = [10.35, 123.92];

  return (
    <div>
      <Navbar showUserMenu={true} userName="Jane" />
      <main
        className="map-page-main"
        style={{ 
          padding: '20px 4%', 
          textAlign: 'center',
        }}
      >
        <h1 className="text-2xl font-semibold text-slate-900">Find a Recycling Location</h1>
        <p className="text-xs text-slate-500">Interact with the map and click markers to see location names.</p>

        <div
          style={{
            margin: '20px auto',
            width: '100%',
            maxWidth: '1700px',
            height: '700px',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          <MapContainer
            center={center}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {markers.map((marker) => {
              const [lat, lng] = marker.position;
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

              return (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  icon={markerIcon}
                  eventHandlers={{
                    click: () => window.open(directionsUrl, '_blank'),
                  }}
                >
                  <Popup>
                    <strong>{marker.name}</strong>
                    <br />
                    <span>Click marker to open directions in Google Maps.</span>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default MapPage;
