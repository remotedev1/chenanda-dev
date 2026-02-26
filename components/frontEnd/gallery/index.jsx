"use client";
import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const GalleryComponent = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Sample portfolio data
  const posts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=800&fit=crop",
      caption: "Minimalist architecture meets modern design 🏛️",
      likes: 1234,
      comments: 89,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=800&h=800&fit=crop",
      caption: "Golden hour captures never disappoint ✨",
      likes: 2156,
      comments: 143,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=800&h=800&fit=crop",
      caption: "Abstract art in everyday spaces 🎨",
      likes: 892,
      comments: 56,
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop",
      caption: "Urban exploration series pt. 4 🌆",
      likes: 3421,
      comments: 201,
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1618556450913-7fb629735538?w=800&h=800&fit=crop",
      caption: "Textures and patterns that inspire 🔲",
      likes: 1567,
      comments: 94,
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1618556450783-9b08d76d9c1e?w=800&h=800&fit=crop",
      caption: "Nature meets geometry in perfect harmony 🌿",
      likes: 2890,
      comments: 167,
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=800&fit=crop",
      caption: "Exploring color gradients in the wild 🌈",
      likes: 1945,
      comments: 112,
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=800&fit=crop",
      caption: "Street photography chronicles 📸",
      likes: 2234,
      comments: 145,
    },
    {
      id: 9,
      image:
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=800&fit=crop",
      caption: "Details that make the difference ⚡",
      likes: 1678,
      comments: 98,
    },
  ];

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const newLikes = new Set(prev);
      if (newLikes.has(postId)) {
        newLikes.delete(postId);
      } else {
        newLikes.add(postId);
      }
      return newLikes;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-8 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-1"
          >
            <div className="w-full h-full rounded-full bg-white p-1 relative">
              <Image
                src="/logo.png"
                alt="Profile Picture"
                layout="fill"
                objectFit="contain"
                className="p-2"
              />
            </div>
          </motion.div>
          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold mb-4"
            >
              CHENANDA
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-8 mb-4"
            >
              <div>
                <span className="font-semibold">{posts.length}</span> posts
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-700"
            >
              Creative Director & Photographer 📷
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-700"
            >
              Capturing moments, creating memories ✨
            </motion.p>
          </div>
        </motion.div>

        <div className="border-t border-gray-200 mb-6"></div>

        {/* Gallery Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-1 md:gap-4"
        >
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              className="aspect-square cursor-pointer group relative overflow-hidden bg-gray-200"
              onClick={() => setSelectedPost(post)}
            >
              <Image
                src={`/about/img${index + 1}.jpg`}
                alt={post.caption}
                layout="fill"
                objectFit="cover"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-6"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 text-white font-semibold"
                >
                  <Heart className="w-6 h-6 fill-white" />
                  <span>{post.likes}</span>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-2 text-white font-semibold"
                >
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{post.comments}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-6xl w-full bg-white rounded-lg overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="md:w-2/3 bg-black flex items-center justify-center relative min-h-[400px] md:min-h-[600px]"
              >
                <Image
                  src={`/about/img${selectedPost.id}.jpg`}
                  alt={selectedPost.caption}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </motion.div>

              {/* Details Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="md:w-1/3 flex flex-col"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold">
                      CN
                    </div>
                    <span className="font-semibold">chenanda</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedPost(null)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Caption */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 overflow-y-auto p-4"
                >
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      ABC
                    </div>
                    <div>
                      <span className="font-semibold mr-2">abc</span>
                      <span className="text-gray-700">
                        {selectedPost.caption}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border-t border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => toggleLike(selectedPost.id)}
                        className="hover:opacity-60 transition"
                      >
                        <motion.div
                          animate={
                            likedPosts.has(selectedPost.id)
                              ? {
                                  scale: [1, 1.3, 1],
                                  rotate: [0, -15, 15, 0],
                                }
                              : {}
                          }
                          transition={{ duration: 0.4 }}
                        >
                          <Heart
                            className={`w-7 h-7 ${
                              likedPosts.has(selectedPost.id)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                        </motion.div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        className="hover:opacity-60 transition"
                      >
                        <MessageCircle className="w-7 h-7" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 25 }}
                        whileTap={{ scale: 0.8 }}
                        className="hover:opacity-60 transition"
                      >
                        <Send className="w-7 h-7" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                      className="hover:opacity-60 transition"
                    >
                      <Bookmark className="w-7 h-7" />
                    </motion.button>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-500 text-sm"
                  >
                    2 DAYS AGO
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryComponent;
