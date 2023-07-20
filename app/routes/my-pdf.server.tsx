import { Page, Document, View, StyleSheet, Text } from "@react-pdf/renderer";
import { LoaderFunction, redirect } from "@remix-run/node";
import { Props } from "react-spring-bottom-sheet/dist/types";
import { authenticator } from "~/utils/auth.server";

export let loader: LoaderFunction = async ({ request }) => {
  // let user = await authenticator.isAuthenticated(request);
  // if (!user) return redirect("/");
  // let data = await api(user.token).getDataForThePDF();
  // return { data }
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

export default function PDF() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>Section #1</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
  );
}
