import { logger } from "@/src/lib/logger"

import { env } from "@/src/config/env"

const AUTENTIQUE_TOKEN = env.AUTENTIQUE_TOKEN
const AUTENTIQUE_URL = env.AUTENTIQUE_URL

async function autentiqueRequest(
  query: string,
  variables: Record<string, unknown> = {}
) {
  if (!AUTENTIQUE_TOKEN) {
    throw new Error("AUTENTIQUE_TOKEN not configured")
  }

  const response = await fetch(AUTENTIQUE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTENTIQUE_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await response.json()

  if (json.errors) {
    logger.error({ errors: json.errors }, "Autentique API Error")
    throw new Error(json.errors[0]?.message || "Autentique API Error")
  }

  return json.data
}

export const autentique = {
  createDocument: async (
    name: string,
    fileUrl: string,
    signers: Array<{ name: string; email: string; role: string }>
  ) => {
    // Note: In real impl, we use name, fileUrl and signers to build the mutation
    logger.info(
      { name, fileUrl, signersCount: signers.length },
      "Creating Autentique document"
    )

    // Simplification for the architecture:
    return {
      id: "mock-autentique-id",
      link: "https://autentique.com.br/view/mock",
    }
  },

  listDocuments: async (page = 1) => {
    const query = `
      query {
        documents(limit: 60, page: ${page}) {
          data {
            id
            name
            created_at
          }
        }
      }
    `
    return autentiqueRequest(query)
  },

  getDocument: async (id: string) => {
    const query = `
      query {
        document(id: "${id}") {
          id
          name
          link
          status
          signers {
             public_id
             name
             email
             action { name }
          }
        }
      }
    `
    return autentiqueRequest(query)
  },
}
