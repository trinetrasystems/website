import React from 'react';

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/919265296453?text=Hi%20Trinetra%20team,%20I'm%20interested%20in%20your%20AI%20surveillance%20solutions.%20Could%20you%20provide%20more%20details?"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#128C7E] focus:ring-offset-2 animate-float group"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8"
      >
        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.146.564 4.195 1.637 6.012L.15 23.473l5.59-1.464c1.761 1.002 3.75 1.528 5.82 1.528h.005C18.614 23.537 24 18.152 24 11.506 24 8.283 22.748 5.253 20.47 2.97 18.191.688 15.163 0 12.031 0zm0 1.954c2.585 0 5.016.997 6.844 2.825A9.554 9.554 0 0 1 21.69 11.5c0 5.244-4.267 9.511-9.513 9.511h-.005c-1.749 0-3.468-.456-5.002-1.34l-.36-.214-3.71.972.99-3.62-.234-.37A9.458 9.458 0 0 1 1.956 11.5C1.956 6.256 6.223 1.954 12.03 1.954zm-4.708 3.713c-.22.002-.54.08-.823.382-.284.303-1.087 1.062-1.087 2.59 0 1.528 1.115 3.006 1.272 3.21.157.202 2.18 3.447 5.358 4.747 2.155.88 2.89.739 3.407.674.522-.065 1.693-.692 1.933-1.362.24-.67.24-1.24.168-1.362-.072-.12-.275-.192-.577-.344-.303-.151-1.792-.885-2.07-.986-.277-.101-.48-.152-.682.152-.202.303-.78 1.02-.958 1.222-.178.202-.356.228-.66.076-.303-.15-1.28-.47-2.438-1.503-.9-1.01-1.506-1.92-1.684-2.222-.178-.303-.02-.468.132-.619.135-.135.303-.35.454-.53.152-.177.202-.303.303-.505.101-.202.05-.38-.025-.53-.076-.152-.682-1.646-.933-2.253-.251-.607-.506-.525-.682-.534-.176-.01-.378-.01-.58-.01z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
