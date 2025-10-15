'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* À propos */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Toubabi</h3>
            <p className="mb-4 text-sm text-gray-600">
              La plateforme immobilière de référence en Côte d'Ivoire pour trouver
              votre bien idéal.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-blue-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-pink-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 transition-colors hover:text-blue-700"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/biens"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Biens disponibles
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/estimation"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Estimation de projet
                </Link>
              </li>
              <li>
                <Link
                  href="/construire"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Construire
                </Link>
              </li>
              <li>
                <Link
                  href="/vendre"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Vendre un bien
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/apropos"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/motdupresident"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Mot du président
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/politiqueretour"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  Politique de retour
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="text-gray-600">
                  Abidjan, Côte d'Ivoire
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <a
                  href="tel:+2250585325050"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  +225 05 85 32 50 50
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <a
                  href="mailto:contact@toubabi.com"
                  className="text-gray-600 transition-colors hover:text-blue-600"
                >
                  contact@toubabi.com
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/contactez-nous"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} Toubabi. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

