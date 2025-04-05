import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
} from '@headlessui/react';
import LandingPageA from "../components/landing/LandingA";
import LandingPageB from "../components/landing/LandingB";

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState("LandingPageA");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get("page");
    if (page) {
      setActivePage(page);
    }
  }, [location.search]);

  const renderContent = () => {
    switch (activePage) {
      case "LandingPageA":
        return <LandingPageA />;
      case "LandingPageB":
        return <LandingPageB />;
      default:
        return <LandingPageA />;
    }
  };

  return (
    <div className="flex flex-col h-screen z-10">
      {/* Header */}
      <header className="bg-black text-white ">
        <nav aria-label="Main Navigation" className="mx-auto flex justify-between items-center p-2">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Fit Ai</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <PopoverGroup className="flex gap-x-4">
            <a
              href="#"
              className="rounded-md px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-800"
            >
              Features
            </a>
            <a
              href="#"
              className="rounded-md px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-800"
            >
              Challenges
            </a>
            <a
              href="#"
              className="rounded-md px-3 py-2 text-sm font-semibold text-gray-100 hover:bg-gray-800"
            >
              Community
            </a>
          </PopoverGroup>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="content z-1">
        {renderContent()}
      </main>
    </div>
  );
}
