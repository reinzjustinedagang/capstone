// SeniorIntakeForm.jsx
import React, { useState } from "react";
import {
  LineInput,
  Section,
  Radio,
  Check,
} from "../../components/senior-citizen/components/Add";
import Header from "./Header";

export default function RegisterSenior() {
  const [data, setData] = useState({
    // Header
    province: "Occidental Mindoro",
    municipality: "San Jose",
    barangay: "",

    // Identifying info
    name: { last: "", suffix: "", first: "", middle: "" },
    address: {
      street: "",
      barangay: "",
      municipality: "",
      province: "",
      region: "",
    },
    dob: { year: "", month: "", day: "" },
    sex: "",
    placeOfBirth: "",
    civilStatus: "",
    programs: {
      dswd: false,
      pantawid: false,
      aics: false,
      localPension: false,
      livelihood: false,
      dateReceived: "",
      others: "",
    },
    indigenousGroup: "",
    education: "",
    idNumbers: {
      osca: "",
      gsis: "",
      tin: "",
      sss: "",
      philhealth: "",
      comelec: "",
      others: "",
    },
    monthlyIncome: "",
    incomeSources: {
      ownEarnings: false,
      spouseSalary: false,
      rentals: false,
      ownPension: false,
      ownPensionAmt: "",
      insurances: false,
      savings: false,
      stocksDividends: false,
      stocksDividendsAmt: "",
      spousePension: false,
      livestockOrchards: false,
      dependentOnChildren: false,
      others: "",
    },
    assets: {
      house: false,
      fishpondsResorts: false,
      lot: false,
      houseLot: false,
      commercialBuilding: false,
      farmland: false,
      others: "",
    },
    livingWith: {
      alone: false,
      commonLawSpouse: false,
      inLaws: false,
      spouse: false,
      grandchildren: false,
      careInstitutions: false,
      children: false,
      relatives: false,
      friends: false,
      others: "",
    },
    skills: "",
    community: {
      medical: false,
      neighborhoodSupport: false,
      resourceVolunteer: false,
      religious: false,
      communityBeautification: false,
      counselingReferral: false,
      communityLeader: false,
      sponsorship: false,
      others: "",
    },
  });

  const set = (path, value) => {
    // tiny helper to update nested state like set("name.last", "Doe")
    setData((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys.at(-1)] = value;
      return copy;
    });
  };

  const onCheck = (path) => (e) => set(path, e.target.checked);
  const onChange = (path) => (e) => set(path, e.target.value);

  const submit = (e) => {
    e.preventDefault();
    console.log("Form data:", data);
    alert("Form captured! Check console for JSON.");
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6 print:p-0 text-gray-900">
        {/* Top heading */}
        <div className="text-center mb-4">
          <div className="text-sm">Republic of the Philippines</div>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <LineInput
              label="Barangay"
              value={data.barangay}
              onChange={onChange("barangay")}
            />
            <LineInput
              label="Municipality"
              value={data.municipality}
              onChange={onChange("municipality")}
            />
            <LineInput
              label="Province"
              value={data.province}
              onChange={onChange("province")}
            />
          </div>
          <h2 className="mt-4 font-bold text-lg tracking-wide">
            SENIOR CITIZENS GENERAL INTAKE SHEET
          </h2>
          <p className="text-xs text-gray-600">
            (Please answer appropriately and legibly)
          </p>
        </div>

        <form onSubmit={submit} className="bg-white">
          {/* I. Identifying Information */}
          <Section title="I. IDENTIFYING INFORMATION">
            {/* Name row */}
            <div className="grid grid-cols-4 gap-3">
              <LineInput
                label="Last Name"
                value={data.name.last}
                onChange={onChange("name.last")}
              />
              <LineInput
                label="Suffix"
                value={data.name.suffix}
                onChange={onChange("name.suffix")}
              />
              <LineInput
                label="First Name"
                value={data.name.first}
                onChange={onChange("name.first")}
              />
              <LineInput
                label="Middle Name"
                value={data.name.middle}
                onChange={onChange("name.middle")}
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-3 gap-3">
              <LineInput
                label="House No. & Street Name"
                value={data.address.street}
                onChange={onChange("address.street")}
                className="col-span-3 sm:col-span-1"
              />
              <LineInput
                label="Barangay/District"
                value={data.address.barangay}
                onChange={onChange("address.barangay")}
              />
              <LineInput
                label="Municipality/City"
                value={data.address.municipality}
                onChange={onChange("address.municipality")}
              />
              <LineInput
                label="Province"
                value={data.address.province}
                onChange={onChange("address.province")}
              />
              <LineInput
                label="Region"
                value={data.address.region}
                onChange={onChange("address.region")}
              />
            </div>

            {/* DOB + Sex */}
            <div className="grid grid-cols-6 gap-3">
              <LineInput
                label="Date of Birth (Year)"
                value={data.dob.year}
                onChange={onChange("dob.year")}
              />
              <LineInput
                label="Month"
                value={data.dob.month}
                onChange={onChange("dob.month")}
              />
              <LineInput
                label="Day"
                value={data.dob.day}
                onChange={onChange("dob.day")}
              />
              <div className="col-span-3">
                <div className="text-[11px] text-gray-700 mb-1">Sex</div>
                <Radio
                  name="sex"
                  value={data.sex}
                  setValue={(v) => set("sex", v)}
                  options={["Male", "Female"]}
                />
              </div>
            </div>

            <LineInput
              label="Place of Birth"
              value={data.placeOfBirth}
              onChange={onChange("placeOfBirth")}
            />

            <div>
              <div className="text-[11px] text-gray-700 mb-1">Civil Status</div>
              <Radio
                name="civil"
                value={data.civilStatus}
                setValue={(v) => set("civilStatus", v)}
                options={["Single", "Married", "Widow/Widower", "Separated"]}
              />
            </div>

            {/* Programs and services */}
            <div>
              <div className="text-[11px] text-gray-700 mb-1">
                Programs & Services Received
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Check
                  label="DSWD Social Pension"
                  checked={data.programs.dswd}
                  onChange={onCheck("programs.dswd")}
                />
                <Check
                  label="Pantawid"
                  checked={data.programs.pantawid}
                  onChange={onCheck("programs.pantawid")}
                />
                <Check
                  label="AICS (financial, burial, medical & transportation)"
                  checked={data.programs.aics}
                  onChange={onCheck("programs.aics")}
                />
                <Check
                  label="Local Social Pension"
                  checked={data.programs.localPension}
                  onChange={onCheck("programs.localPension")}
                />
                <Check
                  label="Livelihood Assistance"
                  checked={data.programs.livelihood}
                  onChange={onCheck("programs.livelihood")}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <LineInput
                  label="Date received"
                  value={data.programs.dateReceived}
                  onChange={onChange("programs.dateReceived")}
                />
                <LineInput
                  label="Others (please specify)"
                  value={data.programs.others}
                  onChange={onChange("programs.others")}
                />
              </div>
            </div>

            <LineInput
              label="Indigenous People Group (please specify)"
              value={data.indigenousGroup}
              onChange={onChange("indigenousGroup")}
            />

            <div>
              <div className="text-[11px] text-gray-700 mb-1">
                Educational Attainment
              </div>
              <Radio
                name="education"
                value={data.education}
                setValue={(v) => set("education", v)}
                options={[
                  "Elementary Level",
                  "Elementary Graduate",
                  "High School Level",
                  "High School Graduate",
                  "College Level",
                  "College Graduate",
                  "Vocational",
                  "Post Graduate",
                  "Not Attended Any School",
                ]}
              />
            </div>

            {/* ID Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <LineInput
                label="OSCA"
                value={data.idNumbers.osca}
                onChange={onChange("idNumbers.osca")}
              />
              <LineInput
                label="GSIS"
                value={data.idNumbers.gsis}
                onChange={onChange("idNumbers.gsis")}
              />
              <LineInput
                label="TIN"
                value={data.idNumbers.tin}
                onChange={onChange("idNumbers.tin")}
              />
              <LineInput
                label="SSS"
                value={data.idNumbers.sss}
                onChange={onChange("idNumbers.sss")}
              />
              <LineInput
                label="PhilHealth"
                value={data.idNumbers.philhealth}
                onChange={onChange("idNumbers.philhealth")}
              />
              <LineInput
                label="ComElec"
                value={data.idNumbers.comelec}
                onChange={onChange("idNumbers.comelec")}
              />
              <LineInput
                label="Others"
                value={data.idNumbers.others}
                onChange={onChange("idNumbers.others")}
                className="sm:col-span-3"
              />
            </div>

            {/* Monthly income */}
            <LineInput
              label="Monthly Income (in Philippine Peso)"
              value={data.monthlyIncome}
              onChange={onChange("monthlyIncome")}
            />

            <div>
              <div className="text-[11px] text-gray-700 mb-1">
                Source of Income & Assistance (check all applicable)
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Check
                  label="Own earnings, salaries/wages"
                  checked={data.incomeSources.ownEarnings}
                  onChange={onCheck("incomeSources.ownEarnings")}
                />
                <Check
                  label="Spouse's salary"
                  checked={data.incomeSources.spouseSalary}
                  onChange={onCheck("incomeSources.spouseSalary")}
                />
                <Check
                  label="Rentals/Sharecrops"
                  checked={data.incomeSources.rentals}
                  onChange={onCheck("incomeSources.rentals")}
                />
                <Check
                  label="Own pension"
                  checked={data.incomeSources.ownPension}
                  onChange={onCheck("incomeSources.ownPension")}
                >
                  {data.incomeSources.ownPension && (
                    <input
                      className="ml-2 border-b border-gray-500 focus:outline-none text-sm"
                      placeholder="specify amt."
                      value={data.incomeSources.ownPensionAmt}
                      onChange={onChange("incomeSources.ownPensionAmt")}
                    />
                  )}
                </Check>
                <Check
                  label="Insurances"
                  checked={data.incomeSources.insurances}
                  onChange={onCheck("incomeSources.insurances")}
                />
                <Check
                  label="Savings"
                  checked={data.incomeSources.savings}
                  onChange={onCheck("incomeSources.savings")}
                />
                <Check
                  label="Stocks/Dividends"
                  checked={data.incomeSources.stocksDividends}
                  onChange={onCheck("incomeSources.stocksDividends")}
                >
                  {data.incomeSources.stocksDividends && (
                    <input
                      className="ml-2 border-b border-gray-500 focus:outline-none text-sm"
                      placeholder="specify amt."
                      value={data.incomeSources.stocksDividendsAmt}
                      onChange={onChange("incomeSources.stocksDividendsAmt")}
                    />
                  )}
                </Check>
                <Check
                  label="Spouse pension"
                  checked={data.incomeSources.spousePension}
                  onChange={onCheck("incomeSources.spousePension")}
                />
                <Check
                  label="Livestock/Orchards"
                  checked={data.incomeSources.livestockOrchards}
                  onChange={onCheck("incomeSources.livestockOrchards")}
                />
                <Check
                  label="Dependent on children/relatives"
                  checked={data.incomeSources.dependentOnChildren}
                  onChange={onCheck("incomeSources.dependentOnChildren")}
                />
              </div>
              <LineInput
                className="mt-2"
                label="Others (please specify)"
                value={data.incomeSources.others}
                onChange={onChange("incomeSources.others")}
              />
            </div>
          </Section>

          {/* III. Economic Status */}
          <Section title="III. ECONOMIC STATUS">
            {/* A. Assets & Properties */}
            <div>
              <div className="text-[11px] text-gray-700 mb-1">
                A. Assets & Properties (check all applicable)
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Check
                  label="House"
                  checked={data.assets.house}
                  onChange={onCheck("assets.house")}
                />
                <Check
                  label="Fishponds/Resorts"
                  checked={data.assets.fishpondsResorts}
                  onChange={onCheck("assets.fishpondsResorts")}
                />
                <Check
                  label="Lot"
                  checked={data.assets.lot}
                  onChange={onCheck("assets.lot")}
                />
                <Check
                  label="House & Lot"
                  checked={data.assets.houseLot}
                  onChange={onCheck("assets.houseLot")}
                />
                <Check
                  label="Commercial Building"
                  checked={data.assets.commercialBuilding}
                  onChange={onCheck("assets.commercialBuilding")}
                />
                <Check
                  label="Farmland"
                  checked={data.assets.farmland}
                  onChange={onCheck("assets.farmland")}
                />
              </div>
              <LineInput
                className="mt-2"
                label="Others, specify"
                value={data.assets.others}
                onChange={onChange("assets.others")}
              />
            </div>

            {/* B. Living / Residing With */}
            <div>
              <div className="text-[11px] text-gray-700 mb-1">
                B. Living / Residing With (check all applicable)
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                <Check
                  label="Alone"
                  checked={data.livingWith.alone}
                  onChange={onCheck("livingWith.alone")}
                />
                <Check
                  label="Common Law Spouse"
                  checked={data.livingWith.commonLawSpouse}
                  onChange={onCheck("livingWith.commonLawSpouse")}
                />
                <Check
                  label="In laws"
                  checked={data.livingWith.inLaws}
                  onChange={onCheck("livingWith.inLaws")}
                />
                <Check
                  label="Spouse"
                  checked={data.livingWith.spouse}
                  onChange={onCheck("livingWith.spouse")}
                />
                <Check
                  label="Grandchildren"
                  checked={data.livingWith.grandchildren}
                  onChange={onCheck("livingWith.grandchildren")}
                />
                <Check
                  label="Care Institutions"
                  checked={data.livingWith.careInstitutions}
                  onChange={onCheck("livingWith.careInstitutions")}
                />
                <Check
                  label="Children"
                  checked={data.livingWith.children}
                  onChange={onCheck("livingWith.children")}
                />
                <Check
                  label="Relatives"
                  checked={data.livingWith.relatives}
                  onChange={onCheck("livingWith.relatives")}
                />
                <Check
                  label="Friends"
                  checked={data.livingWith.friends}
                  onChange={onCheck("livingWith.friends")}
                />
              </div>
              <LineInput
                className="mt-2"
                label="Others, specify"
                value={data.livingWith.others}
                onChange={onChange("livingWith.others")}
              />
            </div>

            {/* C. Areas of Specialization / Skills */}
            <LineInput
              label="C. Areas of Specialization / Skills (please specify)"
              value={data.skills}
              onChange={onChange("skills")}
            />

            {/* D. Community Activities */}
            <div>
              <div className="text-[11px] text-gray-700 mb-1">
                D. Involvement in Community Activities (check all applicable)
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <Check
                  label="Medical"
                  checked={data.community.medical}
                  onChange={onCheck("community.medical")}
                />
                <Check
                  label="Neighborhood Support Services"
                  checked={data.community.neighborhoodSupport}
                  onChange={onCheck("community.neighborhoodSupport")}
                />
                <Check
                  label="Resource Volunteer"
                  checked={data.community.resourceVolunteer}
                  onChange={onCheck("community.resourceVolunteer")}
                />
                <Check
                  label="Religious"
                  checked={data.community.religious}
                  onChange={onCheck("community.religious")}
                />
                <Check
                  label="Community Beautification"
                  checked={data.community.communityBeautification}
                  onChange={onCheck("community.communityBeautification")}
                />
                <Check
                  label="Counseling / Referral"
                  checked={data.community.counselingReferral}
                  onChange={onCheck("community.counselingReferral")}
                />
                <Check
                  label="Community / Organizational Leader"
                  checked={data.community.communityLeader}
                  onChange={onCheck("community.communityLeader")}
                />
                <Check
                  label="Sponsorship"
                  checked={data.community.sponsorship}
                  onChange={onCheck("community.sponsorship")}
                />
              </div>
              <LineInput
                className="mt-2"
                label="Others, specify"
                value={data.community.others}
                onChange={onChange("community.others")}
              />
            </div>
          </Section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mb-8 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-sm rounded border"
            >
              Print
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white"
            >
              Register
            </button>
          </div>
        </form>

        {/* Minimal print styles */}
        <style>{`
        @media print {
          input, label, button { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .border { border-color: #000 !important; }
        }
      `}</style>
      </div>
    </>
  );
}
