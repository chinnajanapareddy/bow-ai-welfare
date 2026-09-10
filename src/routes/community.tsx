import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { ActionLink, BowCard, PageIntro, SectionHeading } from "@/components/bow-ui";
import {
  ArrowRight,
  Check,
  Heart,
  MapPin,
  MessageCircle,
  PawPrint,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  Camera,
  Plus,
} from "@/components/bow-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  initialCommunityPosts,
  type CommunityPost,
  type CommunityComment,
} from "@/lib/bow-data";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Feed & Rescue Stories — BOW" },
      {
        name: "description",
        content:
          "Instagram-style community feed for street dog rescue stories, feeding drives, recovery updates, and adoption stories.",
      },
      { property: "og:title", content: "Community Feed & Rescue Stories — BOW" },
      { property: "og:description", content: "Small actions become visible change. Share your rescue story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});

function getTimeAgo(dateString: string) {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "Recently";
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function compressImage(dataUrl: string, maxDim = 600): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith("data:")) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const SAMPLE_STREET_IMAGES = [
  "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1655108624627-2802306434d8?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=800",
];

function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState("All Stories");
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);

  // User session
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTag, setNewTag] = useState("Rescue Story");
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [compressing, setCompressing] = useState(false);
  const [createError, setCreateError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Posts & User Session
  useEffect(() => {
    if (typeof window !== "undefined") {
      // User Auth
      const email = window.localStorage.getItem("bow-user-email") || window.sessionStorage.getItem("bow-user-email");
      const name = window.localStorage.getItem("bow-user-name") || window.sessionStorage.getItem("bow-user-name");
      const role = window.localStorage.getItem("bow-user-role") || window.sessionStorage.getItem("bow-user-role");

      if (email && name) {
        setCurrentUser({ email, name, role: role ?? "Community Member" });
      }

      // Likes
      try {
        const storedLikes = window.localStorage.getItem("bow-liked-posts");
        if (storedLikes) {
          setLikedPostIds(JSON.parse(storedLikes));
        }
      } catch {}

      // Posts
      try {
        const storedPosts = window.localStorage.getItem("bow-community-posts-v2");
        if (storedPosts) {
          const parsed = JSON.parse(storedPosts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
            return;
          }
        }
      } catch {}

      setPosts(initialCommunityPosts);
      window.localStorage.setItem("bow-community-posts-v2", JSON.stringify(initialCommunityPosts));
    }
  }, []);

  // Sync Posts to LocalStorage
  const updatePostsState = (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("bow-community-posts-v2", JSON.stringify(newPosts));
      } catch {}
    }
  };

  // Toggle Like
  const handleToggleLike = (postId: string) => {
    const isLiked = Boolean(likedPostIds[postId]);
    const nextLiked = !isLiked;

    const updatedLikes = { ...likedPostIds, [postId]: nextLiked };
    setLikedPostIds(updatedLikes);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("bow-liked-posts", JSON.stringify(updatedLikes));
      } catch {}
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      }
      return post;
    });

    updatePostsState(updatedPosts);
  };

  // Add Comment
  const handleAddComment = (postId: string, commentText: string) => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const authorName = currentUser?.name || "Community Supporter";
    const newComment: CommunityComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: authorName,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    });

    updatePostsState(updatedPosts);
  };

  // Handle Photo Select
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = typeof reader.result === "string" ? reader.result : "";
      if (rawDataUrl) {
        const compressed = await compressImage(rawDataUrl, 600);
        setNewImagePreview(compressed);
      }
      setCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Submit New Post
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCaption.trim()) {
      setCreateError("Please provide a story title and caption.");
      return;
    }

    const chosenImage = newImagePreview || SAMPLE_STREET_IMAGES[Math.floor(Math.random() * SAMPLE_STREET_IMAGES.length)];
    const authorName = currentUser?.name || "Community Rescuer";
    const authorRole = currentUser?.role || "Volunteer";
    const locationStr = newLocation.trim() || "Local Neighborhood";

    const createdPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName,
      authorRole,
      location: locationStr,
      createdAt: new Date().toISOString(),
      tag: newTag,
      title: newTitle.trim(),
      caption: newCaption.trim(),
      image: chosenImage,
      likes: 1,
      comments: [
        {
          id: `c-init-${Date.now()}`,
          author: "BOW Dispatcher",
          text: "Thank you for sharing this street soul update with the community! 🐾",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    const updatedPosts = [createdPost, ...posts];
    updatePostsState(updatedPosts);

    // Auto like own post
    const updatedLikes = { ...likedPostIds, [createdPost.id]: true };
    setLikedPostIds(updatedLikes);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("bow-liked-posts", JSON.stringify(updatedLikes));
      } catch {}
    }

    // Reset & Close Modal
    setNewTitle("");
    setNewCaption("");
    setNewLocation("");
    setNewImagePreview("");
    setCreateError("");
    setShowCreateModal(false);
  };

  const handleShare = (postId: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/community#${postId}`);
      setShareSuccessId(postId);
      setTimeout(() => setShareSuccessId(null), 2500);
    }
  };

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All Stories") return posts;
    return posts.filter((p) => p.tag === activeFilter || p.tag.toLowerCase().includes(activeFilter.toLowerCase()));
  }, [posts, activeFilter]);

  return (
    <main className="bg-bow-ivory min-h-screen pb-20">
      <PageIntro
        eyebrow="Instagram-Style Community Feed"
        title="Stories that turn compassion into action."
        body="Share rescued street dog photos, food drives, and recovery milestones. Like, comment, and connect with fellow volunteers across the community."
      />

      <section className="px-4 py-8 sm:px-8 max-w-4xl mx-auto space-y-8">
        {/* Top Control Bar: Share Story Button + Filter Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bow-paper p-4 sm:p-5 rounded-2xl border border-border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 grid place-items-center rounded-full bg-bow-forest text-primary-foreground font-bold text-sm shrink-0">
              {currentUser ? getInitials(currentUser.name) : "BW"}
            </div>
            <div>
              <p className="text-xs font-bold text-bow-forest">
                {currentUser ? currentUser.name : "Join the Community"}
              </p>
              <p className="text-[0.68rem] text-muted-foreground">
                {currentUser ? `${currentUser.role} · Active Supporter` : "Share your street dog rescue stories"}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-bow-forest text-primary-foreground hover:bg-bow-forest/90 font-bold text-xs rounded-xl px-5 h-11 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Share Rescue Story 📸</span>
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {["All Stories", "Rescue Story", "Food Support", "Recovery Update", "Adoption Story"].map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeFilter === tag
                  ? "bg-bow-forest text-primary-foreground border-bow-forest shadow-xs scale-105"
                  : "bg-bow-paper border-border text-foreground hover:bg-bow-sand"
              }`}
            >
              {tag === "All Stories" ? "✨ All Stories" : `#${tag}`}
            </button>
          ))}
        </div>

        {/* CREATE POST MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <BowCard className="w-full max-w-lg p-6 sm:p-8 relative space-y-5 bg-bow-paper max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span className="eyebrow text-bow-brown block">New Instagram Story Post</span>
                <h3 className="font-display text-3xl mt-1">Share a Street Soul Story</h3>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                {/* Photo Upload Area */}
                <div>
                  <label className="field-label">Dog Photo (Camera / Upload)</label>
                  {newImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border h-56 bg-black">
                      <img src={newImagePreview} alt="Upload preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImagePreview("")}
                        className="absolute right-2 top-2 bg-black/70 text-white rounded-full p-1.5 hover:bg-black cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="upload-tile cursor-pointer flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-bow-brown/30 bg-bow-sand/40 hover:border-bow-brown rounded-xl">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="sr-only"
                        />
                        <Camera className="h-8 w-8 text-bow-brown mb-2" />
                        <span className="text-xs font-semibold text-bow-forest">
                          {compressing ? "Compressing photo..." : "Take or Choose a Dog Photo 📷"}
                        </span>
                        <span className="text-[0.68rem] text-muted-foreground mt-0.5">
                          High quality compressed automatically for mobile
                        </span>
                      </label>

                      {/* Sample Street Dog Quick Selector */}
                      <div>
                        <span className="text-[0.65rem] uppercase font-bold text-muted-foreground block mb-2">
                          Or select a sample street dog photo:
                        </span>
                        <div className="grid grid-cols-6 gap-2">
                          {SAMPLE_STREET_IMAGES.map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNewImagePreview(imgUrl)}
                              className="h-12 w-full rounded-lg overflow-hidden border border-border hover:scale-105 transition-transform cursor-pointer"
                            >
                              <img src={imgUrl} alt={`Sample ${i}`} className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="field-label">Story Title</label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Bruno's Second Chance or Sunday Feeding Drive"
                    className="h-11 text-xs bg-background rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">Location</label>
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Besant Nagar, Chennai"
                      className="h-11 text-xs bg-background rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="field-label">Category Tag</label>
                    <select
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="h-11 w-full text-xs bg-background border border-input rounded-xl px-3 text-foreground"
                    >
                      <option value="Rescue Story">Rescue Story</option>
                      <option value="Food Support">Food Support</option>
                      <option value="Recovery Update">Recovery Update</option>
                      <option value="Adoption Story">Adoption Story</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label">Story Caption</label>
                  <Textarea
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Write a heartwarming story or update about this street dog..."
                    className="min-h-24 text-xs bg-background rounded-xl"
                    required
                  />
                </div>

                {createError && (
                  <p className="text-xs text-red-600 font-medium">{createError}</p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={compressing}
                    className="bg-bow-forest text-primary-foreground font-bold text-xs rounded-xl px-6"
                  >
                    Post Story 🐾
                  </Button>
                </div>
              </form>
            </BowCard>
          </div>
        )}

        {/* INSTAGRAM COMMUNITY FEED POSTS */}
        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <InstagramPostCard
              key={post.id}
              post={post}
              isLiked={Boolean(likedPostIds[post.id])}
              onToggleLike={() => handleToggleLike(post.id)}
              onAddComment={(text) => handleAddComment(post.id, text)}
              onShare={() => handleShare(post.id)}
              shareSuccess={shareSuccessId === post.id}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

// INSTAGRAM POST CARD COMPONENT
function InstagramPostCard({
  post,
  isLiked,
  onToggleLike,
  onAddComment,
  onShare,
  shareSuccess,
}: {
  post: CommunityPost;
  isLiked: boolean;
  onToggleLike: () => void;
  onAddComment: (text: string) => void;
  onShare: () => void;
  shareSuccess: boolean;
}) {
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleDoubleTap = () => {
    if (!isLiked) {
      onToggleLike();
    }
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 900);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput("");
    setShowComments(true);
  };

  return (
    <BowCard className="overflow-hidden p-0 border border-border/80 shadow-sm bg-bow-paper" id={post.id}>
      {/* POST HEADER */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="grid h-10 w-10 place-items-center rounded-full bg-bow-sand text-bow-brown font-bold text-xs border border-bow-brown/20 shrink-0 shadow-2xs">
            {getInitials(post.authorName)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-foreground">{post.authorName}</h4>
              <span className="text-[0.62rem] px-2 py-0.5 rounded-full bg-bow-forest/10 text-bow-forest font-semibold border border-bow-forest/20">
                {post.authorRole}
              </span>
            </div>
            <p className="text-[0.68rem] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-bow-brown shrink-0" />
              <span>{post.location}</span>
              <span>·</span>
              <span>{getTimeAgo(post.createdAt)}</span>
            </p>
          </div>
        </div>

        <span className="text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200">
          #{post.tag}
        </span>
      </div>

      {/* POST IMAGE (WITH DOUBLE-TAP HEART ANIMATION) */}
      <div className="relative aspect-[1.1] sm:aspect-[1.25] overflow-hidden bg-black group" onDoubleClick={handleDoubleTap}>
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800";
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Double-tap Heart Pulse Animation */}
        {heartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-300">
            <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-lg animate-pulse" />
          </div>
        )}
      </div>

      {/* ACTION BUTTONS ROW */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-4">
            {/* LIKE BUTTON */}
            <button
              type="button"
              onClick={onToggleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isLiked ? "text-red-600 scale-105" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-5 w-5 transition-transform ${isLiked ? "fill-red-600 text-red-600 scale-110" : ""}`} />
              <span>{post.likes} likes</span>
            </button>

            {/* COMMENT BUTTON */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-bow-brown" />
              <span>{post.comments.length} comments</span>
            </button>
          </div>

          {/* SHARE BUTTON */}
          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-bow-forest cursor-pointer transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>{shareSuccess ? "Copied! ✨" : "Share"}</span>
          </button>
        </div>

        {/* TITLE & CAPTION */}
        <div className="space-y-1.5">
          <h3 className="font-display text-2xl text-foreground">{post.title}</h3>
          <p className="text-xs leading-relaxed text-foreground/90 font-medium">
            <strong className="text-bow-forest font-bold mr-1">{post.authorName}:</strong>
            “{post.caption}”
          </p>
          <div className="text-[0.68rem] text-bow-forest font-semibold space-x-2 pt-0.5">
            <span>#BOWRescue</span>
            <span>#StreetDogs</span>
            <span>#{post.tag.replace(/\s+/g, "")}</span>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="border-t border-border/50 pt-3 space-y-3">
          {/* Toggle View Comments */}
          {post.comments.length > 0 && !showComments && (
            <button
              type="button"
              onClick={() => setShowComments(true)}
              className="text-xs font-semibold text-muted-foreground hover:text-bow-forest cursor-pointer"
            >
              View all {post.comments.length} comments...
            </button>
          )}

          {/* Expanded Comments List */}
          {showComments && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {post.comments.map((c) => (
                <div key={c.id} className="bg-bow-sand/50 p-2.5 rounded-xl border border-border/60 text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-bow-forest font-bold">
                    <span>{c.author}</span>
                    <span className="text-[0.65rem] text-muted-foreground font-normal">
                      {getTimeAgo(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground text-[0.75rem] leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Input Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center pt-1">
            <Input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={`Add a comment for ${post.authorName}...`}
              className="h-10 text-xs bg-background rounded-xl border-border flex-1"
            />
            <Button
              type="submit"
              disabled={!commentInput.trim()}
              size="sm"
              className="h-10 bg-bow-forest text-primary-foreground text-xs rounded-xl px-4 font-bold cursor-pointer shrink-0"
            >
              Post 💬
            </Button>
          </form>
        </div>
      </div>
    </BowCard>
  );
}
