export interface RedirectConfig {
  fromPath: string
  toPath: string
  statusCode: number
}

export async function fetchRedirects(): Promise<RedirectConfig[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetAllActiveRedirects {
            allActiveRedirects {
              fromPath
              toPath
              statusCode
            }
          }
        `,
      }),
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error('Failed to fetch redirects')
      return []
    }

    const { data } = await response.json()
    return data?.allActiveRedirects || []
  } catch (error) {
    console.error('Error fetching redirects:', error)
    return []
  }
}
