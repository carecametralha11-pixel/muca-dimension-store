import { useEffect } from 'react';

const SecurityProtection = () => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable drag on images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    // Show warning in console
    console.log('%c⛔ PARE!', 'color: red; font-size: 60px; font-weight: bold; text-shadow: 2px 2px 0 black;');
    console.log('%cEsta é uma funcionalidade do navegador destinada a desenvolvedores.', 'font-size: 18px; color: #fff;');
    console.log('%cSe alguém lhe pediu para copiar e colar algo aqui, isso é uma FRAUDE e pode roubar suas informações.', 'font-size: 16px; color: #ef4444; font-weight: bold;');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return null;
};

export default SecurityProtection;
