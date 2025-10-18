// @ts-nocheck
import React from 'react';
import { useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Linkedin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import ContactForm from '../components/forms/ContactForm';

const ContactPage: React.FC = () => {
  // Add animated heading styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Manrope:wght@700;800&display=swap');

      .animated-gradient-text-light {
        background-image: linear-gradient(
          90deg,
          #fff 0%,
          #fff 28%,
          #FF5722 50%,
          #fff 72%,
          #fff 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        background-size: 200% 100%;
        animation: sheen-move 3s ease-in-out infinite;
      }

      .animated-gradient-text {
        background-image: linear-gradient(
          90deg,
          #111 0%,
          #111 28%,
          #FF5722 50%,
          #111 72%,
          #111 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        background-size: 200% 100%;
        animation: sheen-move 3s ease-in-out infinite;
      }

      @keyframes sheen-move {
        0%   { background-position: 200% 0; }
        50%  { background-position: 100% 0; }
        100% { background-position: -200% 0; }
      }

      .heading-underline {
        position: absolute;
        left: 0;
        right: 0;
        height: 3px;
        bottom: -8px;
        border-radius: 9999px;
        background: linear-gradient(
          90deg,
          rgba(255,87,34,0) 0%,
          rgba(255,87,34,.85) 35%,
          rgba(255,87,34,.85) 65%,
          rgba(255,87,34,0) 100%
        );
        transform-origin: left;
        transform: scaleX(0);
        animation: underline-reveal 3s ease forwards 400ms;
        opacity: 0.95;
      }

      @keyframes underline-reveal {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
    `;
    // Add unique key to force re-render on page reload
    style.id = `animated-headings-${Date.now()}`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#FF5722] to-[#E64A19] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: '"Inter Tight","Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }}
          >
            <span className="animated-gradient-text-light relative inline-block">
              Contact Us
              <span className="heading-underline" />
            </span>
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Ready to transform your brand? Let's start a conversation about your goals and how we can help you achieve them.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <p className="text-sm text-gray-600 mb-8">
                  We're here to help you build a stronger brand and grow your business. 
                  Reach out to us through any of the channels below.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF5722] p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@solvexstudios.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#FF5722] p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <p className="text-gray-600">+233 XX XXX XXXX</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM GMT</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#FF5722] p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600">Accra, Ghana</p>
                    <p className="text-sm text-gray-500">Serving clients across West Africa</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#FF5722] p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a
                    href="https://linkedin.com/company/solvexstudios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 p-3 rounded-lg hover:bg-[#FF5722] hover:text-white transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://instagram.com/solvexstudios/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 p-3 rounded-lg hover:bg-[#FF5722] hover:text-white transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://x.com/solvexstudios?s=21"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 p-3 rounded-lg hover:bg-[#FF5722] hover:text-white transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61579955124585&sk=about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 p-3 rounded-lg hover:bg-[#FF5722] hover:text-white transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://youtube.com/@solvexstudios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 p-3 rounded-lg hover:bg-[#FF5722] hover:text-white transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 
              className="text-3xl font-bold text-gray-900 mb-4"
              style={{ fontFamily: '"Inter Tight","Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }}
            >
              <span className="animated-gradient-text relative inline-block">
                Frequently Asked Questions
                <span className="heading-underline" />
              </span>
            </h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
            <p className="text-sm text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">How quickly can you start a project?</h3>
              <p className="text-gray-600">
                We typically begin new projects within 1-2 weeks of contract signing, depending on our current workload and project complexity.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Do you work with international clients?</h3>
              <p className="text-gray-600">
                Yes! While we're based in Ghana, we work with clients across Africa and internationally through digital collaboration tools.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What's included in your service packages?</h3>
              <p className="text-gray-600">
                Each service package is customized to your needs. We provide detailed proposals outlining deliverables, timelines, and costs before starting any project.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Do you offer ongoing support after project completion?</h3>
              <p className="text-gray-600">
                Absolutely! We offer various maintenance and support packages to ensure your brand continues to perform optimally after launch.
              </p>
            </div>
          </div> 
        </div>
      </section>
    </div>
  );
};

export default ContactPage;