import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import databaseService from "../lib/databaseService";
import { ID } from "appwrite";
import { Send, ImagePlus, ArrowLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import appwriteConfig from '../lib/appwriteConfig'
import "tinymce/tinymce";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/models/dom";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 36) || ID.unique();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      let imageId = "";
      if (featuredImage) {
        const uploaded = await databaseService.uploadFile(featuredImage);
        if (uploaded) imageId = uploaded.$id;
      }

      const slug = ID.unique();
      await databaseService.createPost({
        title,
        slug,
        content,
        featuredImage: imageId,
        status: "active"
      });

      toast.success("Story published! 📝");
      navigate(`/post/${slug}`);
    } catch (error) {
      toast.error(error?.message || "Failed to publish story");
    } finally {
      setLoading(false);
    }
  };

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

          <h1 className="font-display text-3xl font-bold text-foreground mb-8">Write a Story</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-0 border-b-2 border-border bg-transparent pb-3 font-display text-2xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                placeholder="Your story title..."
                required
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-primary/5">
                <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-medium text-foreground">Featured Image</p>
                  <p className="text-xs text-muted-foreground">Click to upload a cover image</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={imagePreview}
                  alt="Preview"
                  className="mt-3 max-h-48 rounded-xl object-cover"
                />
              )}
            </div>

            {/* TinyMCE Editor */}
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
                  <Send className="h-4 w-4" />
                )}
                {loading ? "Publishing..." : "Publish Story"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePost;
