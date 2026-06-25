import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = ({ onOpenShortcuts }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Disable shortcuts when user is typing in an input/textarea/select or editable element
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      // 2. Handle Shortcuts
      switch (e.key) {
        case '/': {
          // focus search input
          e.preventDefault();
          const searchInput = document.getElementById('navbar-search-input');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        }

        case 'n':
        case 'N': {
          // Open "new product" page/modal
          e.preventDefault();
          navigate('/create');
          break;
        }

        case 'c':
        case 'C': {
          // Open cart drawer via a custom event
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('open-cart'));
          break;
        }

        case 'Escape': {
          // Esc -> Close any open modal/drawer
          // Chakra UI close button typically has class "chakra-modal__close-btn" or [aria-label="Close"]
          const closeButton = document.querySelector(
            '.chakra-modal__close-btn, [aria-label="Close"]'
          );
          if (closeButton) {
            closeButton.click();
          }
          break;
        }

        case '?': {
          // Open keyboard shortcuts help modal
          e.preventDefault();
          if (onOpenShortcuts) {
            onOpenShortcuts();
          }
          break;
        }

        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          // Navigate between products
          const cards = Array.from(document.querySelectorAll('.product-card'));
          if (cards.length === 0) return;

          e.preventDefault();

          const currentCard = cards.find((card) => card === activeEl);

          if (!currentCard) {
            // Focus first card if none is currently focused
            cards[0].focus();
            return;
          }

          const currentRect = currentCard.getBoundingClientRect();
          const currentCenterX = currentRect.left + currentRect.width / 2;
          const currentCenterY = currentRect.top + currentRect.height / 2;

          let targetCard = null;
          let minDistance = Infinity;

          cards.forEach((card) => {
            if (card === currentCard) return;

            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = centerX - currentCenterX;
            const dy = centerY - currentCenterY;

            // Simple distance matching based on direction
            if (e.key === 'ArrowLeft' && dx < -5) {
              // moving left: penalize vertical delta
              const dist = Math.sqrt(dx * dx + dy * dy * 4);
              if (dist < minDistance) {
                minDistance = dist;
                targetCard = card;
              }
            } else if (e.key === 'ArrowRight' && dx > 5) {
              // moving right: penalize vertical delta
              const dist = Math.sqrt(dx * dx + dy * dy * 4);
              if (dist < minDistance) {
                minDistance = dist;
                targetCard = card;
              }
            } else if (e.key === 'ArrowUp' && dy < -5) {
              // moving up: penalize horizontal delta
              const dist = Math.sqrt(dx * dx * 4 + dy * dy);
              if (dist < minDistance) {
                minDistance = dist;
                targetCard = card;
              }
            } else if (e.key === 'ArrowDown' && dy > 5) {
              // moving down: penalize horizontal delta
              const dist = Math.sqrt(dx * dx * 4 + dy * dy);
              if (dist < minDistance) {
                minDistance = dist;
                targetCard = card;
              }
            }
          });

          if (targetCard) {
            targetCard.focus();
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onOpenShortcuts]);
};
