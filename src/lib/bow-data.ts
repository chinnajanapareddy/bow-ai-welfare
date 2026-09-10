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
    detail: "Calm · Friendly · 1.5 yrs",
    match: "95%",
    status: "Ready for a family",
    location: "Besant Nagar, Chennai",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Luna",
    detail: "Playful · Affectionate · 2 yrs",
    match: "90%",
    status: "Vaccinated & sterilized",
    location: "Indiranagar, Bengaluru",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Rocky",
    detail: "Loyal · Gentle · 3 yrs",
    match: "87%",
    status: "Assessment complete",
    location: "Banjara Hills, Hyderabad",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Bella",
    detail: "Quiet · Sweet · 1 yr",
    match: "88%",
    status: "Ready for a family",
    location: "Kothrud, Pune",
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Bruno",
    detail: "Protective · Smart · 2.5 yrs",
    match: "93%",
    status: "Fostered in Bandra",
    location: "Bandra, Mumbai",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Coco",
    detail: "Loving · Curious · 8 mos",
    match: "92%",
    status: "Puppy care complete",
    location: "Hauz Khas, Delhi",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Simba",
    detail: "Alert · Social · 2 yrs",
    match: "89%",
    status: "Ready for adoption",
    location: "Panjim, Goa",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Daisy",
    detail: "Gentle · Patient · 1.2 yrs",
    match: "94%",
    status: "Vaccinated & healthy",
    location: "Fort Kochi, Kochi",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800",
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
