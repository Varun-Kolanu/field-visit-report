import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationMap({ position }) {

    return (
        <MapContainer
            center={position}
            zoom={17}
            style={{ height: "300px", width: "100%" }}
        // className="-z-10"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>You are here!</Popup>
            </Marker>
        </MapContainer>
    );
}

export default LocationMap;
