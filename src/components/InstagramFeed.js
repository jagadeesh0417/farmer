"use client";

import { FiInstagram } from "react-icons/fi";

const posts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&q=80",
    likes: "2.4k",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&q=80",
    likes: "1.8k",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&q=80",
    likes: "3.1k",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&q=80",
    likes: "2.9k",
  },
];

export default function InstagramFeed() {
  return (
    <section className="w-full">
      <div className="text-center mb-8">
        <FiInstagram className="text-2xl text-primary mx-auto mb-3" />
        <h2 className="text-2xl font-display text-foreground sm:text-3xl">
          Follow Us on Instagram
        </h2>
        <p className="mt-2 text-text-muted text-sm">
          Tag <span className="text-primary font-medium">@arhuuoutfits</span> to get
          featured
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {posts.map((post) => (
          <a
            key={post.id}
            href="https://instagram.com/arhuuoutfits"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-lg overflow-hidden bg-surface-light"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url('${post.image}')` }}
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 text-white">
                <FiInstagram className="text-xl" />
                <span className="text-sm font-medium">{post.likes}</span>
              </div>
            </div>

            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/0 group-hover:ring-primary/50 transition-all duration-300" />
          </a>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="https://instagram.com/arhuuoutfits"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
        >
          <FiInstagram className="text-lg" />
          Follow @arhuuoutfits
        </a>
      </div>
    </section>
  );
}
