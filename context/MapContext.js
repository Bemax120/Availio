import React, { createContext, useState } from "react";

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [initialLocation, setInitialLocation] = useState(null);
  const [address, setAddress] = useState("");

  return (
    <MapContext.Provider
      value={{
        initialLocation,
        setInitialLocation,
        address,
        setAddress,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
