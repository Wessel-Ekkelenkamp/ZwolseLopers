import { Event } from "./event";

export type Post = {
  id: string;
  type: "post" | "event";
  title: string;
  content: string | null;
  created_at: string;
  is_pinned?: boolean;
  event?: Event | null;
  images?: { image_url: string }[];
};
