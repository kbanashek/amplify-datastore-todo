import { useTaskTranslation } from "@orion/task-system";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "../src/constants/AppColors";

export default function NotFoundScreen() {
  const { t } = useTaskTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("errors.notFound.screenTitle") }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t("errors.notFound.title")}</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t("errors.notFound.homeLink")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: AppColors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: AppColors.CIBlue,
    fontSize: 16,
  },
});
