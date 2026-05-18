"use client"

import { useEffect, useRef } from "react"

const VENDOR_SCRIPTS = [
  "/template/assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "/template/assets/vendor/aos/aos.js",
  "/template/assets/vendor/glightbox/js/glightbox.min.js",
  "/template/assets/vendor/purecounter/purecounter_vanilla.js",
  "/template/assets/vendor/swiper/swiper-bundle.min.js",
]

export default function TemplateScripts() {
  const cleanupRef = useRef<(() => void)[]>([])

  useEffect(() => {
    let mounted = true
    const cleanupFns: (() => void)[] = []

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }
        const script = document.createElement("script")
        script.src = src
        script.async = true
        script.onload = () => { if (mounted) resolve() }
        script.onerror = () => reject(new Error(`Failed to load ${src}`))
        document.body.appendChild(script)
        cleanupFns.push(() => {
          if (script.parentNode) script.parentNode.removeChild(script)
        })
      })
    }

    const initTemplate = async () => {
      try {
        for (const src of VENDOR_SCRIPTS) {
          if (!mounted) return
          await loadScript(src)
        }

        if (!mounted) return
        await new Promise((r) => setTimeout(r, 100))

        // Header scroll
        const header = document.querySelector("#header") as HTMLElement | null
        const handleScroll = () => {
          if (!header) return
          if (!header.classList.contains("scroll-up-sticky") && !header.classList.contains("sticky-top") && !header.classList.contains("fixed-top")) return
          document.body.classList.toggle("scrolled", window.scrollY > 100)
        }
        window.addEventListener("scroll", handleScroll)
        handleScroll()
        cleanupFns.push(() => {
          window.removeEventListener("scroll", handleScroll)
          document.body.classList.remove("scrolled")
        })

        // Mobile nav
        const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle") as HTMLElement | null
        const handleMobileNav = () => {
          document.body.classList.toggle("mobile-nav-active")
          mobileNavToggleBtn?.classList.toggle("bi-list")
          mobileNavToggleBtn?.classList.toggle("bi-x")
        }
        if (mobileNavToggleBtn) {
          mobileNavToggleBtn.addEventListener("click", handleMobileNav)
          cleanupFns.push(() => {
            mobileNavToggleBtn.removeEventListener("click", handleMobileNav)
            document.body.classList.remove("mobile-nav-active")
          })
        }

        // Navmenu links
        const handleNavClick = () => {
          if (document.body.classList.contains("mobile-nav-active") && mobileNavToggleBtn) {
            document.body.classList.remove("mobile-nav-active")
            mobileNavToggleBtn.classList.add("bi-list")
            mobileNavToggleBtn.classList.remove("bi-x")
          }
        }
        document.querySelectorAll("#navmenu a").forEach((el) => {
          el.addEventListener("click", handleNavClick)
        })
        cleanupFns.push(() => {
          document.querySelectorAll("#navmenu a").forEach((el) => {
            el.removeEventListener("click", handleNavClick)
          })
        })

        // Dropdowns
        const handleDropdown = (e: Event) => {
          e.preventDefault()
          const target = e.currentTarget as HTMLElement
          target.parentNode?.classList.toggle("active")
          target.parentElement?.nextElementSibling?.classList.toggle("dropdown-active")
          e.stopImmediatePropagation()
        }
        document.querySelectorAll(".navmenu .toggle-dropdown").forEach((el) => {
          el.addEventListener("click", handleDropdown)
        })
        cleanupFns.push(() => {
          document.querySelectorAll(".navmenu .toggle-dropdown").forEach((el) => {
            el.removeEventListener("click", handleDropdown)
          })
        })

        // Scroll top button
        const scrollTopBtn = document.querySelector(".scroll-top") as HTMLElement | null
        const handleScrollTopClick = (e: Event) => {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        const handleScrollTop = () => {
          scrollTopBtn?.classList.toggle("active", window.scrollY > 100)
        }
        if (scrollTopBtn) {
          scrollTopBtn.addEventListener("click", handleScrollTopClick)
          window.addEventListener("scroll", handleScrollTop)
          handleScrollTop()
          cleanupFns.push(() => {
            scrollTopBtn.removeEventListener("click", handleScrollTopClick)
            window.removeEventListener("scroll", handleScrollTop)
            scrollTopBtn.classList.remove("active")
          })
        }

        // AOS
        if (typeof window !== "undefined" && (window as any).AOS) {
          ;(window as any).AOS.init({ duration: 600, easing: "ease-in-out", once: true, mirror: false })
        }

        // GLightbox
        if (typeof window !== "undefined" && (window as any).GLightbox) {
          ;(window as any).GLightbox({ selector: ".glightbox" })
        }

        // PureCounter
        if (typeof window !== "undefined" && (window as any).PureCounter) {
          new (window as any).PureCounter()
        }

        // FAQ
        const handleFaqClick = () => {
          ;(event?.currentTarget as HTMLElement)?.parentElement?.classList.toggle("faq-active")
        }
        document.querySelectorAll(".faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header").forEach((el) => {
          el.addEventListener("click", handleFaqClick)
        })
        cleanupFns.push(() => {
          document.querySelectorAll(".faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header").forEach((el) => {
            el.removeEventListener("click", handleFaqClick)
          })
        })

        cleanupRef.current = cleanupFns
      } catch (err) {
        console.error("Failed to init template:", err)
      }
    }

    initTemplate()

    return () => {
      mounted = false
      cleanupRef.current.forEach((fn) => fn())
      cleanupRef.current = []
    }
  }, [])

  return null
}
