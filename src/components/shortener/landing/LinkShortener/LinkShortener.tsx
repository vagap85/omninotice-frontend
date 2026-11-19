import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';

import { checkUrlSafety, createShortcut } from '@/api/shortenerPublic';
import errorIcon from '@/assets/landing/error.svg';
import lockIcon from '@/assets/landing/lock.svg';
import type { LinkShortenerProps } from '@/types/shortener';
import { validateUrlFormat } from '@/utils/validators';

import './LinkShortener.scss';

function LinkShortener({
  onShortened,
  onShortenSuccess,
  isResultMode = false,
  originalUrl = ''
}: LinkShortenerProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [debouncedUrl, setDebouncedUrl] = useState('');
  const [securityMessage, setSecurityMessage] = useState(
    'Мы автоматически проверим безопасность вашей ссылки'
  );
  const [showSecurityNote, setShowSecurityNote] = useState(true);

  // При получении URL из пропсов (после сокращения) — заполняем поле
  useEffect(() => {
    const sync = async () => {
      if (!originalUrl) return;

      setUrl(originalUrl);
      setIsUrlValid(true);
      setValidationError('');
      setSecurityMessage('Ваши данные безопасны и надежно защищены');
      setShowSecurityNote(true);
    };

    void sync();
  }, [originalUrl]);

  // Debounce ввода — не проверяем безопасность на каждый символ
  useEffect(() => {
    if (isResultMode) return;

    const timer = setTimeout(() => setDebouncedUrl(url), 500);
    return () => clearTimeout(timer);
  }, [url, isResultMode]);

  // Автоматическая проверка после debounce с AbortController
  // для предотвращения race condition
  useEffect(() => {
    if (isResultMode) return;

    const controller = new AbortController();

    const check = async () => {
      if (!debouncedUrl || !debouncedUrl.trim()) {
        setIsUrlValid(false);
        setValidationError('');
        setShowSecurityNote(true);
        setSecurityMessage(
          'Мы автоматически проверим безопасность вашей ссылки'
        );
        return;
      }

      const formatValidation = validateUrlFormat(debouncedUrl);
      if (!formatValidation.valid) {
        setValidationError(formatValidation.message);
        setIsUrlValid(false);
        setShowSecurityNote(false);
        return;
      }

      setIsChecking(true);
      setValidationError('');
      setShowSecurityNote(true);

      try {
        const safetyResult = await checkUrlSafety(
          formatValidation.url!,
          controller.signal
        );

        if (safetyResult.isBlocked) {
          setValidationError(
            safetyResult.reasons?.[0] ||
              'Ссылка заблокирована из-за соображений безопасности.'
          );
          setIsUrlValid(false);
          setShowSecurityNote(false);
        } else {
          setIsUrlValid(true);
          setValidationError('');
          setShowSecurityNote(true);
          setSecurityMessage('Ваши данные безопасны и надежно защищены');
        }
      } catch (error) {
        // AbortError — штатная отмена запроса, не ошибка
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error('Security check error:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Ссылка заблокирована из-за соображений безопасности.';
        setValidationError(message);
        setIsUrlValid(false);
        setShowSecurityNote(false);
      } finally {
        setIsChecking(false);
      }
    };

    void check();

    // Cleanup: при следующем запуске эффекта — отменяем текущий запрос
    return () => controller.abort();
  }, [debouncedUrl, isResultMode]);

  // Отправка формы
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isResultMode) return;

    if (!isUrlValid) {
      if (!validationError) {
        setValidationError('Некорректный URL. Проверьте формат URL.');
        setShowSecurityNote(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      // createShortcut возвращает LinkData — маппинг внутри API-слоя
      const shortcutData = await createShortcut(url.trim());
      onShortened(shortcutData);

      setShowSecurityNote(true);
      onShortenSuccess?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при создании ссылки';
      setValidationError(message);
      setShowSecurityNote(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (isResultMode) return;

    const newUrl = e.target.value;
    setUrl(newUrl);

    if (validationError && !newUrl) {
      setValidationError('');
      setIsUrlValid(false);
      setShowSecurityNote(true);
      setSecurityMessage(
        'Мы автоматически проверим безопасность вашей ссылки'
      );
    }
  };

  return (
    <div className="shortener">
      <h1 className="shortener__title">
        <span className="shortener__title-line">Сократите ссылку</span>
        <br />
        <span className="shortener__title-line shortener__title-line--accent">
          до удобного короткого адреса
        </span>
      </h1>

      <p className="shortener__subtitle">
        Вставьте длинную ссылку — мы создадим короткую за секунду.
      </p>

      <div className="shortener__wrapper">
        <form
          onSubmit={handleSubmit}
          className="shortener__form"
        >
          <div className="shortener__group">
            <div className="shortener__field">
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="Вставьте ссылку"
                className={`shortener__input${
                  validationError ? ' shortener__input--error' : ''
                }${isResultMode ? ' shortener__input--result' : ''}`}
                disabled={isLoading || isChecking || isResultMode}
                readOnly={isResultMode}
              />
              {isChecking && (
                <div className="shortener__indicator">
                  <span className="shortener__spinner" />
                  <span>Проверка...</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isUrlValid || isChecking || isResultMode}
              className={`shortener__submit${
                isResultMode ? ' shortener__submit--result' : ''
              }`}
            >
              {isLoading ? 'Сокращаем...' : 'Сократить'}
            </button>
          </div>
        </form>

        {showSecurityNote && (
          <div className="shortener__security">
            <img
              src={lockIcon}
              alt="Безопасность"
              className="shortener__security-icon"
            />
            <span>{securityMessage}</span>
          </div>
        )}

        {validationError && !isResultMode && (
          <div className="shortener__error">
            <img
              src={errorIcon}
              alt="Ошибка"
              className="shortener__error-icon"
            />
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
}

export default LinkShortener;
