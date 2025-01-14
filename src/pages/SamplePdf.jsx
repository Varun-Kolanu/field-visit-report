import React from "react";
import { Page, Text, View, Document, PDFDownloadLink } from "@react-pdf/renderer";
import { StyleSheet } from "@react-pdf/renderer";

// React-PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  fieldContainer: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 12,
    padding: 10,
    border: "1px solid #000",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
  },
  stamp: {
    fontSize: 10,
    textAlign: "left",
  },
  signature: {
    fontSize: 10,
    textAlign: "right",
  },
});

// Component to render PDF
const MyPDFDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Title */}
      <Text style={styles.title}>{data.title}</Text>

      {/* Form Fields */}
      {data.fields.map((field, index) => (
        <View key={index} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>{field.label}:</Text>
          <Text style={styles.fieldValue}>{field.value}</Text>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.stamp}>{data.stampText}</Text>
        <Text style={styles.signature}>{data.signatureText}</Text>
      </View>
    </Page>
  </Document>
);

const PDFGenerator = () => {
  // Sample JSON data
  const sampleData = {
    title: "Certificate of Completion",
    fields: [
      { label: "Name", value: "John Doe" },
      { label: "Course", value: "Advanced React Development" },
      { label: "Completion Date", value: "15th January 2025" },
    ],
    stampText: "Official Seal",
    signatureText: "Principal's Signature",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">PDF Generator</h1>
      <PDFDownloadLink
        document={<MyPDFDocument data={sampleData} />}
        fileName="document.pdf"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
      </PDFDownloadLink>
    </div>
  );
};

export default PDFGenerator;
