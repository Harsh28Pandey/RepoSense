import { useEffect } from 'react';

export function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | RepoSense` : 'RepoSense - AI GitHub Assistant';
    
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }
  }, [title, description]);
}
