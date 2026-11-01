import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';
import Button from '@/components/atoms/Button/Button';
import ProgressModal from '@/components/shortener/ProgressModal/ProgressModal';
import { ProfileError, profileService } from '@/services/profile';
import type { UserProfile } from '@/types/profile';

import './ProfilePage.scss';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FormErrors = Partial<
  Record<
    'firstName' | 'email' | 'phone' | 'current' | 'next' | 'repeat',
    string
  >
>;

type ModalState = { title: string; error: string } | null;

interface ProfileFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  caption?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'text' | 'password';
  showPassword?: boolean;
  onTogglePassword?: () => void;
  autoComplete?: string;
}

const EyeIcon = ({ hidden }: { hidden: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.412 10s2.98-5.417 7.588-5.417S17.588 10 17.588 10s-2.98 5.417-7.588 5.417S2.412 10 2.412 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="10"
      cy="10"
      r="2.08"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    {hidden && (
      <path
        d="M4.5 16.5 15.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    )}
  </svg>
);

function ProfileField({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
  caption,
  error,
  disabled,
  fullWidth,
  type = 'text',
  showPassword,
  onTogglePassword,
  autoComplete
}: ProfileFieldProps) {
  const isPassword = type === 'password';
  return (
    <div
      className={`profile-field ${fullWidth ? 'profile-field--full' : ''} ${
        error ? 'profile-field--error' : ''
      }`}
    >
      <label
        className="profile-field__label"
        htmlFor={id}
      >
        {label}
        {required && <span className="profile-field__required">*</span>}
      </label>
      <div className="profile-field__control">
        <input
          id={id}
          className={`profile-field__input ${
            isPassword ? 'profile-field__input--password' : ''
          }`}
          type={isPassword && !showPassword ? 'password' : 'text'}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        {isPassword && (
          <button
            type="button"
            className="profile-field__eye"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            <EyeIcon hidden={Boolean(showPassword)} />
          </button>
        )}
      </div>
      {error ? (
        <p className="profile-field__error">{error}</p>
      ) : (
        caption && <p className="profile-field__caption">{caption}</p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { authState, updateUser } = useAuth();
  const navigate = useNavigate();

  const failModeRef = useRef<'load' | 'save' | 'pwd' | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );

  const accountEmail = authState?.login || 'mail@mail.ru';
  const initialFirstName =
    authState?.firstName ||
    (authState?.login?.includes('@')
      ? authState.login.split('@')[0]
      : authState?.login || 'Иван');
  const initialLastName = authState?.lastName || 'Иванов';

  const preLoadProfile: UserProfile = useMemo(
    () => ({
      firstName: initialFirstName,
      lastName: initialLastName,
      email: accountEmail,
      phone: '+7 999 777-33-11',
      position: 'Маркетолог'
    }),
    [accountEmail, initialFirstName, initialLastName]
  );

  const [form, setForm] = useState<UserProfile>(() => preLoadProfile);
  const [loaded, setLoaded] = useState<UserProfile | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    repeat: ''
  });
  const [pwdVisibility, setPwdVisibility] = useState({
    current: false,
    next: false,
    repeat: false
  });
  const [saving, setSaving] = useState(false);
  const [pwdBusy, setPwdBusy] = useState(false);
  const [saveModal, setSaveModal] = useState<ModalState>(null);
  const [pwdModal, setPwdModal] = useState<ModalState>(null);
  const [banner, setBanner] = useState<{ title?: string; text: string } | null>(
    null
  );

  // Демо-триггеры состояний из макетов передаются через query-параметр ?fail=
  const location = useLocation();
  useEffect(() => {
    const fail = new URLSearchParams(location.search).get('fail');
    if (fail === 'load' || fail === 'save' || fail === 'pwd') {
      failModeRef.current = fail;
      navigate('/profile', { replace: true });
    }
  }, [location.search, navigate]);

  // Загрузка профиля: ФИО и e-mail берутся из сессии/контекста,
  // остальные данные приходят с мок-бэкенда.
  useEffect(() => {
    let cancelled = false;

    profileService
      .loadProfile(
        { ...preLoadProfile },
        {
          simulateFailure: failModeRef.current === 'load'
        }
      )
      .then((profile) => {
        if (cancelled) return;
        setLoaded(profile);
        setForm(profile);
        setLoadState('loaded');
        if (profile.firstName || profile.lastName) {
          updateUser({
            firstName: profile.firstName,
            lastName: profile.lastName
          });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [preLoadProfile]);

  useEffect(() => {
    if (!banner) return undefined;
    const timer = window.setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  const validateProfileField = (
    field: 'firstName' | 'email' | 'phone',
    value: string
  ): string => {
    const v = value.trim();
    if (field === 'firstName') {
      return v ? '' : 'Имя обязательно для заполнения';
    }
    if (field === 'email') {
      return v && EMAIL_RE.test(v)
        ? ''
        : 'Введите корректный адрес электронной почты';
    }
    if (!v) return '';
    const digits = v.replace(/\D+/g, '');
    return digits.length >= 10 && digits.length <= 15
      ? ''
      : 'Укажите корректный номер телефона';
  };

  const handleProfileChange = (
    field: 'firstName' | 'lastName' | 'email' | 'phone' | 'position',
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'firstName' || field === 'email' || field === 'phone') {
      setErrors((prev) => ({
        ...prev,
        [field]: validateProfileField(field, value)
      }));
    }
  };

  const handlePasswordChange = (
    field: 'current' | 'next' | 'repeat',
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next: FormErrors = { ...prev };
      if (field === 'current') {
        next.current = '';
      } else if (field === 'next') {
        next.next =
          value.length >= 8 ? '' : 'Пароль должен содержать минимум 8 символов';
        if (passwords.repeat) {
          next.repeat = passwords.repeat === value ? '' : 'Пароли не совпадают';
        }
      } else {
        next.repeat = value === passwords.next ? '' : 'Пароли не совпадают';
      }
      return next;
    });
  };

  const togglePasswordVisibility = (field: 'current' | 'next' | 'repeat') => {
    setPwdVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const isProfileChanged = useMemo(() => {
    if (!loaded) return false;
    return (
      (form.firstName ?? '') !== (loaded.firstName ?? '') ||
      (form.lastName ?? '') !== (loaded.lastName ?? '') ||
      (form.email ?? '') !== (loaded.email ?? '') ||
      (form.phone ?? '') !== (loaded.phone ?? '') ||
      (form.position ?? '') !== (loaded.position ?? '')
    );
  }, [form, loaded]);

  const resetProfileChanges = () => {
    if (!loaded) return;
    setForm(loaded);
    setErrors((prev) => ({ ...prev, firstName: '', email: '', phone: '' }));
  };

  const isPasswordChanged = useMemo(() => {
    return Boolean(passwords.current || passwords.next || passwords.repeat);
  }, [passwords]);

  const resetPasswords = () => {
    setPasswords({ current: '', next: '', repeat: '' });
    setErrors((prev) => ({ ...prev, current: '', next: '', repeat: '' }));
  };

  const saveFlow = async () => {
    if (!loaded || saving) return;
    setSaving(true);
    setSaveModal({ title: 'Сохраняем изменения', error: '' });
    const payload: UserProfile = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position.trim()
    };
    const simulateFailure = failModeRef.current === 'save';
    try {
      await profileService.saveProfile(payload, { simulateFailure });
      setSaveModal(null);
      setLoaded(payload);
      setForm(payload);
      updateUser?.({
        firstName: payload.firstName,
        lastName: payload.lastName
      });
      setBanner({ text: 'Изменения успешно сохранены' });
    } catch (e) {
      const err = e as ProfileError;
      if (err.field === 'email' || err.field === 'phone') {
        setSaveModal(null);
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      } else {
        setSaveModal((prev) => (prev ? { ...prev, error: err.message } : prev));
      }
    } finally {
      failModeRef.current = null;
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!loaded || saving || !isProfileChanged) return;
    const validation: FormErrors = {
      firstName: validateProfileField('firstName', form.firstName),
      email: validateProfileField('email', form.email),
      phone: validateProfileField('phone', form.phone)
    };
    if (Object.values(validation).some(Boolean)) {
      setErrors((prev) => ({ ...prev, ...validation }));
      return;
    }
    void saveFlow();
  };

  const handleSaveRetry = () => {
    setSaveModal((prev) => (prev ? { ...prev, error: '' } : prev));
    void saveFlow();
  };

  const changePasswordFlow = async () => {
    setPwdModal({ title: 'Изменяем пароль', error: '' });
    try {
      await profileService.changePassword(
        {
          oldPassword: passwords.current,
          newPassword: passwords.next
        },
        {
          simulateFailure: failModeRef.current === 'pwd'
        }
      );
      setPwdModal(null);
      setPasswords({ current: '', next: '', repeat: '' });
      setErrors((prev) => ({ ...prev, current: '', next: '', repeat: '' }));
      setBanner({
        title: 'Пароль успешно изменен',
        text: 'Все сессии на других устройствах завершены: нужно войти заново'
      });
    } catch (e) {
      const err = e as ProfileError;
      setPwdModal((prev) => (prev ? { ...prev, error: err.message } : prev));
    } finally {
      failModeRef.current = null;
    }
  };

  const handleChangePwdClick = async () => {
    if (pwdBusy || !isPasswordChanged) return;
    const validation: FormErrors = {
      current: passwords.current ? '' : 'Введите текущий пароль',
      next:
        passwords.next.length >= 8
          ? ''
          : 'Пароль должен содержать минимум 8 символов',
      repeat: passwords.repeat === passwords.next ? '' : 'Пароли не совпадают'
    };
    if (Object.values(validation).some(Boolean)) {
      setErrors((prev) => ({ ...prev, ...validation }));
      return;
    }
    setPwdBusy(true);
    try {
      await profileService.verifyCurrentPassword(
        passwords.current,
        authState?.login
      );
      await changePasswordFlow();
    } catch (e) {
      const err = e as ProfileError;
      if (err.field === 'currentPassword') {
        setErrors((prev) => ({ ...prev, current: err.message }));
      }
    } finally {
      setPwdBusy(false);
    }
  };

  const handlePwdRetry = () => {
    void changePasswordFlow();
  };

  return (
    <Box className="profile-page">
      {loadState === 'error' ? (
        <Box className="profile-page__container">
          <Heading
            as="h1"
            fontSize="20px"
            fontWeight={700}
            color="#12233f"
            mb="24px"
            fontFamily="'Inter', sans-serif"
          >
            Настройка профиля
          </Heading>
          <Box className="profile-page__card profile-page__card--error">
            <div className="profile-page__error-tile">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="9"
                  stroke="#ef4444"
                  strokeWidth="1.8"
                />
                <path
                  d="M11 6.5V12"
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="11"
                  cy="15.3"
                  r="1.1"
                  fill="#ef4444"
                />
              </svg>
            </div>
            <p className="profile-page__error-title">
              Не удалось загрузить данные профиля
            </p>
            <p className="profile-page__error-text">
              Проверьте соединение и повторите попытку.
            </p>
            <Button
              variant="primary"
              className="profile-page__btn"
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </Button>
          </Box>
        </Box>
      ) : (
        <Box className="profile-page__container">
          <Heading
            as="h1"
            fontSize="20px"
            fontWeight={700}
            color="#12233f"
            mb="24px"
            fontFamily="'Inter', sans-serif"
          >
            Настройка профиля
          </Heading>


          {banner && (
            <div
              className="profile-page__banner"
              role="status"
            >
              <svg
                className="profile-page__banner-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                />
                <path
                  d="M7.6 12.3l3.1 3.1 5.9-6.5"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                {banner.title && (
                  <p className="profile-page__banner-title">{banner.title}</p>
                )}
                <p
                  className={`profile-page__banner-text ${
                    banner.title ? '' : 'profile-page__banner-text--single'
                  }`}
                >
                  {banner.text}
                </p>
              </div>
            </div>
          )}

          <section className="profile-page__card">
            <h2 className="profile-page__section-title">Личные данные</h2>
            <div className="profile-page__grid">
              <ProfileField
                id="profile-first-name"
                label="Имя"
                required
                value={form.firstName}
                placeholder="Иван"
                error={errors.firstName}
                disabled={loadState === 'loading' || saving}
                onChange={(v) => handleProfileChange('firstName', v)}
              />
              <ProfileField
                id="profile-last-name"
                label="Фамилия"
                value={form.lastName}
                placeholder="Иванов"
                disabled={loadState === 'loading' || saving}
                onChange={(v) => handleProfileChange('lastName', v)}
              />
              <ProfileField
                id="profile-position"
                label="Должность"
                value={form.position}
                placeholder="Маркетолог"
                disabled={loadState === 'loading' || saving}
                onChange={(v) => handleProfileChange('position', v)}
              />
            </div>
          </section>

          <section className="profile-page__card">
            <h2 className="profile-page__section-title">Контакты</h2>
            <p className="profile-page__section-desc">
              Используются для отчетов по кликам, уведомлений о всплесках
              трафика и ошибках редиректа
            </p>
            <div className="profile-page__grid">
              <ProfileField
                id="profile-email"
                label="Рабочий e-mail"
                value={form.email}
                placeholder="mail@mail.ru"
                error={errors.email}
                caption={
                  errors.email ? undefined : 'Основной адрес для отчетов'
                }
                disabled={loadState === 'loading' || saving}
                onChange={(v) => handleProfileChange('email', v)}
              />
              <ProfileField
                id="profile-phone"
                label="Телефон"
                value={form.phone}
                placeholder="+7 999 777-33-11"
                error={errors.phone}
                caption={errors.phone ? undefined : 'Код страны и номер'}
                disabled={loadState === 'loading' || saving}
                onChange={(v) => handleProfileChange('phone', v)}
              />
              <div />
            </div>
          </section>

          <div className="profile-page__save-row">
            {isProfileChanged && (
              <button
                type="button"
                className="profile-page__discard-link"
                onClick={resetProfileChanges}
                disabled={saving}
              >
                Отменить изменения
              </button>
            )}
            <Button
              variant="primary"
              className="profile-page__btn"
              disabled={!isProfileChanged || saving}
              onClick={handleSaveClick}
            >
              Сохранить изменения
            </Button>
          </div>

          <section className="profile-page__card">
            <h2 className="profile-page__section-title">Безопасность</h2>
            <p className="profile-page__section-desc">
              Смена пароля учетной записи{' '}
              <strong className="profile-page__security-email">
                {accountEmail}
              </strong>
            </p>
            <div className="profile-page__grid">
              <ProfileField
                id="profile-password-current"
                label="Текущий пароль"
                type="password"
                value={passwords.current}
                placeholder="введите пароль"
                error={errors.current}
                caption="Введите пароль, которым пользуетесь сейчас"
                showPassword={pwdVisibility.current}
                onTogglePassword={() => togglePasswordVisibility('current')}
                autoComplete="current-password"
                disabled={pwdBusy}
                onChange={(v) => handlePasswordChange('current', v)}
              />
              <ProfileField
                id="profile-password-new"
                label="Придумайте новый пароль"
                type="password"
                value={passwords.next}
                placeholder="введите пароль"
                error={errors.next}
                showPassword={pwdVisibility.next}
                onTogglePassword={() => togglePasswordVisibility('next')}
                autoComplete="new-password"
                disabled={pwdBusy}
                onChange={(v) => handlePasswordChange('next', v)}
              />
              <ProfileField
                id="profile-password-repeat"
                label="Повторите новый пароль"
                type="password"
                value={passwords.repeat}
                placeholder="повторите пароль"
                error={errors.repeat}
                showPassword={pwdVisibility.repeat}
                onTogglePassword={() => togglePasswordVisibility('repeat')}
                autoComplete="new-password"
                disabled={pwdBusy}
                onChange={(v) => handlePasswordChange('repeat', v)}
              />
            </div>
            <div className="profile-page__pwd-footer">
              {isPasswordChanged && (
                <button
                  type="button"
                  className="profile-page__ghost-btn"
                  onClick={resetPasswords}
                  disabled={pwdBusy}
                >
                  Отмена
                </button>
              )}
              <Button
                variant="primary"
                className="profile-page__btn"
                disabled={!isPasswordChanged || pwdBusy}
                onClick={handleChangePwdClick}
              >
                Изменить пароль
              </Button>
            </div>
          </section>
        </Box>
      )}

      {saveModal && (
        <ProgressModal
          title={saveModal.title}
          duration={1600}
          error={saveModal.error}
          onClose={() => setSaveModal(null)}
          onRetry={handleSaveRetry}
        />
      )}

      {pwdModal && (
        <ProgressModal
          title={pwdModal.title}
          duration={1600}
          error={pwdModal.error}
          onClose={() => setPwdModal(null)}
          onRetry={handlePwdRetry}
        />
      )}
    </Box>
  );
}
