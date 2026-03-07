import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogCard from "../components/BlogCard";
import BlogSkeleton from "../components/BlogSkeleton";
import databaseService from "../lib/databaseService";
import { BookOpen } from "lucide-react";
import heroPattern from "../assets/hero-pattern.jpg";

const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await databaseService.getPosts();
        if (result) {
          setPosts(result.documents);
        }
      } catch (error) {
        console.log("Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 opacity-10">
          <img src={heroPattern} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-background/60 to-background" />
        <div className="container mx-auto px-4 py-16 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Reddit<span className="text-primary">Tales</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              The best stories from Reddit — curated, narrated, and beautifully presented. 
              Read or listen to captivating tales from across the internet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 py-12">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-display text-2xl font-bold text-foreground mb-8"
        >
          Latest Stories
        </motion.h2>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogSkeleton key={i} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <BlogCard
                key={post.$id}
                id={post.$id}
                title={post.Title}
                content={post.Content}
                featuredImage={post.featuredImage ? String(databaseService.getFilePreview(post.featuredImage)) : undefined}
                userId={post.userId}
                createdAt={post.$createdAt}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl text-muted-foreground">No stories yet</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">Be the first to share a tale!</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;
