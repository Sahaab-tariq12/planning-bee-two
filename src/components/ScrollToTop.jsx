import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log('ScrollToTop: Route changed to', pathname);
    
    // Scroll window to top
    window.scrollTo(0, 0);
    
    // Use the specific ID we added to the main content container
    const mainContentContainer = document.getElementById('main-content-container');
    
    if (mainContentContainer) {
      console.log('ScrollToTop: Found main container by ID, scrolling to top');
      mainContentContainer.scrollTop = 0;
    } else {
      console.log('ScrollToTop: Could not find main container by ID');
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
