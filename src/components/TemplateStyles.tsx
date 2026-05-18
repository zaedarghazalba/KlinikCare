"use client"

import { useEffect } from "react"

const TEMPLATE_CSS = [
  "/template/assets/vendor/bootstrap/css/bootstrap.min.css",
  "/template/assets/vendor/bootstrap-icons/bootstrap-icons.css",
  "/template/assets/vendor/aos/aos.css",
  "/template/assets/vendor/glightbox/css/glightbox.min.css",
  "/template/assets/vendor/fontawesome-free/css/all.min.css",
  "/template/assets/vendor/swiper/swiper-bundle.min.css",
  "/template/assets/css/main.css",
]

const TEMPLATE_FONTS = "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"

export default function TemplateStyles() {
  useEffect(() => {
    const links: HTMLLinkElement[] = []

    const fontLink = document.createElement("link")
    fontLink.rel = "stylesheet"
    fontLink.href = TEMPLATE_FONTS
    document.head.appendChild(fontLink)
    links.push(fontLink)

    TEMPLATE_CSS.forEach((href) => {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      document.head.appendChild(link)
      links.push(link)
    })

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link)
        }
      })
    }
  }, [])

  return null
}
