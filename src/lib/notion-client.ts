const NOTION_VERSION = '2022-06-28';

export interface NotionPage {
  properties: Record<string, any>;
  last_edited_time: string;
}

export async function queryNotionDatabase(databaseId: string): Promise<NotionPage[]> {
  const token = import.meta.env.NOTION_TOKEN;
  if (!token) throw new Error(`Falta NOTION_TOKEN en el entorno de build`);

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  });
  if (!res.ok) {
    throw new Error(`Notion API (${databaseId}) respondió ${res.status}`);
  }
  const data = await res.json();
  return data.results as NotionPage[];
}
