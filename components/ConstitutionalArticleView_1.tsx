// components/views/platform/ConstitutionalArticleView.tsx
import React from 'react';
import Card from '../../Card';
import { CONSTITUTIONAL_ARTICLES } from '../../../data';
import { View } from '../../../types';

interface ConstitutionalArticleViewProps {
  articleNumber: number;
}

const ConstitutionalArticleView: React.FC<ConstitutionalArticleViewProps> = ({ articleNumber }) => {
  const article = CONSTITUTIONAL_ARTICLES.find(a => a.id === articleNumber);

  if (!article) {
    return <Card title="Error">Article not found.</Card>;
  }

  return (
    <div className="space-y-6 font-serif animate-fade-in">
      <h2 className="text-3xl font-bold text-white tracking-wider">
        Article {article.romanNumeral} — {article.title}
      </h2>
      <Card>
        <div className="prose prose-invert max-w-none text-gray-300">
          {article.content}
        </div>
      </Card>
      <style>{`
        .prose strong { color: #81e6d9; }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConstitutionalArticleView;