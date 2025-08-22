import React from "react";
import Header from "./Header"; // your header component
import Footer from "./Footer"; // your footer component

const About = () => {
  return (
    <>
      <Header />

      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-12 space-y-12">
        {/* Section Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About OSCA</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Learn about the Office for Senior Citizens Affairs in San Jose, its
            mission, vision, and the services it provides to the community.
          </p>
        </div>

        {/* Preamble */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Preamble
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The Office for Senior Citizens Affairs (OSCA) is committed to
            ensuring the welfare, rights, and dignity of senior citizens. We aim
            to provide programs and services that enhance the quality of life of
            the elderly population in San Jose.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Mission
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To provide social services, programs, and activities that promote
              the welfare, security, and well-being of senior citizens in our
              community.
            </p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Vision
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To be a model local government unit in empowering senior citizens,
              ensuring their rights, and enhancing their participation in
              community development.
            </p>
          </div>
        </div>

        {/* Mandate */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Mandate</h2>
          <p className="text-gray-700 leading-relaxed">
            OSCA is mandated to implement programs and services for senior
            citizens, including health assistance, social pension, advocacy, and
            community integration initiatives as per RA 9994 – Expanded Senior
            Citizens Act.
          </p>
        </div>

        {/* Core Functions */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Core Functions
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Registration and issuance of senior citizen IDs.</li>
            <li>
              Monitoring and distribution of social pensions and benefits.
            </li>
            <li>
              Organization of senior citizen programs, seminars, and activities.
            </li>
            <li>Advocacy for senior citizens' rights and welfare.</li>
            <li>Data collection, reporting, and demographic studies.</li>
          </ul>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
