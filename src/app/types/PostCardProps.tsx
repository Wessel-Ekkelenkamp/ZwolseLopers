import { Post } from "./post";

export type PostCardProps = {
  post: Post;
  hideComments?: boolean;
  clickable?: boolean;
};