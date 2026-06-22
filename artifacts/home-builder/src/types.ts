export type HouseAnswers = {
  style: string;
  size: string;
  color: string;
  floors: string;
  roof: string;
  extras: string[];
  rooms: string[];
  layout: string;
};

export type AppMode = "quiz" | "result" | "3d" | "floorplan" | "interior";
