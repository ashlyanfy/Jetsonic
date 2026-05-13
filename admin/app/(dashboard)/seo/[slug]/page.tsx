import { SeoEditor } from "./seo-editor";

export default async function SeoEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SeoEditor slug={slug} />;
}
