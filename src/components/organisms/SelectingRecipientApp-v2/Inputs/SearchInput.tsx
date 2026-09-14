import { useEffect, useRef, useState } from "react";
import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import SearchIcon from "@/components/atoms/Icons/SearchIcon";
import CloseIcon from "@/components/atoms/Icons/CloseIcon";
import { fetchGetUsers, type User } from "../../../../api/fetches";
import { useSelectedUsers } from "../Providers/SelectedUsers.provider";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_DELAY = 300;

export default function SearchInput({ platform }: { platform: string }) {
  const { selectedUsers, addUser } = useSelectedUsers();

  const [value, setValue] = useState<string>("");
  const [usersInSearch, setUsersInSearch] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setUsersInSearch([]);
      setHasSearched(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      try {
        const response = await fetchGetUsers(value, platform, {
          signal: controller.signal,
        });
        setUsersInSearch(response?.users ?? []);
        setHasSearched(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Ошибка поиска пользователей:", error);
          setUsersInSearch([]);
          setHasSearched(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, platform]);

  const handleClear = () => {
    const input = inputRef.current;
    if (!input) return;

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    nativeSetter?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
    setValue("");
  };

  const handleChange = () => {
    const input = inputRef.current;
    if (!input) return;
    setValue(input.value);
  };

  const handleSelectUser = (user: User) => {
    addUser(user);
    handleClear();
  };

  // не показываем в выпадающем списке тех, кто уже выбран
  const visibleResults = usersInSearch.filter(
    (user) => !selectedUsers.some((selected) => selected.id === user.id)
  );

  const showResults =
    !isLoading && value.trim().length >= MIN_QUERY_LENGTH && visibleResults.length > 0;

  let statusText = "Начните вводить фамилию или имя";
  if (isLoading) {
    statusText = "Ищем...";
  } else if (hasSearched && visibleResults.length === 0) {
    statusText = "Никого не нашли";
  }

  return (
    <Flex direction={"column"} gap={1.5}>

      <InputGroup color="#A1A1AA" _focusWithin={{ color: "#3B6EA0" }}>
        <InputLeftElement pointerEvents="none" top={"50%"} transform={"translateY(-50%)"}>
          <SearchIcon width={16} height={16} />
        </InputLeftElement>

        <Input
          ref={inputRef}
          id="search"
          type="search"
          placeholder="Введите фамилию или имя"
          aria-label="Поиск по фамилии или имени"
          border="none"
          pr={8}
          _focus={{ border: "none" }}
          _focusVisible={{ outline: "1px solid #3B6EA0" }}
          sx={{
            "&::-webkit-search-cancel-button": {
              WebkitAppearance: "none",
              appearance: "none",
              margin: 0,
            },
          }}
          borderRadius={"10px"}
          h={"44px"}
          color={"#12233F"}
          value={value}
          onChange={handleChange}
        />

        <InputRightElement
          opacity={0}
          pointerEvents="none"
          transition="opacity 0.15s ease"
          sx={{
            "input:not(:placeholder-shown) ~ &": {
              opacity: 1,
              pointerEvents: "auto",
            },
          }}
        >
          <IconButton
            w={6}
            h={6}
            aria-label="Очистить поле"
            icon={<CloseIcon width={10} height={10} color="#12233F" />}
            size="xs"
            variant="ghost"
            color="inherit"
            onClick={handleClear}
          />
        </InputRightElement>
      </InputGroup>

      {showResults && (
        <Flex
          direction="column"
          gap={1}
          padding={1}
          bg={"white"}
          outline={"1px solid #E2EBF3"}
          borderRadius={8}
          boxShadow="0 4px 12px rgba(0,0,0,0.08)"
          overflowY="auto"
        >
          {visibleResults.map((user) => (
            <Flex
              key={user.id}
              p={2}
              borderRadius={10}
              _hover={{ bg: "#F8FAFC", cursor: "pointer" }}
              onClick={() => handleSelectUser(user)}
            >
              <Text fontSize="md" fontWeight={"medium"} lineHeight={"24px"} color="#12233F">
                {user.full_name}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
      {!showResults && <Text fontSize="xs" lineHeight="16px" color="#52525B" minH="16px">
        {statusText}
      </Text>
      }
    </Flex>
  );
}