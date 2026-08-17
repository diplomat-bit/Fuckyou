import React from 'react';

interface ScopeMetadata {
  description: string;
  color: string;
}

const SCOPE_DEFINITIONS: Record<string, ScopeMetadata> = {
  'openid': { description: 'Authenticates your identity.', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'profile': { description: 'Access to your basic profile information.', color: 'bg-green-100 text-green-800 border-green-200' },
  'email': { description: 'Access to your email address.', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'offline_access': { description: 'Allows the application to access data when you are offline.', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'read': { description: 'Read-only access to your resources.', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  'write': { description: 'Permission to create or modify resources.', color: 'bg-red-100 text-red-800 border-red-200' },
};

interface OauthScopeBadgeListProps {
  scopeString: string;
  className?: string;
}

export const OauthScopeBadgeList: React.FC<OauthScopeBadgeListProps> = ({ scopeString, className = '' }) => {
  const scopes = scopeString ? scopeString.split(' ') : [];

  if (scopes.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {scopes.map((scope) => {
        const meta = SCOPE_DEFINITIONS[scope] || { 
          description: 'Custom or unknown scope.', 
          color: 'bg-gray-100 text-gray-600 border-gray-300' 
        };

        return (
          <div
            key={scope}
            className={`group relative px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color} cursor-help transition-all hover:shadow-sm`}
            title={meta.description}
          >
            {scope}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg z-10 pointer-events-none">
              {meta.description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
            </div>
          </div>
        );
      })}
    </div>
  );
};