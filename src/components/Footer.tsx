import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-gray-700/70 font-bold text-center py-4 text-sm ">
      <p>
        Made by{" "}
        <Link
          href="https://github.com/timooo-thy/"
          className="underline-offset-2 underline"
          prefetch={true}
        >
          Timothy Lee
        </Link>
      </p>
      <p>Copyright © {year}</p>
    </footer>
  );
}
