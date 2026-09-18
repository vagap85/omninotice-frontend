import { ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, Icon, useOutsideClick } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

import BellRingIcon from "@/components/atoms/Icons/collections/Sigma/BellRingIcon";

import { useSelectingRecipientApp } from "../hooks/useSelectingRecipientApp";
import type { AppSelectProps, SelectingApp } from "../types/types";

const DEFAULT_APPS: SelectingApp[] = [
  {
    id: "sigma",
    name: "Сигма",
    count: 235,
    isActive: true,
    platform: "Sigma",
    iconColor: "#487BFE",
    bgIconColor: "#D1DEFF",
    standartIcon: {
      id: "sigma",
      Icon: BellRingIcon,
      title: "Стандартная иконка Сигма",
      description: "Если не выбрать другую, получатель увидит эту",
    }
  },
  {
    id: "raida",
    name: "Raida",
    count: 0,
    isActive: false,
    platform: "Raida",
    iconColor: "#131313",
    bgIconColor: "#621e1e",
    standartIcon: {
      id: "raida",
      Icon: BellRingIcon,
      title: "Стандартная иконка Raida",
      description: "Если не выбрать другую, получатель увидит эту",
    }
  },
  {
    id: "classhub",
    name: "Class Hub",
    count: 0,
    isActive: false,
    platform: "ClassHub",
    iconColor: "",
    bgIconColor: "",
    standartIcon: {
      id: "classhub",
      Icon: BellRingIcon,
      title: "Стандартная иконка Class Hub",
      description: "Если не выбрать другую, получатель увидит эту",
    }
  },
];

const MotionBox = motion(Box);

export default function AppSelect({
  apps = DEFAULT_APPS,
  value,
  onChange,
}: AppSelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [internalSelected, setInternalSelected] = useState<SelectingApp | null>(null);
  const { setSelectedApp, appError } = useSelectingRecipientApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = value !== undefined ? value : internalSelected;

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  const handleSelect = (app: SelectingApp): void => {
    if (!app.isActive) return;
    if (value === undefined) setInternalSelected(app);
    setSelectedApp({
      title: app.name,
      description: "Если не выбрать другую, получатель увидит эту",
      icon: app.standartIcon,
      standartIcon: app.standartIcon,
      iconColor: app.iconColor,
      bgIconColor: app.bgIconColor,
      count: app.count,
      platform: app.platform
    });
    setIsOpen(false);
    triggerRef.current?.focus();
    onChange?.(app);
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((v) => !v);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      // фокус на первый пункт после открытия
      requestAnimationFrame(() => {
        listRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
      });
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Box>
      <Text fontSize="lg" mb={1.5} color="#12233F">
        Приложение
      </Text>

      <Box ref={containerRef} position="relative" w="100%">
        <Flex
          ref={triggerRef}
          as="button"
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          onKeyDown={handleTriggerKeyDown}
          align="center"
          justify="space-between"
          w="100%"
          px={"18px"}
          py={2.5}
          bg="#F8FAFC"
          borderRadius="10px"
          border="1px solid"
          borderColor={appError ? "red.500" : "#E2EBF3"}
          cursor="pointer"
        >
          <Text color="#12233F" fontSize="md" lineHeight={6}>
            {selected ? selected.name : "Выберите приложение"}
          </Text>
          <Icon
            as={ChevronDownIcon}
            boxSize={5}
            color="#12233F"
            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
            transition="transform 0.2s ease"
          />
        </Flex>

        <MotionBox
          position="relative"
          overflow="hidden"
          initial={false}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Box
            ref={hintRef}
            mt={1.5}
            position={isOpen ? "absolute" : "relative"}
            top={isOpen ? 0 : undefined}
            left={0}
            right={0}
            opacity={isOpen ? 0 : 1}
            transition="opacity 0.01s ease"
            pointerEvents={isOpen ? "none" : "auto"}
          >
            {appError
              ?
              <Text color="red.500" fontSize="xs" fontWeight="normal">
                Выбор приложение обязателен
              </Text>
              :
              <Text color="#52525B" fontSize="xs" fontWeight="normal">
                В этом списке отображаются все доступные вам приложения. Уведомление появится в выбранном приложении
              </Text>
            }
          </Box>

          <Box
            ref={listRef}
            mt={2}
            position={isOpen ? "relative" : "absolute"}
            left={0}
            right={0}
            opacity={isOpen ? 1 : 0}
            pointerEvents={isOpen ? "auto" : "none"}
            role="listbox"
          >
            <Box
              bg="white"
              borderRadius="10px"
              border="1px solid"
              borderColor="#E2EBF3"
              boxShadow="0 8px 24px rgba(18, 35, 63, 0.08)"
              overflow="hidden"
            >
              {apps.map((app) => (
                <Flex
                  key={app.id}
                  as="button"
                  type="button"
                  role="option"
                  aria-selected={selected?.id === app.id}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => handleSelect(app)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }
                  }}
                  w="100%"
                  align="center"
                  justify="space-between"
                  px={5}
                  py={2.5}
                  bg={selected?.id === app.id && app.isActive ? "gray.50" : "transparent"}
                  _hover={{ bg: app.isActive ? "gray.50" : "transparent" }}
                  cursor={app.isActive ? "pointer" : "unset"}
                  disabled={!app.isActive}
                >
                  <Text fontSize="md" color={app.isActive ? "#12233F" : "#8A8A99"} lineHeight={6}>
                    {app.name}
                  </Text>
                  <Text fontSize="sm" color="#A1A1AA">
                    {app.count}
                  </Text>
                </Flex>
              ))}
            </Box>
          </Box>
        </MotionBox>
      </Box>
    </Box>
  );
}
