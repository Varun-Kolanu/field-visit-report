import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationMap({ position }) {
    return (
        <div className="w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
                center={position}
                zoom={17}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                    <Popup>You are here!</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default LocationMap;
