export interface TscribeOptions {
  src: string;
  out?: string;
  zip?: string;
  ext: string;
  ignore: string;
  heading?: string;
  format: "md" | "plain";
  sort: "alpha" | "path" | "mtime";
  list?: boolean;
  watch?: boolean;
  transform?: string;
  quiet?: boolean;
  verbose?: boolean;
}
