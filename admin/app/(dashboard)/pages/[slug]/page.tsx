import { PageEditor } from "./page-editor";

export default async function PageEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PageEditor slug={slug} />;
}
