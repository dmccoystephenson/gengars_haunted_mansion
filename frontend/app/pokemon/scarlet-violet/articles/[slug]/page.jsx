"use client";

import dynamic from "next/dynamic";
import ArticleContainer from "@/components/articles/ArticleContainer";

export default function ArticlePage({ params }) {
  const Content = dynamic(() =>
    import(`@/articles/pokemon/scarlet-violet/${params.slug}.mdx`)
  );

  return (
    <ArticleContainer>
      <Content />
    </ArticleContainer>
  );
}
