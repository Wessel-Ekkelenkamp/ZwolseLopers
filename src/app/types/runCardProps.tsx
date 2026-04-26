import { Run } from "./run";
import { Post } from "./post";

export type RunCardProps = {
  post: Post
  run: Run;
  hideComments?: boolean;
  clickable?: boolean;
};