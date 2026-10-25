import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page py-24">
      <p className="tag">404</p>
      <h1 className="mt-4 text-4xl">This page doesn&apos;t exist</h1>
      <p className="mt-4 text-ink-soft">It may have moved. The codes page is usually what people are after.</p>
      <Link href="/codes/" className="btn-ember mt-8">
        Go to codes
      </Link>
    </section>
  );
}
