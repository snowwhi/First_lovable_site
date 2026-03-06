import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import parse from "html-react-parser";
import databaseService from "../lib/databaseService";
import { PostDetailSkeleton } from "../components/BlogSkeleton";
import TextToSpeech from "../components/TextToSpeech";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { toast } from "react-toastify";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const result = await databaseService.getPost(id);
        setPost(result);
        console.log("post data:", result)
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
    ? String(databaseService.getFilePreview(post.featuredimage))
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