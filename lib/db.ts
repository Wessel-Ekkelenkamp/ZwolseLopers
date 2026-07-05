export const DB = {
  TABLES: {
    PROFILES: process.env.NEXT_PUBLIC_TABLE_PROFILES!,
    POSTS: process.env.NEXT_PUBLIC_TABLE_POSTS!,
    EVENTS: process.env.NEXT_PUBLIC_TABLE_EVENTS!,
    POST_IMAGES: process.env.NEXT_PUBLIC_TABLE_POST_IMAGES!,
  },
  BUCKETS: {
    IMAGES: process.env.NEXT_PUBLIC_BUCKET_IMAGES!,
    AVATARS: process.env.NEXT_PUBLIC_BUCKET_AVATARS!,
  },
  ROLES: {
    ADMIN: process.env.NEXT_PUBLIC_ADMIN_ROLE!,
    DEFAULT: process.env.NEXT_PUBLIC_DEFAULT_ROLE!,
  },
} as const;
