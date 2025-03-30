export interface FoodTruck {
  id: string;
  truckName: string;
  logo?: string;
  cuisine?: string; // allow string[] if you're storing arrays
  website?: string;
  region?: string;
  franchiseId?: string;
  description?: string;
  social?: {
    facebook?: string;
    instagram?: string;
  };
  foodIcon?: string;
  status?: "open" | "opening_soon" | "inactive" | "closing_soon" | "unknown" | "closed";
  startTime: string;
  endTime: string;
  location: string;
  latitude: number;
  longitude: number;
}
  
export interface ScheduleEntry {
    id: string;
    truckId: string;
    truckName: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    latitude?: number;
    longitude?: number;
    foodIcon?: string;
  }
  
export interface ApiResponse {
    foodTrucks: FoodTruck[];
    schedules: ScheduleEntry[];
  }

  export interface TruckEntry {
    truckId: string;
    truckName: string;
    date: string; // ✅ Store date inside each truck object
    startTime: string;
    endTime: string;
    location: string;
    foodIcon?: string;
  }
  
  export interface ScheduleEntry {
    id: string; // ✅ Matches "YYYY-MM-DD"
    trucks: TruckEntry[]; // ✅ Array of food trucks
  }
  
  export interface SponsorScheduleEntry {
    id: string; // date string, e.g., "2025-03-28"
    sponsorId: string;
    sponsorName: string;
    logo?: string;
    region: string;
    placement: "popup" | "footer";
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
  }
  
  export interface Sponsor {
    id?: string;
    name: string;
    region: string;
    url: string;
    logo: string;
    email: string;
    phone: string;
    address: string;
  }  
  
  export interface SponsorScheduleEntry {
    date: string;
    sponsorId: string;
    sponsorName: string;
    logo?: string;
    region: string;
    placement: "popup" | "footer";
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    location?: string;
  }

  export interface ProcessedFoodTruck extends FoodTruck {
    isInRange: boolean;
    status:
      | "open"
      | "opening_soon"
      | "inactive"
      | "closed"
      | "closing_soon"
      | "unknown"
      | undefined;
  }