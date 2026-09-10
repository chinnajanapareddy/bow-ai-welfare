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
    detail: "Indian Pariah · Calm · 1.5 yrs",
    match: "95%",
    status: "Vaccinated & ready for a home",
    location: "Besant Nagar, Chennai",
    image: "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Luna",
    detail: "Street Indie Pup · Playful · 8 mos",
    match: "90%",
    status: "Vaccinated & sterilized",
    location: "Indiranagar, Bengaluru",
    image: "https://images.unsplash.com/photo-1655108624627-2802306434d8?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Rocky",
    detail: "Desi Hound · Gentle · 3 yrs",
    match: "87%",
    status: "Welfare check complete",
    location: "Banjara Hills, Hyderabad",
    image: "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Bella",
    detail: "Indian Street Soul · Quiet · 1 yr",
    match: "88%",
    status: "Fostered & ready for family",
    location: "Kothrud, Pune",
    image: "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Bruno",
    detail: "Community Indie · Smart · 2.5 yrs",
    match: "93%",
    status: "Fostered in Bandra",
    location: "Bandra, Mumbai",
    image: "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Coco",
    detail: "Street Rescue Pup · Loving · 6 mos",
    match: "92%",
    status: "De-wormed & healthy",
    location: "Hauz Khas, Delhi",
    image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Simba",
    detail: "Desi Pariah · Social · 2 yrs",
    match: "89%",
    status: "Ready for adoption",
    location: "Panjim, Goa",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Daisy",
    detail: "Indian Street Dog · Patient · 1.2 yrs",
    match: "94%",
    status: "Vaccinated & safe",
    location: "Fort Kochi, Kochi",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800",
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
    status: "OPEN",
    imageUrl: "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "PC-1042",
    location: "Gandhi Road, Hyderabad",
    priority: "Medium" as Priority,
    time: "42 min ago",
    indicator: "Needs food support",
    team: "Unassigned",
    status: "OPEN",
    imageUrl: "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "PC-1038",
    location: "Kothrud, Pune",
    priority: "Low" as Priority,
    time: "1 hr ago",
    indicator: "Routine follow-up",
    team: "Team C",
    status: "OPEN",
    imageUrl: "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "PC-1029",
    location: "Indiranagar, Bengaluru",
    priority: "High" as Priority,
    time: "2 hrs ago",
    indicator: "Abnormal posture",
    team: "Team B",
    status: "OPEN",
    imageUrl: "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=800",
  },
];

export type CommunityComment = {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string;
};

export type CommunityPost = {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  location: string;
  createdAt: string;
  tag: string;
  title: string;
  caption: string;
  image: string;
  likes: number;
  comments: CommunityComment[];
};

export const initialCommunityPosts: CommunityPost[] = [
  {
    id: "post-1",
    authorName: "Ananya Rao",
    authorRole: "Volunteer Coordinator",
    location: "Besant Nagar, Chennai",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    tag: "Rescue Story",
    title: "Bruno's Miraculous Second Chance 🐾",
    caption: "Rescued Bruno near the bus depot with severe weakness. After 3 weeks of dedicated care, medical treatment, and nutritious meals, he's back on his feet and full of love!",
    image: "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800",
    likes: 148,
    comments: [
      {
        id: "c-1",
        author: "Karthik Raja",
        text: "Thank you for taking care of Bruno! He looks so healthy and happy now.",
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: "c-2",
        author: "Meera Krishnan",
        text: "What an amazing transformation! Sending lots of love to the rescue team. ❤️",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "post-2",
    authorName: "Rahul Sharma",
    authorRole: "Community Champion",
    location: "Indiranagar, Bengaluru",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    tag: "Food Support",
    title: "Sunday Neighborhood Feeding Drive 🍲",
    caption: "Celebrated my birthday by serving 40 fresh, unseasoned rice & chicken meals to our local street dogs in Indiranagar. Small actions create big smiles!",
    image: "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=800",
    likes: 94,
    comments: [
      {
        id: "c-3",
        author: "Priya Nair",
        text: "Happy Birthday Rahul! This is the best way to celebrate 🎉",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "post-3",
    authorName: "Dr. Vikram Seth",
    authorRole: "Veterinary Partner",
    location: "Kothrud, Pune",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    tag: "Recovery Update",
    title: "Day 21 Recovery: Sweet Luna is Healing!",
    caption: "From day 1 rescue to day 21 routine checkup — Luna's skin infection has completely cleared up and her tail hasn't stopped wagging all morning!",
    image: "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=800",
    likes: 215,
    comments: [
      {
        id: "c-4",
        author: "Siddharth Joshi",
        text: "Kudos to Dr. Vikram and the BOW Pune team!",
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "post-4",
    authorName: "Sanjana Roy",
    authorRole: "Adoptive Parent",
    location: "Hauz Khas, Delhi",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    tag: "Adoption Story",
    title: "Coco Found Her Forever Home 🏡",
    caption: "Coco was rescued as a tiny street pup in Delhi. Today she officially joined our family! Street souls bring the purest joy into a home.",
    image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=800",
    likes: 182,
    comments: [
      {
        id: "c-5",
        author: "Ananya Rao",
        text: "Welcome to your forever home Coco! 🐾✨",
        createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
    ],
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
