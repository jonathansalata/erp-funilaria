export type Attachment = {
  id: string;
  name: string;
  sizeLabel: string;
  type: "image" | "pdf" | "doc" | "other";
  tag?: "antes" | "depois" | "geral";
  url?: string;
  uploadedAt: string;
  uploadedBy?: string;
};
