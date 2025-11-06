import { Award, Users, Camera, Heart } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Camera, value: '500+', label: 'Projects Completed' },
    { icon: Users, value: '300+', label: 'Happy Clients' },
    { icon: Award, value: '15+', label: 'Awards Won' },
    { icon: Heart, value: '100%', label: 'Passion Driven' }
  ];

  return (
    <section id="about" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">
              About Gangajal Production
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mb-8"></div>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              We are a passionate team of photographers and videographers dedicated to capturing
              life's most precious moments. With years of experience and a keen eye for detail,
              we transform ordinary moments into extraordinary memories.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Our approach combines technical expertise with artistic vision, ensuring every project
              receives the attention it deserves. Whether it's a product shoot, fashion campaign,
              or your special event, we bring creativity and professionalism to every frame.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-full font-semibold">
                Professional Equipment
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-full font-semibold">
                Creative Vision
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-full font-semibold">
                Fast Delivery
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="font-playfair text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
