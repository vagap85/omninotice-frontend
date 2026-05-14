const getProjectId = (): string => {
  const id = import.meta.env.VITE_SYNORA_PROJECT_ID?.trim();
  if (!id) {
    throw new Error("VITE_SYNORA_PROJECT_ID is required (header: Project-ID)");
  }
  return id;
};

const getPromttId = (): string => {
  const id = import.meta.env.VITE_PROMT_ID?.trim();
  if (!id) {
    throw new Error("VITE_PROMT_ID is required (header: Project-ID)");
  }
  return id;
};

export async function improveText(text: string): Promise<string> {
  const responseFirst = await fetch(
    "https://oracle.trends.skroy.ru/analysis/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Project-ID": getProjectId(),
      },
      body: JSON.stringify({
        prompt_type: getPromttId(),
        text: text,
      }),
    },
  ).then((res) => res.json());

  const responseSecond = await fetch(
    "https://oracle.trends.skroy.ru/analysis/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Project-ID": getProjectId(),
      },
      body: JSON.stringify({
        prompt_type: getPromttId(),
        text: text,
      }),
    },
  ).then((res) => res.json());

  const answerFirst = await responseFirst;
  const answerSecond = await responseSecond;

  return (
    {
      answerFirst: {
        text: responseFirst.data[0].text,
        title: responseFirst.data[0].title,
        description: responseFirst.data[0].description,
      },
      answerSecond: {
        text: responseSecond.data[0].text,
        title: responseSecond.data[0].title,
        description: responseSecond.data[0].description,
      },
    } || "Произошла ошибка"
  );
}
