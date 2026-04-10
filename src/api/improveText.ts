const getProjectId = (): string => {
  const id = import.meta.env.VITE_SYNORA_PROJECT_ID?.trim()
  if (!id) {
    throw new Error('VITE_SYNORA_PROJECT_ID is required (header: Project-ID)')
  }
  return id
}

const getPromttId = (): string => {
  const id = import.meta.env.VITE_PROMT_ID?.trim()
  if (!id) {
    throw new Error('VITE_PROMT_ID is required (header: Project-ID)')
  }
  return id
}

export async function improveText(text: string): Promise<string>{
    const response = await fetch('https://oracle.trends.skroy.ru/analysis/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Project-ID': getProjectId(),
    },
    body: JSON.stringify({
        prompt_type: getPromttId(),
        text: text
    })
    }).then(res => res.json())

    return await response.data[0].text || "Произошла ошибка"
}