import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary-foreground dark:text-white py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} BOUESTI Water. All rights reserved.
        </p>
        <p className="text-sm">
          Made with {"</>"} by{" "}
          <Link
            href="https://chrisdev-bay.vercel.app"
            target="_blank"
            className="underline underline-offset-4"
          >
            chris.dev
          </Link>
        </p>
      </div>
    </footer>
  );
}
