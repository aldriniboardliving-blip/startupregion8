import type { Metadata } from "next";
import CarouselForm from "@/components/admin/CarouselForm";

export const metadata: Metadata = { title: "Add Carousel Item" };

export default function NewCarouselPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <CarouselForm />
    </div>
  );
}
