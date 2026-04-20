import * as React from "react"

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { UpdateAttachmentsList } from "@/src/components/common/UpdateAttachmentsList"

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock do Next Image para facilitar o teste de src e alt
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} priority={props.priority ? "true" : undefined} />
}))

const mockAttachments = [
  {
    id: "a1",
    name: "image1.jpg",
    url: "http://example.com/1.jpg",
    type: "IMAGE" as const,
    size: 500000,
    mimeType: "image/jpeg"
  },
  {
    id: "a2",
    name: "image2.png",
    url: "http://example.com/2.png",
    type: "IMAGE" as const,
    size: 2000000,
    mimeType: "image/png"
  },
  {
    id: "a3",
    name: "document.pdf",
    url: "http://example.com/doc.pdf",
    type: "DOCUMENT" as const,
    size: 1500000,
    mimeType: "application/pdf"
  }
]

describe("UpdateAttachmentsList", () => {
  it("renders files and images with correct sizes", () => {
    render(<UpdateAttachmentsList attachments={mockAttachments as any} />)
    
    expect(screen.getByText("image1.jpg")).toBeInTheDocument()
    expect(screen.getByText("open_image • 488.3 KB")).toBeInTheDocument()
    
    expect(screen.getByText("image2.png")).toBeInTheDocument()
    expect(screen.getByText("open_image • 1.9 MB")).toBeInTheDocument()
    
    expect(screen.getByText("document.pdf")).toBeInTheDocument()
    expect(screen.getByText("open_file • 1.4 MB")).toBeInTheDocument()
  })

  it("opens gallery and navigates between images", () => {
    render(<UpdateAttachmentsList attachments={mockAttachments as any} />)
    
    // Abre a galeria na primeira imagem
    const image1Button = screen.getAllByRole("button")[0]
    fireEvent.click(image1Button)
    
    // Verifica se a imagem 1 está no dialog (o altText terá duas imagens: grid e dialog)
    const galleryImages1 = screen.getAllByAltText("image1.jpg")
    expect(galleryImages1.length).toBeGreaterThan(1)
    
    // Encontra os botões de navegação. 
    // Com 2 imagens na galeria, teremos botões de prev e next.
    const allButtons = screen.getAllByRole("button")
    const nextButton = allButtons[allButtons.length - 1] // Último botão é o 'Next'
    
    fireEvent.click(nextButton)
    
    // Após clicar 'Next', a imagem exibida deve ser a image2.png
    const galleryImages2 = screen.getAllByAltText("image2.png")
    expect(galleryImages2.length).toBeGreaterThan(1)

    // Clicar 'Prev' deve retornar à image1
    const prevButton = allButtons[allButtons.length - 2] // Penúltimo botão é o 'Prev'
    fireEvent.click(prevButton)
    
    const galleryImages1Again = screen.getAllByAltText("image1.jpg")
    expect(galleryImages1Again.length).toBeGreaterThan(1)
  })
})
