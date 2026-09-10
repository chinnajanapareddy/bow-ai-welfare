export type Priority = "High" | "Medium" | "Low";

export const impactMetrics = [
  { value: "126", label: "Cases handled" },
  { value: "347", label: "Meals provided" },
  { value: "86", label: "Dogs adopted" },
  { value: "2.4K", label: "Community members" },
];

export const services = [
  { title: "Report", description: "Spot. Share. Save.", icon: "megaphone", href: "/report" },
  { title: "AI Analysis", description: "Smart welfare detection", icon: "scan", href: "/report" },
  { title: "Rescue", description: "Connect with teams", icon: "ambulance", href: "/rescue" },
  { title: "Feed", description: "A meal makes a difference", icon: "bowl", href: "/donate" },
  { title: "Adopt", description: "Give a forever home", icon: "home", href: "/adopt" },
  {
    title: "Community",
    description: "Share. Support. Inspire.",
    icon: "users",
    href: "/community",
  },
] as const;

export const dogs = [
  {
    name: "Milo",
    detail: "Calm · Friendly · Medium Energy",
    match: "95%",
    status: "Ready for a family",
  },
  {
    name: "Luna",
    detail: "Playful · Affectionate · Active",
    match: "90%",
    status: "Vaccinated & sterilized",
  },
  {
    name: "Rocky",
    detail: "Loyal · Gentle · Medium Energy",
    match: "87%",
    status: "Assessment complete",
  },
  {
    name: "Bella",
    detail: "Quiet · Sweet · Low Energy",
    match: "88%",
    status: "Ready for a family",
  },
];

export const cases = [
  {
    id: "PC-1047",
    location: "Besant Nagar, Chennai",
    priority: "High" as Priority,
    time: "18 min ago",
    indicator: "Possible injury",
    team: "Team A",
    status: "Reviewed",
  },
  {
    id: "PC-1042",
    location: "Gandhi Road, Hyderabad",
    priority: "Medium" as Priority,
    time: "42 min ago",
    indicator: "Needs food support",
    team: "Unassigned",
    status: "Reported",
  },
  {
    id: "PC-1038",
    location: "Kothrud, Pune",
    priority: "Low" as Priority,
    time: "1 hr ago",
    indicator: "Routine follow-up",
    team: "Team C",
    status: "Intervention",
  },
  {
    id: "PC-1029",
    location: "Indiranagar, Bengaluru",
    priority: "High" as Priority,
    time: "2 hrs ago",
    indicator: "Abnormal posture",
    team: "Team B",
    status: "Assigned",
  },
];

export const stories = [
  {
    title: "Bruno's Second Chance",
    quote: "From pain on the streets to a life full of love.",
    type: "Rescue story",
    supporters: "142",
    comments: "18",
  },
  {
    title: "A birthday gift with four legs",
    quote: "20 meals, one neighborhood, and a new tradition.",
    type: "Birthday feeding",
    supporters: "86",
    comments: "12",
  },
];

export const priorityTone = (priority: Priority) => {
  if (priority === "High") return "high";
  if (priority === "Medium") return "medium";
  return "low";
};
