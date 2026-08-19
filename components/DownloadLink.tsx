
import React from 'react';

interface DownloadLinkProps {
  url: string;
  filename: string;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({ url, filename }) => {
  return (
    <a 
      href={url} 
      download={filename}
      className="text-blue-500 hover:text-blue-600 underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download {filename}
    </a>
  );
};


// --- CONSOLIDATED FROM: DownloadLink_1.tsx ---


import React from 'react';

interface DownloadLinkProps {
  url: string;
  filename: string;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({ url, filename }) => {
  return (
    <a 
      href={url} 
      download={filename}
      className="text-blue-500 hover:text-blue-600 underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download {filename}
    </a>
  );
};


// --- CONSOLIDATED FROM: DownloadLink (1).tsx ---

import React from 'react';

interface DownloadLinkProps {
  url: string;
  filename: string;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({ url, filename }) => {
  return (
    <a 
      href={url} 
      download={filename}
      className="text-blue-500 hover:text-blue-600 underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      {filename}
    </a>
  );
};

// --- CONSOLIDATED FROM: DownloadLink (1)_1.tsx ---

import React from 'react';

interface DownloadLinkProps {
  url: string;
  filename: string;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({ url, filename }) => {
  return (
    <a 
      href={url} 
      download={filename}
      className="text-blue-500 hover:text-blue-600 underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      {filename}
    </a>
  );
};

// --- CONSOLIDATED FROM: DownloadLink (2).tsx ---

import React from 'react';

interface DownloadLinkProps {
  url: string;
  filename: string;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({ url, filename }) => {
  return (
    <a 
      href={url} 
      download={filename}
      className="text-blue-500 hover:text-blue-600 underline text-sm"
      target="_blank"
      rel="noopener noreferrer"
    >
      Download {filename}
    </a>
  );
};