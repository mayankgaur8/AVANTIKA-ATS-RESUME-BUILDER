import type { TemplateId } from "../types";
import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";

export const templates: Record<TemplateId, { name: string; Component: any }> = {
  classic: { name: "Classic (ATS Clean)", Component: ClassicTemplate },
  modern: { name: "Modern (2-Column ATS)", Component: ModernTemplate }
};
