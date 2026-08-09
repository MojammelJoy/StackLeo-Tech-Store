import Link from "next/link";

/**
 * Text-treatment wordmark — no logo image asset exists in the repository
 * yet, and this avoids introducing one for a foundation-level header.
 */
export function Logo() {
  return (
    <Link
      href="/"
      className="text-xl font-bold tracking-tight text-neutral-900"
      aria-label="StackLeo home"
    >
      Stack<span className="text-primary-600">Leo</span>
    </Link>
  );
}
