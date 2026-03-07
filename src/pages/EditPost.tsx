import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import databaseService from "../lib/databaseService";
import { Save, ArrowLeft, ImagePlus } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import "tinymce/tinymce";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/models/dom";

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

        // Check permissions instead of userId field
        const permissions: string[] = post.$permissions || [];
        const canEdit = permissions.includes(`update("user:${user?.$id}")`);

        if (!canEdit) {
          toast.error("You can only edit your own posts");
          navigate("/");
          return;
        }

        setTitle(post.Title);
        setContent(post.Content);
        setFeaturedImage(post.featuredimage || "");

        // Show existing image as preview
        if (post.featuredimage) {
          setImagePreview(databaseService.getFileView(post.featuredimage));
        }
      } catch {
        toast.error("Failed to load post");
        navigate("/");
      } finally {
        setFetching(false);
      }
    };
    fetchPost();
  }, [id, user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      let imageId = featuredImage; // keep existing image by default

      // If user selected a new image, upload it and delete the old one
      if (newImage) {
        const uploaded = await databaseService.uploadFile(newImage);
        if (uploaded) {
          if (featuredImage) await databaseService.deleteFile(featuredImage);
          imageId = uploaded.$id;
        }
      }

      await databaseService.updatePost(id, {
        title,
        content,
        featuredImage: imageId,
        status: "active",
        userId: user.$id,
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

            {/* Image upload */}
            <div>
              <label className="group flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-primary/5">
                <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {imagePreview ? "Change Featured Image" : "Featured Image"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {imagePreview ? "Click to replace current image" : "Click to upload a cover image"}
                  </p>
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