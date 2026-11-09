import { useToast } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

import autorenewIcon from '@/assets/landing/autorenew.svg';
import checkCircleIcon from '@/assets/landing/check_circle.svg';
import copyIcon from '@/assets/landing/content_copy.svg';
import qrIcon from '@/assets/landing/qr_code.svg';
import { QrModal } from '@/components/shortener/QrModal/QrModal';
import type { ResultCardProps } from '@/types/shortener';
import { saveGuestShortcut, getGuestTtlHours } from '@/utils/guestShortcuts';

import './ResultCard.scss';

function ResultCard({ link, originalUrl, onNewLink }: ResultCardProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [qrShortcut, setQrShortcut] = useState<string | null>(null);

  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Очистка таймера копирования при анмаунте
  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  // Сохраняем гостевую ссылку в localStorage при смене shortcut
  useEffect(() => {
    if (!link.shortcut) return;

    saveGuestShortcut({
      shortUrl: link.shortUrl,
      originalUrl: link.originalUrl,
      shortcut: link.shortcut,
      shortcutId: link.shortcutId,
      createdAt: link.createdAt
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link.shortcut]);

  const handleCopy = (): void => {
    // Нормализуем URL — добавляем схему, если она отсутствует
    const fullUrl = link.shortUrl.startsWith('http')
      ? link.shortUrl
      : `https://${link.shortUrl}`;

    const markCopied = (): void => {
      setCopied(true);
      toast({
        title: 'Ссылка успешно скопирована в буфер обмена',
        status: 'success',
        duration: 4000,
        isClosable: true
      });
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 3000);
    };

    navigator.clipboard
      .writeText(fullUrl)
      .then(markCopied)
      .catch(() => {
        // Fallback для браузеров без Clipboard API
        try {
          const textArea = document.createElement('textarea');
          textArea.value = fullUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          markCopied();
        } catch {
          toast({
            title: 'Не удалось скопировать ссылку в буфер',
            status: 'error',
            duration: 4000,
            isClosable: true
          });
        }
      });
  };

  const ttl = getGuestTtlHours();

  return (
    <>
      <div className="result-card">
        <div className="result-card__header">
          <div className="result-card__success-icon">
            <img
              src={checkCircleIcon}
              alt="Успешно"
            />
          </div>
          <div className="result-card__text-group">
            <h2 className="result-card__title">Ваша ссылка готова!</h2>
            <p className="result-card__subtitle">
              Короткая ссылка создана и скопирована в буфер обмена
            </p>
          </div>
        </div>

        <div className="result-card__link-section">
          <div className="result-card__link-row">
            <span className="result-card__label">Исходная ссылка</span>
            <div className="result-card__original-url">
              {originalUrl || link.originalUrl}
            </div>
          </div>

          <div className="result-card__link-row">
            <span className="result-card__label">Короткая ссылка</span>
            <div className="result-card__short-url-wrapper">
              <span className="result-card__short-url">{link.shortUrl}</span>
              <div className="result-card__icon-group">
                <button
                  type="button"
                  className={`result-card__icon-btn${
                    copied ? ' result-card__icon-btn--copied' : ''
                  }`}
                  onClick={handleCopy}
                  title="Копировать ссылку"
                  disabled={copied}
                >
                  <img
                    src={copyIcon}
                    alt="Копировать"
                  />
                </button>
                <button
                  type="button"
                  className="result-card__icon-btn"
                  onClick={() => setQrShortcut(link.shortcut)}
                  title="QR-код"
                >
                  <img
                    src={qrIcon}
                    alt="QR-код"
                  />
                </button>
              </div>
            </div>

            {/* Предупреждение о временном хранении */}
            <p className="result-card__temporary-warning">
              Гостевая ссылка хранится временно — {ttl} часов.
              Зарегистрируйтесь, чтобы сохранить ее навсегда.
            </p>
          </div>
        </div>

        <div className="result-card__actions">
          <button
            type="button"
            className="result-card__new-link-btn"
            onClick={onNewLink}
          >
            Создать новую ссылку
            <img
              src={autorenewIcon}
              alt=""
              className="result-card__btn-icon"
            />
          </button>
        </div>
      </div>

      {qrShortcut && (
        <QrModal
          shortUrl={link.shortUrl}
          shortcut={qrShortcut}
          onClose={() => setQrShortcut(null)}
        />
      )}
    </>
  );
}

export default ResultCard;
