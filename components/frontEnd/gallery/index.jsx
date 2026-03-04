"use client";
import React, { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const posts = [
  {
    id: 1,
    caption: "Chenanda moments: where every click tells a story 📸",
  },
  {
    id: 2,
    caption: "Capturing the essence of life, one frame at a time 🌟",
  },
  {
    id: 3,
    caption: "Behind the lens: a glimpse into the world of chenanda 📷✨",
  },
  {
    id: 4,
    caption: "Exploring the beauty of everyday moments through my lens 🌍",
  },
  {
    id: 5,
    caption: "Finding magic in the mundane: chenanda's visual storytelling ✨",
  },
];

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function GalleryComponent() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">

        {/* Profile — stacks vertically on mobile, horizontal on sm+ */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 animate-fadeIn">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-1 transition-transform duration-300 hover:scale-105">
            <div className="w-full h-full rounded-full bg-white p-1 relative">
              <Image
                src="/logo.png"
                alt="Profile"
                fill
                style={{ objectFit: "contain" }}
                className="p-2"
              />
            </div>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4">
              CHENANDA
            </h2>
            <div className="flex flex-col items-center sm:items-start gap-1 sm:gap-2">
              <div className="text-sm sm:text-base">
                <span className="font-semibold">{posts.length}</span> posts
              </div>
              <p className="text-gray-700 text-sm sm:text-base">
                Capturing moments, creating memories ✨
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mb-4 sm:mb-6" />

        {/* Gallery Grid — 2 cols on mobile, 3 on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="gallery-item aspect-square cursor-pointer relative overflow-hidden bg-gray-200"
              onClick={() => setSelectedPost(post)}
            >
              <Image
                src={`/about/img${index + 1}.jpg`}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                style={{ objectFit: "cover" }}
              />
              {/* Overlay — hidden on touch, shown on hover for pointer devices */}
              <div className="gallery-overlay absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 flex items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white font-semibold translate-y-2 transition-transform duration-300 gallery-stat">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  <span className="text-sm sm:text-base">{post.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-white font-semibold translate-y-2 transition-transform duration-300 gallery-stat">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                  <span className="text-sm sm:text-base">{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/90 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              /* 
                Mobile: sheet from bottom, full width, capped height
                sm+: centered card, side-by-side layout
              */
              className="
                w-full sm:max-w-4xl md:max-w-6xl
                bg-white
                rounded-t-2xl sm:rounded-lg
                overflow-hidden
                flex flex-col sm:flex-row
                max-h-[92vh] sm:max-h-[90vh]
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image panel */}
              <div className="
                w-full sm:w-3/5 md:w-2/3
                bg-black
                flex items-center justify-center
                relative
                h-56 xs:h-72 sm:h-auto sm:min-h-[480px] md:min-h-[600px]
                flex-shrink-0
              ">
                <Image
                  src={`/about/img${selectedPost.id}.jpg`}
                  alt={selectedPost.caption}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 640px) 100vw, 60vw"
                  priority
                />
              </div>

              {/* Details panel */}
              <div className="flex flex-col flex-1 min-h-0">
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      CN
                    </div>
                    <span className="font-semibold text-sm sm:text-base">chenanda</span>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-1.5 sm:p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 touch-manipulation"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Caption — scrollable */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
                  <div className="flex gap-2 sm:gap-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs">
                      ABC
                    </div>
                    <div className="text-sm sm:text-base">
                      <span className="font-semibold mr-2">abc</span>
                      <span className="text-gray-700">{selectedPost.caption}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 p-3 sm:p-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => toggleLike(selectedPost.id)}
                        className="hover:opacity-60 transition-opacity duration-200 active:scale-90 touch-manipulation p-1"
                        aria-label="Like"
                      >
                        <Heart
                          className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-200 ${
                            likedPosts.has(selectedPost.id)
                              ? "fill-red-500 text-red-500"
                              : ""
                          }`}
                        />
                      </button>
                      <button
                        className="hover:opacity-60 transition-opacity duration-200 touch-manipulation p-1"
                        aria-label="Comment"
                      >
                        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                      </button>
                      <button
                        className="hover:opacity-60 transition-opacity duration-200 touch-manipulation p-1"
                        aria-label="Share"
                      >
                        <Send className="w-6 h-6 sm:w-7 sm:h-7" />
                      </button>
                    </div>
                    <button
                      className="hover:opacity-60 transition-opacity duration-200 touch-manipulation p-1"
                      aria-label="Save"
                    >
                      <Bookmark className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">2 DAYS AGO</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out both;
        }

        .gallery-item {
          transform: translateZ(0);
          transition: transform 0.25s ease;
          will-change: transform;
        }

        /* Scale only on pointer devices (not touch) */
        @media (hover: hover) and (pointer: fine) {
          .gallery-item:hover {
            transform: scale(1.04) translateZ(0);
            z-index: 10;
          }
          .gallery-item:hover .gallery-overlay {
            opacity: 1;
          }
          .gallery-item:hover .gallery-stat {
            transform: translateY(0);
          }
        }

        /* Safe tap highlight removal on mobile */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}