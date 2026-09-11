import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div>
      <div className="bg-river-deep text-white px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-3">Riverside Community Hub</h1>
          <p className="text-river-mist text-lg">
            Youth programmes, a gym, meeting spaces, and a food-parcel donation
            drive, open to everyone in the neighbourhood.
          </p>
          <div className="flex gap-3 mt-6">
            <Link to="/book" className="bg-river-mid px-5 py-2 rounded font-medium">
              Book a facility
            </Link>
            <Link to="/donate" className="bg-white text-river-deep px-5 py-2 rounded font-medium">
              Donate
            </Link>
          </div>
        </div>
      </div>

      
      <svg viewBox="0 0 1200 40" className="w-full h-8" preserveAspectRatio="none">
        <path
          d="M0,20 Q150,5 300,20 T600,20 T900,20 T1200,20 L1200,40 L0,40 Z"
          fill="#4A9B8E"
          opacity="0.3"
        />
      </svg>

      <div className="max-w-3xl mx-auto px-8 py-12 space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-2">Programmes</h2>
          <p className="text-gray-600">
            Riverside runs after-school youth programmes, open gym sessions, and
            hosts community events in our Main Hall. Facilities and equipment can
            be booked by any registered member.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">Membership</h2>
          <p className="text-gray-600">
            Sign up for free to book rooms and equipment, track your membership
            status, and support our donation drives.
          </p>
          <Link to="/signup" className="text-river-deep font-medium inline-block mt-2">
            Become a member
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">Winter Food Parcels 2026</h2>
          <p className="text-gray-600">
            We're raising funds to provide food parcels to families in need this
            winter. Every donation helps.
          </p>
          <Link to="/donate" className="text-river-deep font-medium inline-block mt-2">
            See progress and donate
          </Link>
        </div>
      </div>
    </div>
  );
}