import { Link } from 'react-router-dom';
import { Users, Calendar, HeartHandshake } from 'lucide-react';

export function Home() {
  return (
    <div>
      
      <div className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-river-mist">
        <svg
          viewBox="0 0 1200 500"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMax slice"
        >
          
          <path d="M0,320 Q300,260 600,300 T1200,290 L1200,500 L0,500 Z" fill="#8FBFA8" opacity="0.5" />
          
          <path d="M0,360 Q250,310 550,350 T1200,340 L1200,500 L0,500 Z" fill="#4A9B8E" opacity="0.6" />
        
          <path
            d="M0,430 Q300,390 600,430 T1200,420 L1200,500 L0,500 Z"
            fill="#1B4B5A"
            opacity="0.85"
          />
          
          <g className="animate-drift">
            <ellipse cx="180" cy="90" rx="60" ry="18" fill="white" opacity="0.8" />
            <ellipse cx="230" cy="80" rx="40" ry="14" fill="white" opacity="0.8" />
          </g>
          <g className="animate-drift-slow">
            <ellipse cx="900" cy="130" rx="70" ry="20" fill="white" opacity="0.7" />
            <ellipse cx="960" cy="120" rx="45" ry="15" fill="white" opacity="0.7" />
          </g>
        </svg>

        <div className="relative max-w-3xl mx-auto px-8 pt-24 pb-40 text-center">
          <h1 className="text-4xl font-semibold text-river-deep mb-3">
            Riverside Community Hub
          </h1>
          <p className="text-river-deep/80 text-lg max-w-xl mx-auto">
            Youth programmes, a gym, meeting spaces, and a food-parcel donation
            drive — open to everyone in the neighbourhood.
          </p>
          <div className="flex gap-3 justify-center mt-7">
            <Link
              to="/book"
              className="bg-river-deep text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-shadow"
            >
              Book a facility
            </Link>
            <Link
              to="/donate"
              className="bg-white text-river-deep px-6 py-2.5 rounded-lg font-medium border border-river-deep/20 hover:border-river-deep/40 transition-colors"
            >
              Donate
            </Link>
          </div>
        </div>
      </div>

      
      <div className="max-w-5xl mx-auto px-8 -mt-16 relative pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl p-6 border border-river-mid/15 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="w-11 h-11 rounded-lg bg-river-mist flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-river-deep" />
            </div>
            <h2 className="font-medium text-lg mb-2">Programmes</h2>
            <p className="text-gray-600 text-sm mb-4">
              After-school youth programmes, open gym sessions, and community
              events in our Main Hall — book rooms and equipment as a member.
            </p>
            <Link to="/book" className="text-river-deep text-sm font-medium">
              View facilities →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-river-mid/15 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="w-11 h-11 rounded-lg bg-river-mist flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-river-deep" />
            </div>
            <h2 className="font-medium text-lg mb-2">Membership</h2>
            <p className="text-gray-600 text-sm mb-4">
              Sign up for free to book rooms and equipment, track your
              membership status, and stay in the loop on what's on.
            </p>
            <Link to="/signup" className="text-river-deep text-sm font-medium">
              Become a member 
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 border border-river-mid/15 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="w-11 h-11 rounded-lg bg-river-clay/20 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5 text-river-clay" />
            </div>
            <h2 className="font-medium text-lg mb-2">Winter Food Parcels</h2>
            <p className="text-gray-600 text-sm mb-4">
              We're raising R50,000 to provide food parcels to families in
              need this winter. Every donation helps.
            </p>
            <Link to="/donate" className="text-river-deep text-sm font-medium">
              See progress and donate →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}