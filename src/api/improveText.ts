const FUNCTION_URL = import.meta.env.VITE_AI_FUNCTION_URL;

export async function improveText(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error("Введите текст");
  }

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data.error || "Ошибка");
  }

  return data.result || "Нет результата";
}