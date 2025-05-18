export interface TscribeOptions {
  src: string;
  out?: string; // ← add this back
  zip?: string;
  ext: string;
  ignore?: string;
  heading?: string;
  format: "md" | "plain";
  sort: "alpha" | "path" | "mtime";
  list?: boolean;
  watch?: boolean;
  quiet?: boolean;
  verbose?: boolean;
}
