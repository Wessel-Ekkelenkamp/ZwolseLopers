
export type Post = {
  id: string;
  type: "post" | "run";
  title: string;
  content: string | null;
  created_at: string;
  run?: Run | null;
  images?: { image_url: string }[];
};