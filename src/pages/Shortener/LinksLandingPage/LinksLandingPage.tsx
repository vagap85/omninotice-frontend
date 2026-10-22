import { useEffect, useState } from 'react';

import AuthPrompt from '@/components/shortener/landing/AuthPrompt/AuthPrompt';
import LandingHeader from '@/components/shortener/landing/LandingHeader/LandingHeader';
import LinkShortener from '@/components/shortener/landing/LinkShortener/LinkShortener';
import { MarketingBlock } from '@/components/shortener/landing/MarketingBlock/MarketingBlock';
import ResultCard from '@/components/shortener/landing/ResultCard/ResultCard';
import type { LinkData } from '@/types/shortener';
import { getGuestShortcuts } from '@/utils/guestShortcuts';

import './LinksLandingPage.scss';

export default function LinksLandingPage() {
  const [shortenedLink, setShortenedLink] = useState<LinkData | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [lastInputUrl, setLastInputUrl] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [showMarketing, setShowMarketing] = useState(true);

  // При загрузке — восстанавливаем последнюю гостевую ссылку из хранилища
  useEffect(() => {
    const restore = async () => {
      const guests = getGuestShortcuts();
      if (guests.length === 0) return;

      const last = guests[0];
      setShortenedLink({
        shortUrl: last.shortUrl,
        originalUrl: last.originalUrl,
        createdAt: last.createdAt,
        isSecure: true,
        shortcut: last.shortcut,
        shortcutId: last.shortcutId
      });
      setOriginalUrl(last.originalUrl);
      setLastInputUrl(last.originalUrl);
      setShowResult(true);
      setShowAuthPrompt(true);
      // Маркетинг скрываем — ссылка уже есть
      setShowMarketing(false);
    };

    void restore();
  }, []);

  const handleShortened = (data: LinkData): void => {
    setShortenedLink(data);
    setOriginalUrl(data.originalUrl);
    setLastInputUrl(data.originalUrl);
    setShowResult(true);
    setShowAuthPrompt(true);
    setShowMarketing(false);
  };

  const handleReset = (): void => {
    setShowResult(false);
    setShortenedLink(null);
    setLastInputUrl('');
    setShowAuthPrompt(false);
    setResetKey((prev) => prev + 1);
    setShowMarketing(true);
  };

  return (
    <div className="links-landing">
      <LandingHeader />
      <main className="links-landing__main">
        <div className="links-landing__container">
          <div className="links-landing__content">
            <LinkShortener
              key={resetKey}
              onShortened={handleShortened}
              isResultMode={showResult}
              originalUrl={lastInputUrl}
              onShortenSuccess={() => setShowMarketing(false)}
            />

            {showResult && shortenedLink && (
              <ResultCard
                link={shortenedLink}
                originalUrl={originalUrl}
                onNewLink={handleReset}
              />
            )}

            {showAuthPrompt && <AuthPrompt />}
          </div>

          {showMarketing && (
            <div className="links-landing__marketing">
              <MarketingBlock />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
