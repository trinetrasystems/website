import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { blogPosts } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const postUrl = `https://www.trinetrasystems.com/blog/${post.slug}`;
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    url: postUrl,
    image: "https://www.trinetrasystems.com/og-image.png",
    author: { "@type": "Organization", name: post.author, url: "https://www.trinetrasystems.com" },
    publisher: {
      "@type": "Organization",
      name: "Trinetra Systems",
      logo: { "@type": "ImageObject", url: "https://www.trinetrasystems.com/trinetra-icon.svg" },
    },
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${post.title} | Trinetra Systems Blog`}
        description={post.metaDescription}
        keywords={post.keywords}
        canonicalPath={`/blog/${post.slug}`}
        jsonLd={blogPostingSchema}
      />
      <AppSidebar />
      <main className="pt-16 lg:pt-20">
        <article className="py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-8 border-b border-border/30">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                  prose-li:text-muted-foreground
                  prose-strong:text-foreground
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-ul:my-4 prose-ul:space-y-2"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 glass rounded-2xl p-8 md:p-10 text-center border-primary/10"
            >
              <h3 className="text-2xl font-bold mb-3">
                Ready to upgrade your surveillance?
              </h3>
              <p className="text-muted-foreground mb-6">
                Get a free demo of Trinetra Systems' AI-powered solutions.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-primary/30 transition-all"
              >
                Book Free Demo
              </Link>
            </motion.div>
          </div>
        </article>
        <Footer />
      </main>
    </div>
  );
};

export default BlogPost;
