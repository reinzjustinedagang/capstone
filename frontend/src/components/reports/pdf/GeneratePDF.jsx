import React, { useEffect, useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import axios from "axios";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, textAlign: "center", marginBottom: 20 },
  header: {
    flexDirection: "row",
    borderBottom: "1pt solid black",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottom: "0.5pt solid #ccc",
  },
  col: { flex: 1, fontSize: 10, paddingHorizontal: 2 },
});

const SeniorPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Senior Citizen Records</Text>

      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.col}>#</Text>
        <Text style={styles.col}>First Name</Text>
        <Text style={styles.col}>Last Name</Text>
        <Text style={styles.col}>Age</Text>
        <Text style={styles.col}>Barangay</Text>
      </View>

      {/* Data Rows */}
      {data.map((sc, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.col}>{index + 1}</Text>
          <Text style={styles.col}>{sc.firstName}</Text>
          <Text style={styles.col}>{sc.lastName}</Text>
          <Text style={styles.col}>{sc.age}</Text>
          <Text style={styles.col}>{sc.barangay_name || "N/A"}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

const GeneratePDF = () => {
  const [seniors, setSeniors] = useState([]);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${backendUrl}/api/senior-citizens`, {
        withCredentials: true,
      });
      setSeniors(res.data || []);
    };
    fetchData();
  }, []);

  return (
    <div>
      <PDFDownloadLink
        document={<SeniorPDF data={seniors} />}
        fileName="senior_citizens.pdf"
      >
        {({ loading }) =>
          loading ? (
            <button className="px-4 py-2 bg-gray-400 text-white rounded-lg">
              Preparing PDF...
            </button>
          ) : (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Download PDF
            </button>
          )
        }
      </PDFDownloadLink>
    </div>
  );
};

export default GeneratePDF;
