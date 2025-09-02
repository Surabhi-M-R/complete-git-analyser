import Link from "next/link"
import { Linkedin, Youtube, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

const socials = [
  { name: "LinkedIn", href: "#", Icon: Linkedin },
  { name: "YouTube", href: "#", Icon: Youtube },
  { name: "Facebook", href: "#", Icon: Facebook },
  { name: "Twitter", href: "#", Icon: Twitter },
  { name: "Instagram", href: "#", Icon: Instagram },
]

export default function Footer() {
  return (
    <footer role="contentinfo" className="relative z-10 w-full border-t border-neutral-800 bg-black text-gray-300">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Top links */}
        <nav aria-label="Footer navigation" className="mb-6">
          <ul className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <li>
              <Link href="#" className="transition-colors hover:text-emerald-400">
                Blog
              </Link>
            </li>
            <li>
              <Link href="#" className="transition-colors hover:text-emerald-400">
                Our Team
              </Link>
            </li>
            <li>
              <Link href="#" className="transition-colors hover:text-emerald-400">
                About
              </Link>
            </li>
            <li>
              <Link href="#" className="transition-colors hover:text-emerald-400">
                Testimonials
              </Link>
            </li>
            <li>
              <Link href="#" className="transition-colors hover:text-emerald-400">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Social icons with labels */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-8">
          {socials.map(({ name, href, Icon }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Link
                href={href}
                aria-label={name}
                className="grid h-12 w-12 place-items-center rounded-full bg-neutral-900 text-white ring-1 ring-neutral-800 transition-colors hover:text-emerald-400 hover:ring-emerald-500"
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </Link>
              <span className="text-xs text-gray-400">{name}</span>
            </div>
          ))}
        </div>

        {/* Headline and subtext */}
        <div className="mb-8 text-center">
          <h3 className="text-pretty text-xl font-semibold text-white">We’re based in Cyberspace.</h3>
          <p className="mt-1 text-sm text-gray-400">We work with teams worldwide. Get in touch with us!</p>
        </div>

        {/* Contact row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            <Link href="mailto:hello@example.com" className="text-sm font-medium text-emerald-400 hover:underline">
              hello@example.com
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-300">(555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
            <span className="text-sm text-gray-300">123 Matrix Lane, Cyberspace, 00000</span>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-neutral-800 pt-4">
          <p className="text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
