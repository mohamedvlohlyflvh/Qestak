"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function LandingAnimations({ children }: { children: React.ReactNode }) {
  const pageRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.from("h1", {
      y: 60,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
    })
    gsap.from("h1 + p", {
      y: 30,
      autoAlpha: 0,
      duration: 0.7,
      delay: 0.25,
      ease: "power2.out",
    })
    gsap.from(".hero-cta > *", {
      y: 20,
      autoAlpha: 0,
      stagger: 0.15,
      delay: 0.5,
      duration: 0.5,
      ease: "power2.out",
    })

    const mm = gsap.matchMedia()
    mm.add("(min-width: 768px)", () => {
      gsap.from(".features-title", {
        y: 30,
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".features-title", start: "top 85%" },
      })
      gsap.from(".feature-card", {
        y: 50,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ".features-grid", start: "top 80%" },
      })
    })
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(["h1", "h1 + p", ".hero-cta > *", ".features-title", ".feature-card"], {
        y: 0,
        autoAlpha: 1,
      })
    })
  }, { scope: pageRef })

  return <div ref={pageRef}>{children}</div>
}
