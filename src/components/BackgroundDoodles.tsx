import React from 'react';

export const BackgroundDoodles: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10"
      aria-hidden="true"
    >
      {/* Soft gradient ambient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full bg-pink-100/60 blur-3xl" />
      <div className="absolute top-[20%] right-[-5%] w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full bg-purple-100/50 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[25%] w-[350px] h-[350px] md:w-[550px] md:h-[550px] rounded-full bg-amber-50/70 blur-3xl" />

      {/* Floating cute stars */}
      <div className="absolute top-12 left-8 text-amber-300 text-xl animate-twinkle">
        ✨
      </div>
      <div className="absolute top-28 right-12 text-pink-300 text-2xl animate-float-slow">
        ⭐
      </div>
      <div className="absolute top-1/3 left-6 text-purple-300 text-lg animate-float-reverse">
        ☁️
      </div>
      <div className="absolute top-1/2 right-8 text-amber-200 text-2xl animate-twinkle">
        ✨
      </div>
      <div className="absolute bottom-28 left-12 text-pink-200 text-2xl animate-float-slow">
        🌸
      </div>
      <div className="absolute bottom-16 right-16 text-purple-200 text-xl animate-float-reverse">
        ⭐
      </div>
      <div className="absolute top-3/4 left-1/4 text-amber-200 text-sm animate-twinkle">
        ✦
      </div>
      <div className="absolute top-1/4 right-1/4 text-pink-200 text-sm animate-twinkle">
        ✦
      </div>
    </div>
  );
};
