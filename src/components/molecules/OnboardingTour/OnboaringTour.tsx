import { Box, Button, Flex, Text, Portal } from '@chakra-ui/react';
import { useState, useEffect, useCallback, ReactNode } from 'react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  centered?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: '«Вишенка» — уведомления внутри корпоративных систем',
    description:
      '«Вишенка» позволяет отправлять push-уведомления пользователям в корпоративных приложениях. Мы покажем, как это работает на тестовом приложении, единственный получатель в нем вы. Соберите уведомление и отправьте, чтобы увидеть результат.',
    centered: true
  },
  {
    id: 2,
    title: 'Создавайте и отправляйте любые уведомления вашим пользователям',
    description:
      'Создавайте любые уведомления вручную с заголовком и описанием о важных событиях в вашей компании.',
    targetSelector: '[data-tour="notification-text"]',
    position: 'right'
  },
  {
    id: 3,
    title: 'Или используйте готовые шаблоны',
    description:
      'В шаблонах собраны частые поводы: назначенная задача, отпуск, опросы, поздравления и др. Поля заполнятся сами — останется только заполнить переменные.',
    targetSelector: '[data-tour="template-selector"]',
    position: 'right'
  },
  {
    id: 4,
    title: 'Добавьте кнопку с действием',
    description:
      'Кнопка превращает уведомление из сообщения в действие: открыть задачу, пройти опрос, прочитать документ и т.д. Используйте любую нужную ссылку — на страницу приложения или на внешний сайт.',
    targetSelector: '[data-tour="action-block"]',
    position: 'right'
  },
  {
    id: 5,
    title: 'Выберите, куда придет уведомление',
    description:
      'В списке — все доступные вам подключенные приложения. Сейчас вам доступна тестовая площадка с одним приложением, чтобы вы могли увидеть сервис в действии.',
    targetSelector: '[data-tour="app-select"]',
    position: 'left'
  },
  {
    id: 6,
    title: 'Библиотека иконок в дизайн-системе вашего приложения',
    description:
      'Оставьте иконку по умолчанию или выберите подходящую по смыслу из готовой библиотеки, оформленной в дизайн-системе вашего приложения.',
    targetSelector: '[data-tour="icon-select"]',
    position: 'left'
  },
  {
    id: 7,
    title: 'Отправка всем или отдельным пользователям',
    description:
      'Список получателей — пользователи вашего приложения. Данные защищены и доступны только в вашем аккаунте. Отправляйте уведомления всем или выборочному списку буквально за несколько кликов.',
    targetSelector: '[data-tour="recipients-select"]',
    position: 'left'
  },
  {
    id: 8,
    title: 'Посмотрите на уведомление глазами получателя',
    description:
      'Уведомление полностью оформлено в дизайн-системе вашего приложения. Превью обновляется, пока вы печатаете.',
    targetSelector: '[data-tour="preview-block"]',
    position: 'left'
  }
];

const TOTAL_STEPS = ONBOARDING_STEPS.length;

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

function TopLayer({ children }: { children: ReactNode }) {
  const setRef = useCallback((el: HTMLDivElement | null) => {
    if (
      el &&
      typeof el.showPopover === 'function' &&
      !el.matches(':popover-open')
    ) {
      el.showPopover();
    }
  }, []);

  return (
    <Portal>
      <Box
        ref={setRef}
        {...{ popover: 'manual' }}
        position="fixed"
        inset={0}
        w="100vw"
        h="100vh"
        maxW="none"
        maxH="none"
        m={0}
        p={0}
        border="none"
        bg="transparent"
        color="inherit"
        overflow="visible"
        zIndex={2147483647}
      >
        {children}
      </Box>
    </Portal>
  );
}

export function OnboardingTour({ isOpen, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !step) {
      setTargetRect(null);
      return;
    }

    if (step.centered) {
      setTargetRect(null);
      return;
    }

    if (!step.targetSelector) {
      setTargetRect(null);
      return;
    }

    const measureAndScroll = () => {
      const element = document.querySelector(
        step.targetSelector!
      ) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'center' });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();
            setTargetRect(rect);
          });
        });
      }
    };

    const frameId = requestAnimationFrame(measureAndScroll);

    window.addEventListener('resize', measureAndScroll);
    window.addEventListener('scroll', measureAndScroll, true);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', measureAndScroll);
      window.removeEventListener('scroll', measureAndScroll, true);
    };
  }, [isOpen, currentStep, step]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (!isOpen || !step) return null;

  const tooltipPosition = step.centered
    ? { top: '50%', left: '50%' }
    : getTooltipPosition(step.position || 'bottom', targetRect);

  return (
    <TopLayer>
      {/* Затемнение фона */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={step.centered ? 'rgba(0, 0, 0, 0.6)' : ''}
        zIndex={9998}
      />

      {targetRect && !step.centered && (
        <Box
          position="fixed"
          top={targetRect.top - 8}
          left={targetRect.left - 8}
          width={targetRect.width + 16}
          height={targetRect.height + 16}
          border="4px solid #3B6EA0"
          borderRadius="12px"
          boxShadow="0 0 0 9999px rgba(0, 0, 0, 0.6)"
          zIndex={9999}
          pointerEvents="none"
          transition="all 0.3s ease"
        />
      )}

      {/* Тултип (подсказка) */}
      <Box
        position="fixed"
        zIndex={10000}
        bg="white"
        borderRadius="12px"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
        p={5}
        maxW="400px"
        w="100%"
        top={step.centered ? '50%' : tooltipPosition.top}
        left={step.centered ? '50%' : tooltipPosition.left}
        transform={step.centered ? 'translate(-50%, -50%)' : undefined}
      >
        <Text
          fontSize="xs"
          fontWeight="600"
          color="#64748B"
          mb={2}
          textTransform="uppercase"
        >
          ШАГ {currentStep + 1} ИЗ {TOTAL_STEPS}
        </Text>

        <Text
          fontSize="md"
          fontWeight="600"
          color="#12233F"
          mb={3}
          lineHeight="1.4"
        >
          {step.title}
        </Text>

        <Text
          fontSize="sm"
          color="#64748B"
          mb={4}
          lineHeight="1.6"
        >
          {step.description}
        </Text>

        <Flex
          justify="space-between"
          align="center"
        >
          {ONBOARDING_STEPS.map((_, index) => (
            <Box
              key={index}
              w="10px"
              h="10px"
              borderRadius="full"
              bg={index === currentStep ? '#3B6EA0' : '#E2E8F0'}
            />
          ))}
          <Flex gap={2}>
            <Button
              variant="ghost"
              size="sm"
              color="#64748B"
              onClick={handleSkip}
            >
              Пропустить
            </Button>
            <Button
              variant="solid"
              size="sm"
              bg="#3B6EA0"
              color="white"
              _hover={{ bg: '#2f5a85' }}
              onClick={handleNext}
            >
              {isLastStep ? 'Все понятно' : 'Далее'}
            </Button>
          </Flex>
        </Flex>

        <Flex></Flex>
      </Box>
    </TopLayer>
  );
}

function getTooltipPosition(position: string, targetRect: DOMRect | null) {
  if (!targetRect) {
    return { top: '50%', left: '50%' };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = 400;
  const th = 280;
  const gap = 16;

  let finalPosition = position;
  let top = 0;
  let left = 0;

  if (position === 'top' && targetRect.top < th + gap) finalPosition = 'bottom';
  if (position === 'bottom' && targetRect.bottom + th + gap > vh)
    finalPosition = 'top';
  if (position === 'left' && targetRect.left < tw + gap)
    finalPosition = 'right';
  if (position === 'right' && targetRect.right + tw + gap > vw)
    finalPosition = 'left';

  switch (finalPosition) {
    case 'top':
      top = targetRect.top - th - gap;
      left = targetRect.left + targetRect.width / 2 - tw / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - tw / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - th / 2;
      left = targetRect.left - tw - gap;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - th / 2;
      left = targetRect.right + gap;
      break;
  }

  top = Math.max(gap, Math.min(top, vh - th - gap));
  left = Math.max(gap, Math.min(left, vw - tw - gap));

  return { top: `${top}px`, left: `${left}px` };
}
