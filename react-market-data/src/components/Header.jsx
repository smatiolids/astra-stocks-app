import { Popover } from '@headlessui/react';
import {
  MenuIcon,
} from '@heroicons/react/outline';
import { Link } from 'react-router-dom';



export default function Header() {
  return (
    <Popover className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <a href="#">
              <span className="sr-only">Workflow</span>
              <img
                className="h-8 w-auto sm:h-10"
                src="https://cdn.sanity.io/images/bbnkhnhl/production/0aca4ab89cbc141ecb0424ce0891a73862f5d774-160x25.svg?w=384&q=75&fit=clip&auto=format"
                alt=""
              />
            </a>
          </div>
          <div className="-mr-2 -my-2 md:hidden">
            <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="sr-only">Open menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <Popover.Group as="nav" className="hidden md:flex space-x-10">
            <Link
              to="/symbols"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Symbols
            </Link>

            <Link
              to="/chart"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Trades Chart
            </Link>

            <Link
              to="/real-time"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Last Quote
            </Link>

            <Link
              to="/last-trades"
              className="text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Trades by Symbol
            </Link>
          </Popover.Group>
        </div>
      </div>

     
    </Popover>
  );
}
