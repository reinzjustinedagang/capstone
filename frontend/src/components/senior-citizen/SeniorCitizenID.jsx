import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import user from "../../assets/user.png";
import oscaLogo from "../../assets/osca-sj.png"; // Import your OSCA logo here
import municipalSeal from "../../assets/osca-logo.png"; // Import your municipal seal here

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
  idContainer: {
    border: "2px solid #000",
    borderRadius: 8,
    backgroundColor: "#f8f9ff",
    padding: 0,
    width: 350,
    height: 220,
    position: "relative",
  },
  header: {
    textAlign: "center",
    fontSize: 11,
    paddingTop: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    color: "#000",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 10,
  },
  logo: {
    width: 35,
    height: 35,
  },
  headerText: {
    alignItems: "center",
    fontSize: 10,
    color: "#333",
    flexGrow: 1,
    paddingHorizontal: 8,
  },
  body: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 4,
  },
  infoSection: {
    flexGrow: 1,
    paddingRight: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 10,
  },
  label: {
    fontWeight: "medium",
    width: 50,
    color: "#333",
  },
  value: {
    flexGrow: 1,
    borderBottom: "1px solid #333",
    paddingBottom: 1,
    color: "#000",
  },
  bottomRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
    fontSize: 9,
    alignItems: "flex-start",
  },
  dateColumn: {
    width: 65,
  },
  sexColumn: {
    width: 25,
  },
  dateIssuedColumn: {
    width: 75,
  },
  columnLabel: {
    fontSize: 7,
    color: "#333",
    marginTop: 3,
    textAlign: "center",
  },
  photo: {
    width: 72,
    height: 72,
    border: "1px solid #000",
  },
  footer: {
    position: "absolute",
    bottom: 13,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between", // signature left, control right
    alignItems: "flex-end",
  },

  signatureSection: {
    flexGrow: 1,
    fontSize: 10,
    color: "#333",
    textAlign: "start",
    borderBottom: "1px solid #333",
    width: 100,
    paddingBottom: 1,
  },

  controlSection: {
    fontSize: 10,
    color: "#333",
    borderBottom: "1px solid #333",
  },

  nonTransferable: {
    position: "absolute",
    bottom: 0, // stick to bottom
    left: 0,
    right: 0,
    textAlign: "center", // center horizontally
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },

  backContainer: {
    width: 350,
    height: 220,
    border: "2px solid #000",
    borderRadius: 8,
    backgroundColor: "#f8f9ff",
    padding: 12,
    fontSize: 8,
  },
  benefitsTitle: {
    textAlign: "center",
    fontWeight: "medium",
    marginBottom: 8,
    fontSize: 10,
    borderBottom: "1px solid #000",
    paddingBottom: 6,
    width: "100%",
  },
  benefitItem: {
    marginBottom: 2,
    fontSize: 8,
    lineHeight: 1.3,
  },
  footerText: {
    marginTop: 10,
    fontSize: 8,
    textAlign: "center",
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    paddingHorizontal: 20,
  },

  signatureBlock: {
    alignItems: "center",
    width: 150,
  },

  nameText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },

  designationText: {
    fontSize: 8,
    textAlign: "center",
    marginTop: 2,
    borderTop: "1px solid #333",
    width: 130,
  },
  infoBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 100,
  },
  bottomValue: {
    fontSize: 10,
    fontWeight: "medium",
  },
  columnLabel: {
    fontSize: 10,
    borderTop: "1pt solid #000", // adds line above
    marginTop: 2,
    paddingTop: 2,
    textAlign: "center",
    color: "#333",
  },
});

const SeniorCitizenID = ({
  name = "JESSIELOU R. MADRIAGA",
  address = "Labangan, Poblacion",
  municipality = "San Jose, Occ. Mindoro",
  dob = "10-12-61",
  sex = "F",
  dateIssued = "10-22-2021",
  controlNo = "5100026-946",
  photoUrl = user,
  oscaLogoUrl = oscaLogo,
  municipalSealUrl = municipalSeal,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* FRONT */}
      <View style={styles.idContainer}>
        <View style={styles.headerRow}>
          <Image style={styles.logo} src={oscaLogoUrl} />
          <View style={styles.headerText}>
            <Text style={{ fontSize: 11, fontWeight: "bold" }}>
              Republic of the Philippines
            </Text>
            <Text style={{ fontSize: 10, fontWeight: "bold", marginTop: 1 }}>
              Office for Senior Citizens Affairs (OSCA)
            </Text>
            <Text style={{ fontSize: 9, marginTop: 1 }}>
              San Jose, Occidental Mindoro
            </Text>
          </View>
          <Image style={styles.logo} src={municipalSealUrl} />
        </View>

        <View style={styles.body}>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}></Text>
              <Text style={styles.value}>{municipality}</Text>
            </View>
          </View>
          <Image style={styles.photo} src={photoUrl} />
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.bottomValue}>{dob}</Text>
            <Text style={styles.columnLabel}>Date of Birth</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.bottomValue}>{sex}</Text>
            <Text style={styles.columnLabel}>Sex</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.bottomValue}>{dateIssued}</Text>
            <Text style={styles.columnLabel}>Date Issued</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.signatureSection}>Signature/Thumbmark</Text>
          <Text style={styles.controlSection}>
            Control No. <Text style={{ fontWeight: "bold" }}>5100-</Text>
            {controlNo}
          </Text>
        </View>

        <Text style={styles.nonTransferable}>
          This card is non-transferrable
        </Text>
      </View>

      {/* BACK */}
      <View style={{ marginTop: 20 }}>
        <View style={styles.backContainer}>
          <Text style={styles.benefitsTitle}>
            Benefits and Privileges under RA 9994
          </Text>

          <Text style={styles.benefitItem}>
            • Free medical/dental, diagnostic & laboratory service in all
            government facilities
          </Text>
          <Text style={styles.benefitItem}>
            • 20% discount for professional fees of attending physician/s and
            licensed health care providers
          </Text>
          <Text style={styles.benefitItem}>• 20% discount for medicines</Text>
          <Text style={styles.benefitItem}>
            • 20% discount in essential medical supplies, accessories and
            equipment purchases
          </Text>
          <Text style={styles.benefitItem}>
            • 20% discount in funeral and burial services
          </Text>
          <Text style={styles.benefitItem}>
            • 20% discount in hotels, restaurants, recreation centers
          </Text>
          <Text style={styles.benefitItem}>
            • 20% discount in theaters, cinema houses and concert halls
          </Text>
          <Text style={styles.benefitItem}>
            • 20% discount in medical/dental services, diagnostic & laboratory
            fees in private facilities
          </Text>
          <Text style={styles.benefitItem}>
            • 5% discount in fare for domestic air, sea travel and public land
            transportation
          </Text>
          <Text style={styles.benefitItem}>
            • 5% discount in basic necessities and prime commodities
          </Text>
          <Text style={styles.benefitItem}>
            • 12% VAT exemption on the purchase of goods & services which are
            entitled to the 20% discount
          </Text>
          <Text style={styles.benefitItem}>
            • 5% discount for the monthly utilization of water and electricity,
            provided that the water and electricity meter bases are under the
            name of the senior citizens
          </Text>

          <Text style={styles.footerText}>
            Persons and Corporations violating under 9994 shall be penalized.
            Only for the exclusive use of Senior Citizens: abuse of privileges
            is punishable by law.
          </Text>

          <View style={styles.signatureArea}>
            {/* Left side */}
            <View style={styles.signatureBlock}>
              <Text style={styles.nameText}>ALICIA M. CAJAYON</Text>
              <Text style={styles.designationText}>
                MSWO Officer / OIC-OSCA Head
              </Text>
            </View>

            {/* Right side */}
            <View style={styles.signatureBlock}>
              <Text style={styles.nameText}>REY C. LADAGA</Text>
              <Text style={styles.designationText}>Municipal Mayor</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default SeniorCitizenID;
