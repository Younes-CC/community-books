import Image from "next/image";
import { bookImageUrl } from "@/lib/images";
import { cn } from "@/lib/cn";

export function BookCover({
  imagePath,
  title,
  sizes,
  priority,
  className,
}: {
  imagePath: string | null;
  title: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const url = bookImageUrl(imagePath);

  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-[2px] border border-line bg-paper-alt",
        className,
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={title}
          fill
          sizes={sizes ?? "(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-serif text-5xl text-ink-faint/50" aria-hidden="true">
            {title.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}
