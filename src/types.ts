export interface FoodTruck {
    id: string;
    truckName: string;
    logo?: string;
    cuisine?: string;
    website?: string;
    social?: {
      facebook?: string;
      instagram?: string;
    };
    foodIcon?: string;
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
  
