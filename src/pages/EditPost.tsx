import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import databaseService from "../lib/databaseService";
import { Save, ArrowLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import appwriteConfig from "../lib/appwriteConfig";
import "tinymce/tinymce";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/models/dom";

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const post = await databaseService.getPost(id);
        if (!post) {
          toast.error("Post not found");
          navigate("/");
          return;
        }
        if (post.userId !== user?.$id) {
          toast.error("You can only edit your own posts");
          navigate("/");
          return;
        }
        setTitle(post.Title);
        setContent(post.Content);
      } catch {
        toast.error("Failed to load post");
        navigate("/");
      } finally {
        setFetching(false);
      }
    };
    fetchPost();
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      await databaseService.updatePost(id, {
        title,
        content,
        featuredImage: "",
        status: "active",
      });
      toast.success("Story updated! ✏️");
      navigate(`/post/${id}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update story");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Edit Story</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-0 border-b-2 border-border bg-transparent pb-3 font-display text-2xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
              placeholder="Your story title..."
              required
            />

            <div className="rounded-xl border border-border overflow-hidden">
              <Editor
                licenseKey="gpl"
                onInit={(_evt, editor) => (editorRef.current = editor)}
                value={content}
                onEditorChange={(newContent) => setContent(newContent)}
                init={{
                  height: 450,
                  menubar: true,
                  skin: theme === "dark" ? "oxide-dark" : "oxide",
                  content_css: theme === "dark" ? "dark" : "default",
                  plugins: [
                    "advlist", "autolink", "lists", "link", "image",
                    "charmap", "preview", "anchor", "searchreplace",
                    "visualblocks", "code", "fullscreen", "insertdatetime",
                    "media", "table", "code", "help", "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                  content_style:
                    "body { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.7; }",
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditPost;
