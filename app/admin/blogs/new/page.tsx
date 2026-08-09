import type { Metadata } from "next";
import BlogForm from "@/components/admin/BlogForm";

export const metadata: Metadata = { title: "Add Blog" };

export default function NewBlogPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <BlogForm />
    </div>
  );
}
