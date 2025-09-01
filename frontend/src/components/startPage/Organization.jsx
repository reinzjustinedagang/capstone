import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import OrgChartNode from "./organization/OrgChartNode";
import StaffHeader from "../staff/layout/StaffHeader";
import Header from "./Header";
import Footer from "./Footer";
import slider5 from "../../assets/slider5.jpg";

ChartJS.register(ArcElement, Tooltip, Legend);

// Example Officials Data
const officials = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    position: "Municipal OSCA Head",
    photo: "/images/official1.jpg",
  },
  {
    id: 2,
    name: "Maria Santos",
    position: "Barangay OSCA Officer",
    photo: "/images/official2.jpg",
  },
  {
    id: 3,
    name: "Pedro Reyes",
    position: "Staff",
    photo: "/images/official3.jpg",
  },
];

// Example Demographics Data
const demographics = [
  { name: "Barangay 1", value: 120 },
  { name: "Barangay 2", value: 95 },
  { name: "Barangay 3", value: 60 },
  { name: "Barangay 4", value: 80 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

const fedOfficer = {
  name: "Marcelino G. Corpuz Jr.",
  title: "President",
  children: [
    {
      name: "Rosalinda D. Madriaga",
      title: "Vice President",
      children: [
        {
          name: "Estela Y. Pangilinan",
          title: "Treasurer",
          children: null,
        },
        {
          name: "Nestor Almedina",
          title: "P.R.O.",
          children: null,
        },
        {
          name: "Letecia G. Espiritu",
          title: "Auditor",
          children: null,
        },
        {
          name: "Galvanome Limcioco",
          title: "Business Manager",
          children: null,
        },
        {
          name: "Ofelia S. Santos",
          title: "B.O.D.",
          children: null,
        },
        {
          name: "Camilo A. Garcia Jr.",
          title: "B.O.D.",
          children: null,
        },
        {
          name: "Angelito B. Francisco",
          title: "B.O.D.",
          children: null,
        },
        {
          name: "Julieta S. Roncal",
          title: "B.O.D.",
          children: null,
        },
      ],
    },
  ],
};

const orgData = {
  name: "Atty. Rey C. Ladaga",
  title: "Municipal Mayor",
  children: [
    {
      name: "Marcelino G. Corpuz Jr.",
      title: "Office for Senior Citizens Affairs Head",
      children: [
        {
          name: "Cora P. De Lara",
          title: "Administrative Aide VI SG 6/8",
          children: null,
        },
        {
          name: "Esmeraldo D. Turquia Jr.",
          title: "Administrative Aide VI SG 3/7",
          children: null,
        },
        {
          name: "Margie P. Garcia",
          title: "Administrative Aide II (Messenger) SG 2/1",
          children: [
            {
              name: "Rosalinda D. Madriaga",
              title: "Administrative Assistant",
              children: null,
            },
            {
              name: "Ricardo A. Liboro",
              title: "Administrative Aide II",
              children: null,
            },
            {
              name: "Geffry M. Liboro",
              title: "Administrative Aide II",
              children: null,
            },
            {
              name: "Melwin D. Melgaso",
              title: "Administrative Aide II",
              children: null,
            },
          ],
        },
        {
          name: "Mariel Y. Palasigue",
          title: "Administrative Aide II",
          children: null,
        },
        {
          name: "Lily T. Clataro",
          title: "Administrative Aide II",
          children: null,
        },
        {
          name: "Ednalyn N. Awit",
          title: "Administrative Aide II",
          children: null,
        },
      ],
    },
  ],
};

const Organization = () => {
  const data = {
    labels: demographics.map((d) => d.name),
    datasets: [
      {
        data: demographics.map((d) => d.value),
        backgroundColor: COLORS,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <div>
      <Header />

      {/* Section Header */}
      <div className="text-center px-5 py-6 md:px-25 bg-white">
        <h2 className="text-3xl font-bold text-gray-900">Organization</h2>
        <p className="text-gray-600 mt-2">
          Meet our officials and see the demographic distribution of senior
          citizens in San Jose.
        </p>
      </div>

      {/* Officials Cards */}
      <div className="px-5 py-6 md:px-8 lg:px-25 bg-white">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Federation Officer
        </h3>
        <div className="overflow-x-auto w-full py-4 px-2">
          <div className="flex justify-center md:min-w-[1500px]">
            <OrgChartNode node={fedOfficer} isTopNode />
          </div>
        </div>
      </div>

      {/* Organizational Structure */}
      <div className="px-5 py-6 md:px-8 lg:px-25 bg-white">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Organizational Chart
        </h3>

        {/* Scrollable container for org chart */}
        <div className="overflow-x-auto w-full px-5 py-6 md:px-8 lg:px-25 bg-white">
          <div className="flex justify-center md:min-w-[1500px]">
            <OrgChartNode node={orgData} isTopNode />
          </div>
        </div>
      </div>

      {/* Demographics Chart */}
      <div className="bg-white px-5 py-6 md:px-8 lg:px-25">
        <h3 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Senior Citizens Demographics
        </h3>
        <div className="w-full max-w-md mx-auto">
          <Pie data={data} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Organization;
