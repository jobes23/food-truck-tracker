import React from "react";

interface TruckEntryProps {
  truck: {
    truckName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  onClick: (truck: any) => void;
}

const TruckEntry: React.FC<TruckEntryProps> = ({ truck, onClick }) => {
  return (
    <div className="truck-entry" onClick={() => onClick(truck)}>
      🚚 {truck.truckName} <br />
      ⏰ {truck.startTime} - {truck.endTime}
    </div>
  );
};

export default TruckEntry;
