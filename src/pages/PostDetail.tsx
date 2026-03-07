import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import parse from "html-react-parser";
import databaseService from "../lib/databaseService";
import { PostDetailSkeleton } from "../components/BlogSkeleton";
import TextToSpeech from "../components/TextToSpeech";
import { ArrowLeft, Clock, Share2, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const isOwner =
    !!user &&
    !!post &&
    Array.isArray(post.$permissions) &&
    post.$permissions.some(
      (permission: string) => permission === `update("user:${user.$id}")`
    );

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const result = await databaseService.getPost(id);
        setPost(result);
      } catch {
        toast.error("Failed to load story");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const getPlainText = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! 🔗");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    setDeleting(true);
    try {
      await databaseService.deletePost(post.$id);
      if (post.featuredimage) await databaseService.deleteFile(post.featuredimage);
      toast.success("Story deleted!");
      navigate("/");
    } catch {
      toast.error("Failed to delete story");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PostDetailSkeleton />;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Story Not Found</h1>
          <p className="text-muted-foreground mb-6">This story may have been removed or doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = post.featuredimage
    ? String(databaseService.getFileView(post.featuredimage))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight"
          >
            {post.Title}
          </motion.h1>

          {/* Meta + Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-between gap-3 mb-8"
          >
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {post.$createdAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(post.$createdAt).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <TextToSpeech text={getPlainText(post.Content)} contentRef={contentRef} />
              <button
                onClick={handleShare}
                className="rounded-full bg-secondary p-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {isOwner && (
                <>
                  <Link
                    to={`/edit/${post.$id}`}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 color-white rounded-full bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Featured Image */}
          {imageUrl && (
            <motion.img
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              src={imageUrl}
              alt={post.Title}
              className="w-full rounded-xl mb-8 object-cover max-h-[400px]"
            />
          )}

          {/* Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="blog-content text-foreground"
          >
            {parse(post.Content || "")}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;