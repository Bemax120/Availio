import { create } from "zustand";

const useFilterStore = create((set) => ({
  vehicleType: null,
  locationAddress: null,
  locationFilter: null,
  startDate: null,
  endDate: null,
  pickUpTime: null,
  returnTime: null,

  setVehicleType: (vehicleType) => set({ vehicleType }),
  setLocationAddress: (locationAddress) => set({ locationAddress }),
  setLocationFilter: (locationFilter) => set({ locationFilter }),
  setStartDate: (startDate) => set({ startDate }),
  setEndDate: (endDate) => set({ endDate }),
  setPickUpTime: (pickUpTime) => set({ pickUpTime }),
  setReturnTime: (returnTime) => set({ returnTime }),

  resetFilters: () =>
    set({
      vehicleType: null,
      locationAddress: null,
      locationFilter: null,
      startDate: null,
      endDate: null,
      pickUpTime: null,
      returnTime: null,
    }),
}));

export default useFilterStore;
