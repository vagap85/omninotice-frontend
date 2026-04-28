import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { loginUserCenter, createUserCenter } from "../api/userCenter";
import authBg from "../assets/image 1.jpg";
import logo from "../assets/Vector.svg";
import { isValidEmail } from "../utils/recipient";

const AUTH_STORAGE_KEY = "usercenter_auth";

export default function AuthPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAcception, setPasswordAcception] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const isFilled = Boolean(
    login.trim() && password.trim() && passwordAcception,
  );
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setPasswordError(null);
    setEmailError(null);
    if (!isFilled) {
      setError("Введите логин и пароль");
      return;
    }

    if (!isValidEmail(login)) {
      setEmailError("Введите корректный email");
      return;
    }

    if (!(password === passwordAcception)) {
      setError("Пароли не совпадают");
      return;
    }
    setIsLoading(true);
    try {
      const create = await createUserCenter(login, password);
      const auth = await loginUserCenter(login.trim(), password);

      sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          accessToken: auth.accessToken,
          tokenType: auth.tokenType,
          login: auth.login,
          firstName: auth.firstName,
          lastName: auth.lastName,
        }),
      );

      toast({
        position: "bottom",
        duration: 4000,
        isClosable: true,
        render: () => (
          <Box
            bg="#1FAE4B"
            color="white"
            px={5}
            py={4}
            borderRadius="16px"
            boxShadow="lg"
            minW="470px"
          >
            <Text fontWeight="700" mb={1}>
              Вы успешно создали аккаунт
            </Text>
            <Text>Теперь можно отправлять рассылки и улучшать текст</Text>
          </Box>
        ),
      });
      navigate("/create");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      position="relative"
      w="100%"
      minH="100vh"
      sx={{ "@supports (min-height: 100dvh)": { minHeight: "100dvh" } }}
      overflowX="hidden"
      px={{ base: 4, sm: 6 }}
      py={{ base: 16, md: 20 }}
      fontFamily="Inter, system-ui, sans-serif"
    >
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        zIndex={0}
        bgImage={`url("${authBg}")`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        minW="100%"
        minH="100%"
      />
      <Button
        variant="ghost"
        leftIcon={<ArrowBackIcon />}
        color="#2D547B"
        fontWeight="500"
        fontSize="16px"
        onClick={() => navigate("/")}
        position="absolute"
        zIndex={2}
        top={{ base: "24px", md: "80px" }}
        left={{ base: 4, md: "80px" }}
      >
        На главную
      </Button>

      <VStack
        spacing={10}
        position="relative"
        zIndex={1}
        w="100%"
        maxW="460px"
        mx="auto"
        mt="8vh"
      >
        <Box as="img" src={logo} alt="OmniNotice" w="220px" h="80px" />

        <Box
          w="100%"
          bg="white"
          borderRadius="20px"
          boxShadow="0px 0px 1px rgba(25, 24, 27, 0.3), 0px 8px 16px rgba(26, 24, 27, 0.1)"
          p={8}
        >
          <Stack spacing={6}>
            <Stack spacing={5}>
              <FormControl isInvalid={Boolean(emailError)}>
                <FormLabel fontSize="14px" fontWeight="500" color="#12233F">
                  Логин
                </FormLabel>
                <Input
                  h="48px"
                  bg="#F8FAFC"
                  borderRadius="10px"
                  borderColor={error ? "#EF4444" : "#D1D5DB"}
                  _hover={{ borderColor: error ? "#EF4444" : "#94A3B8" }}
                  _focusVisible={{
                    borderColor: error ? "#EF4444" : "#3B6EA0",
                    boxShadow: "0 0 0 1px #3B6EA0",
                  }}
                  value={login}
                  type="email"
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="example@omninotice"
                />
                {emailError ? (
                  <FormErrorMessage mt={1} fontSize="12px">
                    {emailError}
                  </FormErrorMessage>
                ) : null}
              </FormControl>

              <FormControl isInvalid={Boolean(error)}>
                <FormLabel fontSize="14px" fontWeight="500" color="#12233F">
                  Придумайте пароль
                </FormLabel>
                <InputGroup>
                  <Input
                    h="48px"
                    type={showPassword ? "text" : "password"}
                    bg="#F8FAFC"
                    borderRadius="10px"
                    borderColor={error ? "#EF4444" : "#D1D5DB"}
                    _hover={{ borderColor: error ? "#EF4444" : "#94A3B8" }}
                    _focusVisible={{
                      borderColor: error ? "#EF4444" : "#3B6EA0",
                      boxShadow: "0 0 0 1px #3B6EA0",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="введите пароль"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void handleSubmit();
                      }
                    }}
                  />

                  <InputRightElement h="48px" pr={2}>
                    <IconButton
                      aria-label={
                        showPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      size="sm"
                      variant="ghost"
                      color="#12233F"
                      onClick={() => setShowPassword((v) => !v)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isInvalid={Boolean(error)}>
                <FormLabel fontSize="14px" fontWeight="500" color="#12233F">
                  Повторите пароль
                </FormLabel>
                <InputGroup>
                  <Input
                    h="48px"
                    type={showPassword ? "text" : "password"}
                    bg="#F8FAFC"
                    borderRadius="10px"
                    borderColor={error ? "#EF4444" : "#D1D5DB"}
                    _hover={{ borderColor: error ? "#EF4444" : "#94A3B8" }}
                    _focusVisible={{
                      borderColor: error ? "#EF4444" : "#3B6EA0",
                      boxShadow: "0 0 0 1px #3B6EA0",
                    }}
                    value={passwordAcception}
                    onChange={(e) => setPasswordAcception(e.target.value)}
                    placeholder="повторите пароль"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        void handleSubmit();
                      }
                    }}
                  />

                  <InputRightElement h="48px" pr={2}>
                    <IconButton
                      aria-label={
                        showPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      size="sm"
                      variant="ghost"
                      color="#12233F"
                      onClick={() => setShowPassword((v) => !v)}
                    />
                  </InputRightElement>
                </InputGroup>
                {passwordError ? (
                  <FormErrorMessage mt={1} fontSize="12px">
                    {passwordError}
                  </FormErrorMessage>
                ) : error ? (
                  <FormErrorMessage mt={1} fontSize="12px">
                    {error}
                  </FormErrorMessage>
                ) : null}
              </FormControl>
            </Stack>

            <VStack spacing={1}>
              <Button
                w="100%"
                h="49px"
                borderRadius="12px"
                bg="#3B6EA0"
                _hover={{ bg: "#2D547B" }}
                color="#FAFAFA"
                fontSize="16px"
                fontWeight="500"
                onClick={() => void handleSubmit()}
                isLoading={isLoading}
                loadingText="Создаем аккаунт..."
                opacity={isFilled ? 1 : 0.5}
              >
                Создать аккаунт
              </Button>
              <Link
                color="#3B6EA0"
                fontSize="16px"
                fontWeight="500"
                onClick={() => navigate("/login")}
                _hover={{ textDecoration: "none", color: "#2D547B" }}
              >
                У меня уже есть аккаунт
              </Link>
            </VStack>
          </Stack>
        </Box>
      </VStack>
    </Box>
  );
}
