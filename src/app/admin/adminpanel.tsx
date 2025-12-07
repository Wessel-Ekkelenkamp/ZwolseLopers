"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "../components/Header";

type PostType = "regular" | "run";
type Platform = "strava" | "instagram" | "facebook";

export default function AdminPanel() {
  const [postType, setPostType] = useState<PostType>("regular");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["strava"]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username: string } | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [speed, setSpeed] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setCurrentUser({ 
        id: user.id,
        email: user.email!, 
        username: profile?.username || '' 
      });
    }
    setLoadingUser(false);
  };

  loadCurrentUser();
}, []);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!title.trim()) {
      setError("Title is required!");
      return;
    }

    if (postType === "regular" && !content.trim()) {
      setError("Content is required for regular posts!");
      return;
    }

    if (postType === "run") {
      if (!date || !time || !distance || !startLocation || !speed) {
        setError("All run fields are required!");
        return;
      }
    }

    if (!currentUser) {
      setError("You must be logged in!");
      return;
    }

    setLoading(true);

    try {
      if (postType === "run") {
        // Create run post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            type: 'run',
            title: title,
            content: content || null,
            author_id: currentUser.id,
          })
          .select()
          .single();

        if (postError) throw postError;

        // Create run details
        const { error: runError } = await supabase
          .from('runs')
          .insert({
            id: post.id,
            run_date: date,
            run_time: time,
            distance: parseFloat(distance),
            start_location: startLocation,
            average_speed: speed,
            max_participants: maxParticipants ? parseInt(maxParticipants) : null,
            image_urls: images,
          });

        if (runError) throw runError;

        // Add images if any
        if (images.length > 0) {
          const imageInserts = images.map((url, index) => ({
            post_id: post.id,
            image_url: url,
            display_order: index,
          }));

          const { error: imageError } = await supabase
            .from('post_images')
            .insert(imageInserts);

          if (imageError) console.error("Image insert error:", imageError);
        }

        setSuccess("Run created successfully!");
      } else {
        // Create regular post
        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            type: 'post',
            title: title,
            content: content,
            author_id: currentUser.id,
          })
          .select()
          .single();

        if (postError) throw postError;

        // Add images if any
        if (images.length > 0) {
          const imageInserts = images.map((url, index) => ({
            post_id: post.id,
            image_url: url,
            display_order: index,
          }));

          const { error: imageError } = await supabase
            .from('post_images')
            .insert(imageInserts);

          if (imageError) console.error("Image insert error:", imageError);
        }

        setSuccess("Post created successfully!");
      }

      // Reset form
      resetForm();

      // TODO: Integrate with Strava/Instagram/Facebook APIs based on selectedPlatforms

    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDate("");
    setTime("");
    setDistance("");
    setStartLocation("");
    setSpeed("");
    setMaxParticipants("");
    setImages([]);
    setImageInput("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Create posts for Zwolse Lopers</p>
            </div>
            {currentUser && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-gray-800">{currentUser.username}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:underline mt-1"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* Post Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Post Type
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setPostType("regular")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    postType === "regular"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Regular Post
                </button>
                <button
                  onClick={() => setPostType("run")}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    postType === "run"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Run Post
                </button>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Share to Platforms (Coming Soon)
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => togglePlatform("strava")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedPlatforms.includes("strava")
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  Strava
                </button>
                <button
                  disabled
                  className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Instagram
                </button>
                <button
                  disabled
                  className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  Facebook
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter post title..."
              />
            </div>

            {/* Conditional Fields */}
            {postType === "regular" ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Write your post content..."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Distance (km) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="10.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Speed *
                    </label>
                    <input
                      type="text"
                      value={speed}
                      onChange={(e) => setSpeed(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="5:30 min/km"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Location *
                    </label>
                    <input
                      type="text"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Zwolle Centrum"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Participants (Optional)
                    </label>
                    <input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Add additional details about the run..."
                  />
                </div>
              </>
            )}

            {/* Images Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Images (External URLs)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Paste image URLs from Imgur, Cloudinary, or any image hosting service
              </p>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addImage()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://i.imgur.com/example.jpg"
                />
                <button
                  onClick={addImage}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Add
                </button>
              </div>
              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((img, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <span className="flex-1 text-sm text-gray-600 truncate">{img}</span>
                      <button
                        onClick={() => removeImage(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold shadow-md transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {loading ? "Creating..." : "Create Post"}
              </button>
              <button
                onClick={resetForm}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}