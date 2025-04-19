// components/HomeCarousel.tsx
"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Slide } from "@/lib/types";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HomeCarouselProps {
  slides: Slide[];
}

export default function HomeCarousel({ slides }: HomeCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  if (slides.length === 0) {
    return (
      <div className="container mx-auto py-3 px-3 text-center">
        <p>Không có slide nào để hiển thị.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <Link
                href={slide.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative !w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[600px] overflow-hidden block"
              >
                <Image
                  src={slide.image.url}
                  alt={slide.title || `Slide ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className=""
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 shadow-md rounded-full p-1 sm:p-2" />
        <CarouselNext className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 shadow-md rounded-full p-1 sm:p-2" />
      </Carousel>
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: count }).map((_, index) => (
          <Button

            key={index}
            className={`h-3 rounded-full transition-colors duration-200 ${
              current === index + 1 ? "bg-red-600" : "bg-gray-300"
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
